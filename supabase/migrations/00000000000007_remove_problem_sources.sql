-- Retire the old research-provenance/source-link feature.
--
-- The original migration remains unchanged for already-applied environments.
-- This forward migration removes the table from those databases. Do not use
-- CASCADE: an unexpected dependency should fail loudly instead of deleting
-- unrelated objects.

set local lock_timeout = '5s';
set local statement_timeout = '15s';

drop table if exists public.problem_sources;
