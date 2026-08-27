-- Second pass on OUT-parameter / column ambiguity.
--
-- Migration 3 qualified the ambiguous references inside UPDATE ... SET, which
-- fixed support_problem and create_bid_quote. It missed that PL/pgSQL also
-- resolves ON CONFLICT conflict-target columns against declared variables, so
-- assign_featured_placement still failed with:
--
--   42702: column reference "placement_id" is ambiguous
--
-- on `on conflict (traffic_date, placement_id)`, because placement_id is one of
-- the function's `returns table(...)` output columns.
--
-- A conflict target has to name a real column, so it cannot be table-qualified
-- the way a SET expression can. The reliable fix is the documented
-- `#variable_conflict use_column` pragma: wherever a name is ambiguous, prefer
-- the column. Both functions below only ever WRITE their output columns via a
-- final `return query`, never read them as variables, so preferring the column
-- is correct everywhere it applies.
--
-- settle_bid gets the same treatment defensively: it also declares placement_id
-- as an output column and inserts into tables that have a placement_id column,
-- and it only runs during a live payment webhook where a failure is expensive.

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
#variable_conflict use_column
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

create or replace function public.settle_bid(
  p_quote_id uuid,
  p_payment_id text,
  p_checkout_session_id text,
  p_amount_cents integer,
  p_settled_at timestamptz
)
returns table(placement_id uuid, rank integer)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_quote public.bid_quotes%rowtype;
  v_product_id uuid;
  v_placement_id uuid;
  v_rank integer;
begin
  select * into v_quote from public.bid_quotes where id = p_quote_id for update;
  if v_quote.id is null then raise exception 'Quote not found.'; end if;

  if v_quote.status = 'settled' then
    -- Replayed webhook: report the existing placement instead of double-charging.
    select b.placement_id into v_placement_id from public.bids b where b.quote_id = p_quote_id;
  else
    if v_quote.status not in ('held', 'checkout_created') then raise exception 'Quote is not payable.'; end if;
    if v_quote.checkout_session_id is not null and v_quote.checkout_session_id <> p_checkout_session_id then raise exception 'Checkout session mismatch.'; end if;
    if v_quote.amount_cents <> p_amount_cents then raise exception 'Paid amount mismatch.'; end if;

    insert into public.products(registrable_domain, name, tagline, destination_url, owner_email)
    values (v_quote.registrable_domain, v_quote.product_name, v_quote.product_tagline, v_quote.destination_url, lower(v_quote.owner_email))
    on conflict (registrable_domain) do update set
      name = excluded.name, tagline = excluded.tagline, destination_url = excluded.destination_url, updated_at = now()
    where lower(public.products.owner_email) = lower(excluded.owner_email)
    returning id into v_product_id;
    if v_product_id is null then raise exception 'Product ownership mismatch.'; end if;

    insert into public.placements(problem_id, product_id, current_bid_cents, status, settled_at)
    values (v_quote.problem_id, v_product_id, v_quote.amount_cents, 'active', p_settled_at)
    on conflict (problem_id, product_id) do update set
      current_bid_cents = excluded.current_bid_cents,
      status = 'active', settled_at = excluded.settled_at, updated_at = now()
    returning id into v_placement_id;

    insert into public.bids(quote_id, placement_id, amount_cents, payment_id, checkout_session_id, settled_at)
    values (v_quote.id, v_placement_id, v_quote.amount_cents, p_payment_id, p_checkout_session_id, p_settled_at);

    update public.bid_quotes set status = 'settled', checkout_session_id = p_checkout_session_id where id = v_quote.id;
    update public.problems set last_bid_at = p_settled_at where id = v_quote.problem_id;
    perform public.rebuild_rotation(v_quote.problem_id);
  end if;

  select ranked.position into v_rank from (
    select id, row_number() over (order by current_bid_cents desc, settled_at asc, id asc)::integer as position
    from public.placements where problem_id = v_quote.problem_id and status = 'active'
  ) ranked where ranked.id = v_placement_id;
  return query select v_placement_id, v_rank;
end;
$$;
