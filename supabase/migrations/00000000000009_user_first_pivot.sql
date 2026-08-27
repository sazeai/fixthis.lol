-- User-first pivot.
--
-- A problem stops being an abstract "pain point" and becomes a complaint about
-- a named piece of software, which is what people actually arrive wanting to
-- say. Advertisers get a short hook separate from their product description,
-- and meaningful marketplace moments get recorded so the interface can show
-- real activity rather than invented atmosphere.

-- ── The complaint ────────────────────────────────────────────────────────────

alter table public.problems
  -- The software being complained about, e.g. "Intercom". Nullable because the
  -- 30 curated rows predate it and a complaint can be about a category.
  add column if not exists target_product_name text
    check (target_product_name is null or char_length(target_product_name) between 1 and 60),
  -- "What would make you switch?" — optional, and the closest thing to a brief
  -- an advertiser can read before bidding.
  add column if not exists switch_condition text
    check (switch_condition is null or char_length(switch_condition) between 3 and 160);

create index if not exists problems_target_product_idx
  on public.problems (lower(target_product_name))
  where target_product_name is not null;

comment on column public.problems.target_product_name is
  'Software the complaint is about. Shown as the card eyebrow.';
comment on column public.problems.switch_condition is
  'What would make the poster switch. Optional; read by advertisers deciding whether to bid.';

-- ── The advertiser hook ──────────────────────────────────────────────────────

alter table public.placements
  -- Short competitive hook such as "FREE MIGRATION". Deliberately separate from
  -- products.tagline so it cannot turn into permanent coupon text on the card;
  -- it exists to be fired as a floating event.
  add column if not exists event_text text
    check (event_text is null or char_length(event_text) between 3 and 60),
  add column if not exists event_text_updated_at timestamptz;

comment on column public.placements.event_text is
  'Short advertiser hook fired as a floating event. Never rendered as permanent card copy.';

-- ── Meaningful marketplace events ────────────────────────────────────────────

-- Only moments worth showing. Impressions and clicks stay in their own tables:
-- this one must remain small enough to poll cheaply.
create table if not exists public.market_events (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.problems(id) on delete cascade,
  placement_id uuid references public.placements(id) on delete cascade,
  type text not null check (type in ('support', 'placement_entered', 'bid', 'took_first', 'offer_updated')),
  -- Pre-rendered label, e.g. "+1 SAME PAIN" or "FREE MIGRATION".
  text text not null check (char_length(text) between 1 and 60),
  created_at timestamptz not null default now()
);

create index if not exists market_events_recent_idx on public.market_events (created_at desc);
create index if not exists market_events_problem_idx on public.market_events (problem_id, created_at desc);

alter table public.market_events enable row level security;

comment on table public.market_events is
  'Meaningful marketplace moments for the floating event UI. Never a log of impressions.';

-- Records an event and trims history, so the table cannot grow without bound.
create or replace function public.record_market_event(
  p_problem_id uuid,
  p_placement_id uuid,
  p_type text,
  p_text text
)
returns void
language plpgsql security definer set search_path = public as $$
begin
  insert into public.market_events(problem_id, placement_id, type, text)
  values (p_problem_id, p_placement_id, p_type, left(p_text, 60));

  -- Atmosphere only needs the recent past.
  delete from public.market_events where created_at < now() - interval '7 days';
end;
$$;

-- Fires an event whenever a settled bid changes a placement, which is where the
-- interesting moments live: a product entering, outbidding, or taking the lead.
create or replace function public.log_placement_event()
returns trigger
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
declare
  v_name text;
  v_leader_bid integer;
begin
  if new.status <> 'active' or new.current_bid_cents is null then return new; end if;
  if tg_op = 'UPDATE' and new.current_bid_cents = old.current_bid_cents then return new; end if;

  select p.name into v_name from public.products p where p.id = new.product_id;
  if v_name is null then return new; end if;

  if tg_op = 'INSERT' then
    perform public.record_market_event(new.problem_id, new.id, 'placement_entered', 'NEW ALTERNATIVE');
    return new;
  end if;

  select max(pl.current_bid_cents) into v_leader_bid
  from public.placements pl
  where pl.problem_id = new.problem_id and pl.status = 'active' and pl.id <> new.id;

  if v_leader_bid is null or new.current_bid_cents > v_leader_bid then
    perform public.record_market_event(new.problem_id, new.id, 'took_first', 'TOOK #1');
  else
    perform public.record_market_event(new.problem_id, new.id, 'bid', '+$' || ((new.current_bid_cents - coalesce(old.current_bid_cents, 0)) / 100)::text || ' BID');
  end if;
  return new;
end;
$$;

drop trigger if exists placements_market_event on public.placements;
create trigger placements_market_event
  after insert or update of current_bid_cents on public.placements
  for each row execute function public.log_placement_event();
