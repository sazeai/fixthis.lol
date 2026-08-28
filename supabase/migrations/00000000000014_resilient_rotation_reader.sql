-- Make a stale rotation slot cost one impression instead of the whole card.
--
-- assign_featured_placement took slots[cursor + 1] on trust. It advanced the
-- cursor, then inserted into visitor_assignments - whose placement_id does have
-- a foreign key - and only looked the placement up at the very end. So a slot
-- pointing at a placement that no longer exists did not degrade, it raised
-- 23503, the API answered 500, and the board rendered a problem with paying
-- advertisers on it as "UNCLAIMED - FIRST CLAIM $x".
--
-- Migration 13 stops those slots being created by rebuilding the rotation
-- whenever a placement changes. This is the other half: even if a stale slot
-- appears anyway - an edit made with triggers disabled, a restore from backup,
-- a path nobody has thought of yet - the reader now steps over it and serves
-- the next product, then repairs the epoch on its way through.
--
-- The check is deliberately on the one slot being used rather than a scan of
-- all hundred. This function runs for every card that scrolls into view, so the
-- common path stays a single indexed lookup and the expensive correction only
-- happens when something is actually wrong.
--
-- It also closes a smaller gap. The sticky-assignment branch already required
-- the product to be active, but the rotation path checked neither placement nor
-- product status before serving, so a hidden placement or a deactivated product
-- could still be handed out for thirty minutes. Both are now required.

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
  v_usable boolean;
begin
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

  -- Taken before the epoch row is locked, and it is the same key
  -- rebuild_rotation uses. Without it the two lock in opposite orders the
  -- moment this function rebuilds: this transaction would hold the epoch row
  -- and wait on the advisory lock, while a settling payment holds the advisory
  -- lock and waits on the epoch row. Postgres would resolve that by killing one
  -- of them, which on this path means a 500 on a card impression or a failed
  -- settlement. Acquiring it up front makes the order the same everywhere.
  --
  -- It costs no concurrency: the SELECT ... FOR UPDATE below already serialises
  -- callers per problem, because there is exactly one active epoch row to lock.
  perform pg_advisory_xact_lock(hashtextextended('rotation:' || p_problem_id::text, 0));

  select * into v_epoch from public.rotation_epochs
  where problem_id = p_problem_id and active for update;

  if v_epoch.id is null then
    perform public.rebuild_rotation(p_problem_id);
    select * into v_epoch from public.rotation_epochs
    where problem_id = p_problem_id and active for update;
  end if;
  if v_epoch.id is null then return; end if;

  v_placement_id := v_epoch.slots[v_epoch.cursor + 1];
  update public.rotation_epochs set cursor = mod(cursor + 1, 100) where id = v_epoch.id;

  select exists (
    select 1 from public.placements pl
    join public.products pr on pr.id = pl.product_id and pr.status = 'active'
    where pl.id = v_placement_id and pl.status = 'active'
  ) into v_usable;

  -- The slot is stale, so the epoch as a whole cannot be trusted. Rebuilding
  -- here means this visitor gets a real product and every visitor after them
  -- reads a corrected epoch, rather than each one paying for the same discovery.
  if not v_usable then
    perform public.rebuild_rotation(p_problem_id);
    select * into v_epoch from public.rotation_epochs
    where problem_id = p_problem_id and active for update;
    -- rebuild_rotation deactivates everything and returns null when no active
    -- placement is left. Nothing to serve, and "unclaimed" is then the truth.
    if v_epoch.id is null then return; end if;

    v_placement_id := v_epoch.slots[v_epoch.cursor + 1];
    update public.rotation_epochs set cursor = mod(cursor + 1, 100) where id = v_epoch.id;

    select exists (
      select 1 from public.placements pl
      join public.products pr on pr.id = pl.product_id and pr.status = 'active'
      where pl.id = v_placement_id and pl.status = 'active'
    ) into v_usable;
    -- A freshly built epoch contains only active placements, so reaching this
    -- means something changed underneath us mid-call. Serve nothing for this
    -- one impression rather than raising and taking the card down.
    if not v_usable then return; end if;
  end if;

  insert into public.visitor_assignments(problem_id, placement_id, epoch_id, visitor_key, expires_at)
  values (p_problem_id, v_placement_id, v_epoch.id, p_visitor_key, now() + interval '30 minutes')
  returning id into v_assignment_id;

  insert into public.placement_impressions(assignment_id, problem_id, placement_id, visitor_key)
  values (v_assignment_id, p_problem_id, v_placement_id, p_visitor_key);
  update public.placements set impression_count = impression_count + 1 where id = v_placement_id;
  update public.problems set impression_count = impression_count + 1 where id = p_problem_id;
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
