-- Remove the advertising auction.
--
-- FIXTHIS stops being "founders buy the attention around a complaint" and
-- becomes "competing products answer the complaint". Nothing here is
-- salvageable for that: rotation, impressions, bids and the money that
-- ordered them all existed to rank advertisers, and ranking advertisers is
-- exactly what made the buyer's side of the site unreadable.
--
-- `products` and `placements` survive. They are the only two tables that
-- describe a real relationship — a product, and that product against a
-- problem — which is what an offer is. A later migration reshapes them.

-- ── Triggers and advertiser columns ──────────────────────────────────────────
--
-- Addressed dynamically because this migration has to survive being re-run
-- after the next one has already renamed `placements` to `offers`. A literal
-- `on public.placements` would abort the whole file at that point.

do $$
declare
  t text := case
    when to_regclass('public.placements') is not null then 'placements'
    when to_regclass('public.offers') is not null then 'offers'
  end;
begin
  if t is null then return; end if;

  execute format('drop trigger if exists placements_market_event on public.%I', t);
  execute format('drop trigger if exists placements_rotation_lock on public.%I', t);
  execute format('drop trigger if exists placements_rotation_sync on public.%I', t);

  -- Columns that only ever existed to price or rank an advertiser.
  execute format($f$
    alter table public.%I
      drop column if exists current_bid_cents,
      drop column if exists founding_claim,
      drop column if exists settled_at,
      drop column if exists impression_count,
      drop column if exists event_text,
      drop column if exists event_text_updated_at
  $f$, t);
end;
$$;

-- ── Functions ────────────────────────────────────────────────────────────────
--
-- Dropped by name rather than by signature: several of these were redefined
-- with different argument lists across migrations 3, 4, 10, 12 and 14, so a
-- hardcoded signature here would silently fail to match and leave the function
-- behind.

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'rebuild_rotation',
        'rebuild_rotation_for_placement',
        'lock_rotation_for_placement',
        'assign_featured_placement',
        'record_placement_click',
        'create_bid_quote',
        'release_bid_quote',
        'settle_bid',
        'reconcile_bid_state',
        'log_placement_event',
        'record_market_event'
      )
  loop
    execute format('drop function if exists %s cascade', fn.sig);
  end loop;
end;
$$;

-- ── Tables ───────────────────────────────────────────────────────────────────

-- Order matters: children before parents.
drop table if exists public.placement_impressions;
drop table if exists public.placement_clicks;
drop table if exists public.daily_traffic;
drop table if exists public.visitor_assignments;
drop table if exists public.rotation_epochs;
drop table if exists public.bids;
drop table if exists public.bid_quotes;
drop table if exists public.market_events;

-- The live-visitor counter was atmosphere, and it cost a write per heartbeat
-- per tab. `visitors` stays: the 24h unique count is a real measurement rather
-- than a performance of activity.
drop table if exists public.visitor_presence;

-- ── Problem counters that measured advertising ───────────────────────────────

alter table public.problems
  drop column if exists impression_count,
  drop column if exists last_bid_at;

drop index if exists public.placements_problem_rank_idx;

-- `moderation_audit` outlives the things it audited: keep the history, stop
-- accepting new bid rows, and admit the noun the next migration introduces.
alter table public.moderation_audit
  drop constraint if exists moderation_audit_entity_type_check;
alter table public.moderation_audit
  add constraint moderation_audit_entity_type_check
  check (entity_type in ('problem', 'support_detail', 'product', 'placement', 'offer'));

-- ── support_problem, without the market event ────────────────────────────────
--
-- Byte-for-byte the migration 11 contract minus the floating-label side
-- effect. The two guards below are deliberate and must survive: the count only
-- moves for a published problem, and `coalesce` means a returning visitor may
-- add the sentence they skipped but cannot overwrite one they already left.

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
    update public.problem_supports ps
      set detail = coalesce(ps.detail, p_detail),
          detail_status = case when ps.detail is null then p_detail_status else ps.detail_status end,
          updated_at = now()
      where ps.problem_id = p_problem_id and ps.visitor_key = p_visitor_key;
  end if;

  return query select v_inserted, p.support_count from public.problems p where p.id = p_problem_id;
end;
$$;

-- ── Retention sweep, without the traffic tables ──────────────────────────────

-- Four of the six things this used to sweep no longer exist. Postgres cannot
-- narrow a function's return type in place, so drop it first — `create or
-- replace` fails with 42P13.
drop function if exists public.purge_expired_traffic();

create or replace function public.purge_expired_traffic()
returns table(
  subscriptions_deleted bigint,
  visitors_deleted bigint
)
language plpgsql security definer set search_path = public as $$
declare
  v_subscriptions bigint;
  v_visitors bigint;
begin
  -- Unconfirmed email subscriptions are not kept.
  delete from public.problem_subscriptions
  where verified_at is null and created_at < now() - interval '7 days';
  get diagnostics v_subscriptions = row_count;

  -- A visitor who has not returned in a year is no longer a unique visitor.
  delete from public.visitors
  where last_seen_at < now() - interval '365 days';
  get diagnostics v_visitors = row_count;

  return query select v_subscriptions, v_visitors;
end;
$$;

revoke all on all functions in schema public from public, anon, authenticated;
