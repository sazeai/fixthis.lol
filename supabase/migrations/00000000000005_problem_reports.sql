-- Post-publication reporting.
--
-- Screening runs before a problem goes live, but no pre-publication check is
-- perfect on open, accountless submission. This is the layer that catches what
-- got through: readers flag a problem, and once enough distinct visitors agree,
-- it hides itself and waits for a human rather than staying public.

create table public.problem_reports (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  visitor_key text not null check (char_length(visitor_key) = 64),
  reason text not null check (reason in ('spam', 'advertising', 'abusive', 'nonsense', 'other')),
  detail text check (detail is null or char_length(detail) between 3 and 280),
  created_at timestamptz not null default now(),
  -- One report per visitor per problem: reporting again cannot stack the count.
  unique (problem_id, visitor_key)
);

create index problem_reports_problem_idx on public.problem_reports (problem_id, created_at desc);

alter table public.problems add column if not exists report_count integer not null default 0 check (report_count >= 0);
alter table public.problem_reports enable row level security;

-- Distinct visitors required before a live problem auto-hides.
create or replace function public.report_problem(
  p_problem_id uuid,
  p_visitor_key text,
  p_reason text,
  p_detail text default null,
  p_threshold integer default 3
)
returns table(recorded boolean, hidden boolean)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_recorded boolean := false;
  v_count integer;
  v_status text;
  v_hidden boolean := false;
begin
  perform pg_advisory_xact_lock(hashtextextended('report:' || p_problem_id::text, 0));

  insert into public.problem_reports(problem_id, visitor_key, reason, detail)
  values (p_problem_id, p_visitor_key, p_reason, p_detail)
  on conflict (problem_id, visitor_key) do nothing;
  v_recorded := found;

  if not v_recorded then
    select p.status = 'hidden' into v_hidden from public.problems p where p.id = p_problem_id;
    return query select false, coalesce(v_hidden, false);
  end if;

  select count(*)::integer into v_count from public.problem_reports r where r.problem_id = p_problem_id;
  update public.problems set report_count = v_count where id = p_problem_id;

  select p.status into v_status from public.problems p where p.id = p_problem_id;

  -- Curated problems are FIXTHIS's own inventory and are never auto-hidden;
  -- reports on them still accumulate for an admin to read.
  if v_count >= p_threshold and v_status = 'published'
     and exists (select 1 from public.problems p where p.id = p_problem_id and p.origin <> 'curated') then
    update public.problems set status = 'hidden' where id = p_problem_id;
    insert into public.moderation_audit(entity_type, entity_id, action, actor, reason)
    values ('problem', p_problem_id, 'auto_hidden', 'system', v_count || ' reports reached the threshold');
    v_hidden := true;
  end if;

  return query select true, v_hidden;
end;
$$;

comment on function public.report_problem is
  'Records one report per visitor per problem and auto-hides a non-curated published problem once distinct reports reach the threshold.';
