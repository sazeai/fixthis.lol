-- Problem creation is gated by a verified Supabase Auth session.
-- Keep this nullable for the curated and legacy rows created before the gate.

alter table public.problems
  add column if not exists submitted_by uuid references auth.users(id) on delete set null;

create index if not exists problems_submitted_by_idx
  on public.problems (submitted_by, created_at desc)
  where submitted_by is not null;

comment on column public.problems.submitted_by is
  'Supabase Auth user who created the problem; null for curated and legacy rows.';
