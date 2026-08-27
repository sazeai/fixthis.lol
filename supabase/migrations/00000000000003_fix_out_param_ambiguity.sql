-- Fix PL/pgSQL OUT-parameter / column-name ambiguity.
--
-- Three functions declare `returns table(...)` output columns whose names also
-- exist as columns on the tables they update. Postgres cannot tell which one a
-- bare reference means and raises 42702 at call time:
--
--   support_problem            -> support_count      (every "I have this too" failed)
--   assign_featured_placement  -> impression_count   (every served impression would fail)
--   create_bid_quote           -> expires_at         (every bid checkout would fail)
--
-- The output column names are part of the public JSON contract, so they are kept
-- and every ambiguous reference is qualified with its table instead.

create or replace function public.support_problem(
  p_problem_id uuid,
  p_visitor_key text,
  p_detail text default null,
  p_detail_status text default 'none'
)
returns table(inserted boolean, support_count integer)
language plpgsql security definer set search_path = public as $$
declare
  v_inserted boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_problem_id::text || ':' || p_visitor_key, 0));

  insert into public.problem_supports(problem_id, visitor_key, detail, detail_status)
  values (p_problem_id, p_visitor_key, p_detail, p_detail_status)
  on conflict (problem_id, visitor_key) do nothing;
  v_inserted := found;

  if v_inserted then
    update public.problems
      set support_count = problems.support_count + 1, last_support_at = now()
      where id = p_problem_id and status = 'published';
  elsif p_detail is not null then
    -- A returning visitor may add the detail they skipped the first time,
    -- but cannot overwrite one they already left.
    update public.problem_supports ps
      set detail = coalesce(ps.detail, p_detail),
          detail_status = case when ps.detail is null then p_detail_status else ps.detail_status end,
          updated_at = now()
      where ps.problem_id = p_problem_id and ps.visitor_key = p_visitor_key;
  end if;

  return query select v_inserted, p.support_count from public.problems p where p.id = p_problem_id;
end;
$$;

create or replace function public.assign_featured_placement(p_problem_id uuid, p_visitor_key text)
returns table(
  placement_id uuid,
  product_id uuid,
  product_name text,
  product_tagline text,
  destination_url text,
  registrable_domain text,
  claim_kind text,
  impression_count bigint,
  click_count bigint
)
language plpgsql security definer set search_path = public as $$
declare
  v_assignment public.visitor_assignments%rowtype;
  v_epoch public.rotation_epochs%rowtype;
  v_placement_id uuid;
  v_assignment_id uuid;
begin
  -- A visitor keeps the same featured solution for 30 minutes, so refreshing
  -- neither inflates impressions nor makes the page look schizophrenic.
  select a.* into v_assignment
  from public.visitor_assignments a
  join public.placements pl on pl.id = a.placement_id and pl.status = 'active'
  join public.products pr on pr.id = pl.product_id and pr.status = 'active'
  where a.problem_id = p_problem_id and a.visitor_key = p_visitor_key and a.expires_at > now()
  order by a.assigned_at desc limit 1;

  if v_assignment.id is not null then
    return query
      select pl.id, pr.id, pr.name, pr.tagline, pr.destination_url, pr.registrable_domain,
             case when pl.founding_claim and pl.current_bid_cents = 0 then 'founding' else 'paid' end,
             pl.impression_count, pl.click_count
      from public.placements pl join public.products pr on pr.id = pl.product_id
      where pl.id = v_assignment.placement_id;
    return;
  end if;

  select * into v_epoch from public.rotation_epochs
  where problem_id = p_problem_id and active for update;

  if v_epoch.id is null then
    perform public.rebuild_rotation(p_problem_id);
    select * into v_epoch from public.rotation_epochs
    where problem_id = p_problem_id and active for update;
  end if;
  if v_epoch.id is null then return; end if;

  v_placement_id := v_epoch.slots[v_epoch.cursor + 1];
  update public.rotation_epochs set cursor = mod(rotation_epochs.cursor + 1, 100) where id = v_epoch.id;

  insert into public.visitor_assignments(problem_id, placement_id, epoch_id, visitor_key, expires_at)
  values (p_problem_id, v_placement_id, v_epoch.id, p_visitor_key, now() + interval '30 minutes')
  returning id into v_assignment_id;

  insert into public.placement_impressions(assignment_id, problem_id, placement_id, visitor_key)
  values (v_assignment_id, p_problem_id, v_placement_id, p_visitor_key);

  update public.placements set impression_count = placements.impression_count + 1 where id = v_placement_id;
  update public.problems set impression_count = problems.impression_count + 1 where id = p_problem_id;

  insert into public.daily_traffic(traffic_date, problem_id, placement_id, impressions)
    values (current_date, p_problem_id, v_placement_id, 1)
    on conflict (traffic_date, placement_id) do update set impressions = public.daily_traffic.impressions + 1;

  return query
    select pl.id, pr.id, pr.name, pr.tagline, pr.destination_url, pr.registrable_domain,
           case when pl.founding_claim and pl.current_bid_cents = 0 then 'founding' else 'paid' end,
           pl.impression_count, pl.click_count
    from public.placements pl join public.products pr on pr.id = pl.product_id
    where pl.id = v_placement_id;
end;
$$;

create or replace function public.create_bid_quote(
  p_problem_id uuid,
  p_registrable_domain text,
  p_product_name text,
  p_product_tagline text,
  p_destination_url text,
  p_owner_email text,
  p_amount_cents integer
)
returns table(quote_id uuid, minimum_cents integer, expires_at timestamptz)
language plpgsql security definer set search_path = public as $$
declare
  v_max integer;
  v_minimum integer;
  v_quote_id uuid;
  v_expires timestamptz := now() + interval '15 minutes';
  v_owner text;
begin
  perform pg_advisory_xact_lock(hashtextextended('bid:' || p_problem_id::text, 0));

  update public.bid_quotes q set status = 'expired'
    where q.problem_id = p_problem_id and q.status in ('held', 'checkout_created') and q.expires_at <= now();

  select p.owner_email into v_owner from public.products p where p.registrable_domain = p_registrable_domain;
  if v_owner is not null and lower(v_owner) <> lower(p_owner_email) then
    raise exception 'This product is managed by another email address.' using errcode = '22023';
  end if;

  -- The floor is the highest settled bid or any live quote, so two concurrent
  -- checkouts cannot both buy the same minimum.
  select greatest(
    coalesce((select max(pl.current_bid_cents) from public.placements pl where pl.problem_id = p_problem_id and pl.status = 'active'), 0),
    coalesce((select max(q.amount_cents) from public.bid_quotes q where q.problem_id = p_problem_id and q.status in ('held', 'checkout_created') and q.expires_at > now()), 0)
  ) into v_max;
  v_minimum := case when v_max = 0 then 500 else v_max + 500 end;
  if p_amount_cents < v_minimum then
    raise exception 'Minimum bid is % cents.', v_minimum using errcode = '22023';
  end if;

  update public.bid_quotes q set status = 'cancelled'
    where q.problem_id = p_problem_id and q.registrable_domain = p_registrable_domain
      and q.status in ('held', 'checkout_created') and q.expires_at > now();

  insert into public.bid_quotes(
    problem_id, registrable_domain, product_name, product_tagline,
    destination_url, owner_email, amount_cents, expires_at
  ) values (
    p_problem_id, p_registrable_domain, p_product_name, p_product_tagline,
    p_destination_url, lower(p_owner_email), p_amount_cents, v_expires
  ) returning id into v_quote_id;

  return query select v_quote_id, v_minimum, v_expires;
end;
$$;
