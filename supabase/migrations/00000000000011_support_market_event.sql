-- Wire up the one event type that was declared but never written.
--
-- Migration 09 created market_events with five allowed types and shipped
-- writers for four of them: the placements trigger covers placement_entered,
-- took_first and bid, and settle_bid covers offer_updated. Nothing ever
-- inserted a 'support' row, so the single most common action on the board -
-- someone pressing ME TOO - produced no event at all. The value appeared
-- exactly once in the whole schema, in the CHECK constraint listing it as
-- legal.
--
-- That left the floating event layer with almost nothing to show. The paid
-- events only fire when money moves, which on a young board is rare, so in
-- practice the feature was dark.
--
-- Only a genuinely new ME TOO is recorded. A repeat press from the same
-- visitor is deduplicated by the (problem_id, visitor_key) conflict and must
-- not fire, or one person refreshing would look like a crowd.

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

    -- Guarded by `found` so an unpublished or deleted problem cannot emit an
    -- event for a count that was never incremented.
    if found then
      perform public.record_market_event(p_problem_id, null, 'support', '+1 SAME PAIN');
    end if;
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
