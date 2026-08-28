-- Purge everything the auction left behind.
--
-- Migration 16 kept legacy placements as hidden rows rather than fabricating
-- answers nobody wrote. That was the right call for data that might have been
-- worth something; it isn't. A placement recorded that a product bought a slot,
-- and there is no honest way to render that as "here is how we solve your
-- problem". So it goes, along with the advertiser accounts that only existed to
-- own one.
--
-- After this migration the database holds:
--   problems, problem_supports, problem_subscriptions, problem_reports,
--   products, offers, visitors, moderation_audit
--   payment_webhook_events — no reader yet, kept for billing (see below)
--
-- Deliberately KEPT:
--   problem_subscriptions rows — real people who asked to be emailed. The
--     promise changed from "when it is claimed" to "when an alternative
--     answers", which is the same promise in the new vocabulary.
--   problems with origin = 'founder' — a problem added through the old
--     add-and-claim flow is still a real problem.
--   problem_supports — real demand, and the only thing here that was ever
--     scarce.

-- ── The placements themselves ────────────────────────────────────────────────

delete from public.offers;

-- Every product row was created by the bid checkout as an advertiser account.
-- Nothing references them now, and in the new model a product record is created
-- the moment someone writes an answer. Starting empty is more honest than
-- carrying accounts for products that never said anything.
delete from public.products;

-- ── Audit history for entities that no longer exist ──────────────────────────

delete from public.moderation_audit where entity_type in ('placement', 'bid');

alter table public.moderation_audit
  drop constraint if exists moderation_audit_entity_type_check;
alter table public.moderation_audit
  add constraint moderation_audit_entity_type_check
  check (entity_type in ('problem', 'support_detail', 'product', 'offer'));

-- ── Kept: payment_webhook_events ─────────────────────────────────────────────
--
-- No reader today, and it stays anyway. It is the idempotency ledger that stops
-- a replayed payment webhook being processed twice, it is three columns and no
-- rows, and the payment plumbing it belongs to is parked intact under
-- `parked/billing/` rather than thrown away. Dropping it would buy nothing and
-- cost a re-derivation later.

-- ── An index nothing queries ─────────────────────────────────────────────────
--
-- Near-duplicate detection was specified against pg_trgm and then implemented
-- in JavaScript: POST /api/problems fetches up to 300 normalised statements and
-- scores them with diceSimilarity. No query has ever used this GIN index, so it
-- has only ever cost write amplification on every insert.

drop index if exists public.problems_normalized_trgm_idx;
drop extension if exists pg_trgm;

-- `normalized_statement` itself stays: it is selected by the duplicate check and
-- carries the unique constraint that stops exact reposts.

-- ── What is left ─────────────────────────────────────────────────────────────
--
-- Functions after this migration: touch_updated_at, support_problem,
-- report_problem, purge_expired_traffic, record_offer_click.
--
-- Verify with:
--   select tablename from pg_tables where schemaname = 'public' order by 1;
--   select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--     where n.nspname = 'public' order by 1;
