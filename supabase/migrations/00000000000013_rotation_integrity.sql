-- Keep the rotation honest when placements change outside a payment.
--
-- rotation_epochs.slots is a uuid[] of placement ids. Postgres arrays cannot
-- participate in a foreign key, so ON DELETE CASCADE has no reach into them:
-- delete a placement and its id stays in the live epoch, pointing at nothing.
--
-- Only settle_bid and reconcile_bid_state ever called rebuild_rotation, and
-- both are payment events. Remove a placement any other way - a direct delete,
-- an admin action, a cascade from deleting its product - and the epoch keeps
-- serving the ghost until the next payment on that problem, which on a quiet
-- problem is never.
--
-- The failure is loud rather than graceful. assign_featured_placement takes the
-- slot, then inserts into visitor_assignments, whose placement_id DOES have a
-- foreign key, so the whole call raises 23503 and the API answers 500. The
-- board renders that as "UNCLAIMED - FIRST CLAIM $x" on a problem that has paid
-- advertisers on it. Weighting makes it worse: rank one holds 60 of the 100
-- slots, so losing the top placement takes out 60% of impressions on that card
-- while the remaining 40% keep working, which reads as intermittent rather than
-- broken.
--
-- Rebuilding is now driven by the placements table itself, so every path that
-- can change what belongs in the rotation is covered by construction rather
-- than by each caller remembering to ask.

create or replace function public.rebuild_rotation_for_placement()
returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_problem_id uuid;
begin
  -- NEW is not populated on DELETE, so the branch is explicit rather than a
  -- coalesce over both records.
  if tg_op = 'DELETE' then v_problem_id := old.problem_id; else v_problem_id := new.problem_id; end if;

  -- A cascade from deleting the problem itself reaches here after the parent
  -- row is already gone. Rebuilding would insert a rotation_epochs row
  -- referencing a problem that no longer exists, and the foreign key would
  -- abort the delete that triggered us.
  if not exists (select 1 from public.problems where id = v_problem_id) then
    return null;
  end if;

  perform public.rebuild_rotation(v_problem_id);
  return null;
end;
$$;

-- status and current_bid_cents are the only columns that change what the
-- rotation should contain: one decides whether a placement is eligible at all,
-- the other decides its rank and therefore its share of the hundred slots.
-- Impression and click counters change constantly and must not rebuild.
drop trigger if exists placements_rotation_sync on public.placements;
create trigger placements_rotation_sync
  after insert or delete or update of status, current_bid_cents on public.placements
  for each row execute function public.rebuild_rotation_for_placement();

revoke all on function public.rebuild_rotation_for_placement() from public, anon, authenticated;

-- Repair what is already broken.
--
-- Any live epoch holding a slot that does not resolve to an active placement is
-- rebuilt once here. This covers the ghost that prompted the migration and any
-- other problem that has been quietly serving 500s without anyone noticing,
-- since the only symptom is a card that looks unclaimed.
do $$
declare
  v_problem_id uuid;
begin
  for v_problem_id in
    select distinct e.problem_id
    from public.rotation_epochs e
    where e.active
      and exists (
        select 1 from unnest(e.slots) as slot(placement_id)
        where not exists (
          select 1 from public.placements pl
          where pl.id = slot.placement_id and pl.status = 'active'
        )
      )
  loop
    perform public.rebuild_rotation(v_problem_id);
  end loop;
end $$;
