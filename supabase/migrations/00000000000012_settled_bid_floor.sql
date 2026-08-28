-- Stop unpaid checkouts from setting the price.
--
-- create_bid_quote computed the bid floor as the greatest of the highest
-- settled placement AND the highest live quote, where a "live" quote is any
-- checkout that has been started and not yet paid. Three things went wrong.
--
-- First, the floor was read before the block that cancels this domain's own
-- live quotes, so a founder who abandoned a checkout at $27 came back to a $32
-- minimum caused entirely by their own unpaid attempt. Abandoning again made it
-- $37. The ratchet only ever pointed at the person trying to pay.
--
-- Second, nothing outside this function agreed with it. Every next_bid_cents
-- the site renders is derived from settled placements alone, so the page
-- advertised $27+, pre-filled 27, and the server answered "Minimum bid is 3200
-- cents." No refresh could reconcile the two, because the refresh recomputed
-- the same settled-only number.
--
-- Third, it was free to abuse. Starting checkouts on a rival's problem and
-- walking away raised that problem's entry price for everyone, at no cost and
-- with no payment ever taken.
--
-- The floor is now the highest settled placement plus the increment, full stop
-- - the same arithmetic the read path already uses, so the number on the page
-- is the number the server enforces. Two founders may now settle at the same
-- amount; they rank by settled_at, which the ranking has always tiebroken.
-- What is being sold is a rank, not an exclusive slot, so both are served.

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
  -- Still serialised: the floor is read and the quote written against a
  -- settlement that could land in between.
  perform pg_advisory_xact_lock(hashtextextended('bid:' || p_problem_id::text, 0));

  update public.bid_quotes q set status = 'expired'
    where q.problem_id = p_problem_id and q.status in ('held', 'checkout_created') and q.expires_at <= now();

  select p.owner_email into v_owner from public.products p where p.registrable_domain = p_registrable_domain;
  if v_owner is not null and lower(v_owner) <> lower(p_owner_email) then
    raise exception 'This product is managed by another email address.' using errcode = '22023';
  end if;

  -- Settled money only. An unpaid checkout is an intention, and an intention
  -- must not move a published price.
  select coalesce((
    select max(pl.current_bid_cents) from public.placements pl
    where pl.problem_id = p_problem_id and pl.status = 'active'
  ), 0) into v_max;
  v_minimum := case when v_max = 0 then 500 else v_max + 500 end;
  if p_amount_cents < v_minimum then
    raise exception 'Minimum bid is % cents.', v_minimum using errcode = '22023';
  end if;

  -- One live quote per domain per problem. This no longer affects the price;
  -- it just stops a founder accumulating dead checkouts by retrying.
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

-- Releasing a hold when the founder backs out of Dodo's hosted checkout.
--
-- Only ever moves a quote that is still waiting. A settled quote is untouched,
-- so a webhook that arrives while the browser is returning cannot be undone by
-- the redirect that follows it.
create or replace function public.release_bid_quote(p_quote_id uuid)
returns boolean
language plpgsql security definer set search_path = public as $$
declare
  v_released boolean;
begin
  update public.bid_quotes set status = 'cancelled'
    where id = p_quote_id and status in ('held', 'checkout_created')
    returning true into v_released;
  return coalesce(v_released, false);
end;
$$;

-- A verified payment settles whatever the quote's hold says.
--
-- settle_bid used to refuse any quote that was not 'held' or 'checkout_created'
-- and raise "Quote is not payable." The webhook treats a raise as a failure,
-- deletes its idempotency row and returns 500, so Dodo retries into the same
-- wall: the money is captured and no placement is ever created. That was
-- already reachable through the 15-minute expiry - pay slowly enough and the
-- quote expires underneath you - and releasing holds on cancel would widen it.
--
-- The webhook has already verified the signature, the product, the currency,
-- the checkout session and the amount before calling this. Once money has
-- genuinely changed hands the hold has nothing left to say, so the checks that
-- remain are the ones deciding whether this payment matches this quote.
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

-- Migration 01 revoked every function that existed then, and CREATE OR REPLACE
-- keeps the privileges of the function it replaces. release_bid_quote is new,
-- so it would otherwise be created with Postgres's default EXECUTE to PUBLIC
-- and be reachable over PostgREST as anon. It is only ever called by the
-- service role from the API route.
revoke all on function public.release_bid_quote(uuid) from public, anon, authenticated;
