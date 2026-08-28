-- Product ownership becomes an account capability.
--
-- The first cut of the answer flow let anyone POST an offer with a typed email
-- and derived the "verified" badge from that string. Nothing confirmed the
-- address, so `founder@notion.so` was a free verified badge on an answer
-- published under Notion's name, next to a competitor's complaint. That is
-- impersonation with a trust mark attached.
--
-- The fix is not a new account type. A founder on FIXTHIS is also somebody who
-- uses software and complains about it, so there is one account, and answering
-- as a product is a capability that account earns by proving it controls the
-- product's domain. The magic link is the proof: signing in as
-- founder@flipaeo.com is what demonstrates control of that mailbox.

alter table public.products
  -- The account that owns this product. Null means the product exists but
  -- nobody has claimed it — which is the normal state for a product somebody
  -- named as a switch candidate, and the thing the old schema could not express
  -- because owner_email was NOT NULL.
  add column if not exists claimed_by uuid references auth.users(id) on delete set null,
  add column if not exists claimed_at timestamptz,
  -- URL-safe identity for the product page. Nullable until backfilled.
  add column if not exists slug text,
  add column if not exists created_via text not null default 'vendor'
    check (created_via in ('mention', 'vendor', 'admin'));

-- A product can now exist before anyone claims it.
alter table public.products alter column owner_email drop not null;

create unique index if not exists products_slug_key
  on public.products (slug) where slug is not null;

create index if not exists products_claimed_by_idx
  on public.products (claimed_by) where claimed_by is not null;

comment on column public.products.claimed_by is
  'Account that proved control of this domain by signing in from an address at it. Null = unclaimed.';
comment on column public.products.created_via is
  'mention = named by someone as a switch candidate; vendor = created by its owner; admin = seeded.';

-- ── Offers are written by an account ─────────────────────────────────────────

alter table public.offers
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists offers_created_by_idx
  on public.offers (created_by) where created_by is not null;

comment on column public.offers.verified is
  'The authoring account''s own email is at this product''s registrable domain. Set server-side from the verified session, never from a submitted field.';

-- ── Complaint details are written by an account ──────────────────────────────
--
-- The ME TOO tap stays anonymous — it is the cheapest demand signal there is
-- and gating it would be self-harm. The free-text sentence attached to it does
-- not stay anonymous: it is published prose next to a named company, which is
-- the one surface here worth spamming and the one that creates moderation work.
--
-- `switch_candidate` deliberately remains anonymous. It is a constrained
-- product name, shown only as an aggregate count and never attributed, so there
-- is little to gain by poisoning it and real value in it staying one tap.

alter table public.problem_supports
  add column if not exists detail_author uuid references auth.users(id) on delete set null;

comment on column public.problem_supports.detail_author is
  'Account that wrote the detail sentence. Required for any published prose; null rows must not carry a detail.';

-- Accepts the author alongside everything else. A detail without an author is
-- refused at the database rather than trusted to the route, so no future caller
-- can reintroduce anonymous prose by forgetting a check.

create or replace function public.support_problem(
  p_problem_id uuid,
  p_visitor_key text,
  p_detail text default null,
  p_detail_status text default 'none',
  p_switch_candidate text default null,
  p_detail_author uuid default null
)
returns table(inserted boolean, support_count integer)
language plpgsql security definer set search_path = public as $$
declare
  v_inserted boolean := false;
begin
  if p_detail is not null and p_detail_author is null then
    raise exception 'A complaint detail requires a signed-in author.'
      using errcode = 'check_violation';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(p_problem_id::text || ':' || p_visitor_key, 0));

  insert into public.problem_supports(problem_id, visitor_key, detail, detail_status, switch_candidate, detail_author)
  values (p_problem_id, p_visitor_key, p_detail, p_detail_status, p_switch_candidate, p_detail_author)
  on conflict (problem_id, visitor_key) do nothing;
  v_inserted := found;

  if v_inserted then
    update public.problems
      set support_count = problems.support_count + 1, last_support_at = now()
      where id = p_problem_id and status = 'published';
  elsif p_detail is not null or p_switch_candidate is not null then
    -- A returning visitor may fill in what they skipped, but cannot overwrite
    -- what they already said.
    update public.problem_supports ps
      set detail = coalesce(ps.detail, p_detail),
          detail_status = case when ps.detail is null and p_detail is not null then p_detail_status else ps.detail_status end,
          detail_author = coalesce(ps.detail_author, case when ps.detail is null then p_detail_author end),
          switch_candidate = coalesce(ps.switch_candidate, p_switch_candidate),
          updated_at = now()
      where ps.problem_id = p_problem_id and ps.visitor_key = p_visitor_key;
  end if;

  return query select v_inserted, p.support_count from public.problems p where p.id = p_problem_id;
end;
$$;

-- The 5-argument version is now ambiguous for callers that omit the tail.
drop function if exists public.support_problem(uuid, text, text, text, text);

revoke all on all functions in schema public from public, anon, authenticated;
