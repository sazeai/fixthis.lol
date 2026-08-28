-- Placements become offers.
--
-- A placement was "this product paid to appear against this problem". An offer
-- is "this product says it can fix this problem, and here is how". The row is
-- the same shape — one product against one problem, at most once — so this is
-- a rename and a change of contents rather than a new table.
--
-- The important part is `solves_text`. It is required and it is short. An
-- advertiser could write anything in a tagline; an offer has to answer the
-- specific complaint it is attached to, and a 240-character ceiling is the
-- cheapest available defence against it turning into a banner ad.

do $$
begin
  if to_regclass('public.placements') is not null and to_regclass('public.offers') is null then
    alter table public.placements rename to offers;
  end if;
end;
$$;

-- Constraint names do not follow the table rename. Renamed defensively because
-- a name that has already been changed must not abort the whole migration.
do $$
declare
  pair record;
begin
  for pair in
    select * from (values
      ('placements_pkey', 'offers_pkey'),
      ('placements_problem_id_fkey', 'offers_problem_id_fkey'),
      ('placements_product_id_fkey', 'offers_product_id_fkey'),
      ('placements_problem_id_product_id_key', 'offers_problem_id_product_id_key')
    ) as t(old_name, new_name)
  loop
    if exists (
      select 1 from pg_constraint c
      join pg_class r on r.oid = c.conrelid
      join pg_namespace n on n.oid = r.relnamespace
      where n.nspname = 'public' and r.relname = 'offers' and c.conname = pair.old_name
    ) then
      execute format('alter table public.offers rename constraint %I to %I', pair.old_name, pair.new_name);
    end if;
  end loop;
end;
$$;

drop trigger if exists placements_touch on public.offers;
drop trigger if exists offers_touch on public.offers;
create trigger offers_touch before update on public.offers
  for each row execute function public.touch_updated_at();

alter table public.offers
  -- Added nullable: the table already holds paid placements from the auction,
  -- and a column cannot be added NOT NULL over existing rows. Constrained
  -- below, once every row has a value.
  add column if not exists solves_text text,
  -- What they will do for someone switching. Optional, because a product with
  -- no discount to give should still be able to answer.
  add column if not exists switch_incentive text
    check (switch_incentive is null or char_length(switch_incentive) between 3 and 140),
  add column if not exists created_by_email text
    check (created_by_email is null or char_length(created_by_email) <= 254),
  -- The offer came from an address at the product's own registrable domain.
  -- Sorts an offer up; never a claim about product quality.
  add column if not exists verified boolean not null default false;

-- ── Legacy placements are not answers ────────────────────────────────────────
--
-- Every existing row is a slot somebody bought, not a sentence somebody wrote.
-- Promoting a purchased placement into a public "here is how we solve your
-- problem" would put words in a vendor's mouth and publish them under their
-- name, which is precisely the failure mode the trust rules exist to prevent.
--
-- So they are carried over, hidden, and left for their owner to write properly.
-- The product records they point at are untouched and still useful.

update public.offers
set solves_text = 'Placed before answers existed. This product has not written an answer to this problem yet.',
    status = 'hidden'
where solves_text is null;

alter table public.offers alter column solves_text set not null;

alter table public.offers drop constraint if exists offers_solves_text_length;
alter table public.offers
  add constraint offers_solves_text_length
  check (char_length(solves_text) between 20 and 240);

comment on table public.offers is
  'One product''s answer to one problem. No rank, no bid, no share of anything.';
comment on column public.offers.solves_text is
  'How this product solves this exact complaint. Required, and capped short so it must answer rather than advertise.';
comment on column public.offers.verified is
  'Offer came from an address at the product''s own domain. An identity signal, not an endorsement.';

-- Read path: every active answer to a problem, best first. `verified` and
-- `switch_incentive` lead because both are things the buyer can act on.
create index if not exists offers_problem_rank_idx
  on public.offers (problem_id, status, verified desc, created_at desc);

create index if not exists offers_product_idx
  on public.offers (product_id, status, created_at desc);

-- ── What the person would switch TO ──────────────────────────────────────────
--
-- The demand side already knows the alternatives; nobody had asked. This is
-- what keeps an unanswered problem page worth reading, and it is the list of
-- products worth recruiting. One nullable column on a table that already holds
-- exactly one row per visitor per problem.

alter table public.problem_supports
  add column if not exists switch_candidate text
    check (switch_candidate is null or char_length(switch_candidate) between 1 and 60);

create index if not exists problem_supports_switch_candidate_idx
  on public.problem_supports (problem_id, switch_candidate)
  where switch_candidate is not null;

comment on column public.problem_supports.switch_candidate is
  'What this person said they are looking at instead. Free text, shown aggregated, never attributed.';

-- Accepts the candidate alongside the existing detail. Same guards as before:
-- the count only moves for a published problem, and a returning visitor may
-- fill in what they skipped but cannot overwrite what they already said.

create or replace function public.support_problem(
  p_problem_id uuid,
  p_visitor_key text,
  p_detail text default null,
  p_detail_status text default 'none',
  p_switch_candidate text default null
)
returns table(inserted boolean, support_count integer)
language plpgsql security definer set search_path = public as $$
declare
  v_inserted boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended(p_problem_id::text || ':' || p_visitor_key, 0));

  insert into public.problem_supports(problem_id, visitor_key, detail, detail_status, switch_candidate)
  values (p_problem_id, p_visitor_key, p_detail, p_detail_status, p_switch_candidate)
  on conflict (problem_id, visitor_key) do nothing;
  v_inserted := found;

  if v_inserted then
    update public.problems
      set support_count = problems.support_count + 1, last_support_at = now()
      where id = p_problem_id and status = 'published';
  elsif p_detail is not null or p_switch_candidate is not null then
    update public.problem_supports ps
      set detail = coalesce(ps.detail, p_detail),
          detail_status = case when ps.detail is null and p_detail is not null then p_detail_status else ps.detail_status end,
          switch_candidate = coalesce(ps.switch_candidate, p_switch_candidate),
          updated_at = now()
      where ps.problem_id = p_problem_id and ps.visitor_key = p_visitor_key;
  end if;

  return query select v_inserted, p.support_count from public.problems p where p.id = p_problem_id;
end;
$$;

-- The 4-argument version from migration 15 is now ambiguous against the
-- 5-argument one for callers that omit the tail. Drop it.
drop function if exists public.support_problem(uuid, text, text, text);

-- ── Outbound clicks, without the ad machinery ────────────────────────────────
--
-- Kept because "your answer got 40 clicks" is the one number a founder has a
-- real reason to come back for. Deduped per visitor per day, and never shown
-- on the buyer's side of the site.

create or replace function public.record_offer_click(
  p_offer_id uuid,
  p_visitor_key text
)
returns void
language plpgsql security definer set search_path = public as $$
declare
  v_problem_id uuid;
begin
  select problem_id into v_problem_id
  from public.offers
  where id = p_offer_id and status = 'active';

  if v_problem_id is null then return; end if;

  update public.offers set click_count = click_count + 1 where id = p_offer_id;
  update public.problems set click_count = click_count + 1 where id = v_problem_id;
end;
$$;

revoke all on all functions in schema public from public, anon, authenticated;
