-- Carry the advertiser's short hook through checkout into the placement.
--
-- It is collected with the bid, held on the quote, and written to the placement
-- at settlement — the same path the amount takes, so a hook can never appear
-- for a payment that did not complete.

alter table public.bid_quotes
  add column if not exists event_text text
    check (event_text is null or char_length(event_text) between 3 and 60);

create or replace function public.create_bid_quote(
  p_problem_id uuid,
  p_registrable_domain text,
  p_product_name text,
  p_product_tagline text,
  p_destination_url text,
  p_owner_email text,
  p_amount_cents integer,
  p_event_text text default null
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
    destination_url, owner_email, amount_cents, expires_at, event_text
  ) values (
    p_problem_id, p_registrable_domain, p_product_name, p_product_tagline,
    p_destination_url, lower(p_owner_email), p_amount_cents, v_expires, nullif(btrim(coalesce(p_event_text, '')), '')
  ) returning id into v_quote_id;

  return query select v_quote_id, v_minimum, v_expires;
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
  v_previous_event text;
begin
  select * into v_quote from public.bid_quotes where id = p_quote_id for update;
  if v_quote.id is null then raise exception 'Quote not found.'; end if;

  if v_quote.status = 'settled' then
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

    select pl.event_text into v_previous_event
    from public.placements pl
    where pl.problem_id = v_quote.problem_id and pl.product_id = v_product_id;

    insert into public.placements(problem_id, product_id, current_bid_cents, status, settled_at, event_text, event_text_updated_at)
    values (v_quote.problem_id, v_product_id, v_quote.amount_cents, 'active', p_settled_at, v_quote.event_text,
            case when v_quote.event_text is null then null else p_settled_at end)
    on conflict (problem_id, product_id) do update set
      current_bid_cents = excluded.current_bid_cents,
      status = 'active', settled_at = excluded.settled_at, updated_at = now(),
      -- Keep the previous hook when this bid did not supply a new one.
      event_text = coalesce(excluded.event_text, public.placements.event_text),
      event_text_updated_at = case
        when excluded.event_text is not null and excluded.event_text is distinct from public.placements.event_text
          then excluded.settled_at
        else public.placements.event_text_updated_at
      end
    returning id into v_placement_id;

    insert into public.bids(quote_id, placement_id, amount_cents, payment_id, checkout_session_id, settled_at)
    values (v_quote.id, v_placement_id, v_quote.amount_cents, p_payment_id, p_checkout_session_id, p_settled_at);

    update public.bid_quotes set status = 'settled', checkout_session_id = p_checkout_session_id where id = v_quote.id;
    update public.problems set last_bid_at = p_settled_at where id = v_quote.problem_id;

    -- A genuinely new hook is its own event, distinct from the bid itself.
    if v_quote.event_text is not null and v_quote.event_text is distinct from v_previous_event then
      perform public.record_market_event(v_quote.problem_id, v_placement_id, 'offer_updated', v_quote.event_text);
    end if;

    perform public.rebuild_rotation(v_quote.problem_id);
  end if;

  select ranked.position into v_rank from (
    select id, row_number() over (order by current_bid_cents desc, settled_at asc, id asc)::integer as position
    from public.placements where problem_id = v_quote.problem_id and status = 'active'
  ) ranked where ranked.id = v_placement_id;
  return query select v_placement_id, v_rank;
end;
$$;
