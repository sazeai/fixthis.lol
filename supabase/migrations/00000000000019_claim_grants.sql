-- Admin-granted product claims.
--
-- Domain sign-in is the self-serve way to prove you represent a product, and it
-- is the right default. It is also not universal: plenty of real founders run
-- their mail on gmail, and the first fifty suppliers on this marketplace are
-- people who were personally recruited. Telling one of them "sign in from
-- @yourproduct.com or you cannot reply" is how you lose a supplier you spent a
-- week getting.
--
-- So this is not a bypass flag on the offer route. It is a second path to the
-- same thing the domain check produces: ownership. Once granted, a claim
-- behaves exactly like a domain-verified one, and there is only ever one
-- ownership concept to reason about.
--
-- Keyed on email rather than on a user id so a grant can be issued before the
-- person has ever signed in. It resolves itself the first time they do.

create table if not exists public.product_claim_grants (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) <= 254),
  registrable_domain text not null check (char_length(registrable_domain) between 3 and 255),
  -- Why this was granted. Not decoration: this table is the audit trail for
  -- every claim that did not prove itself, so an empty reason is a hole.
  note text not null check (char_length(note) between 3 and 280),
  -- Whether answers made under this grant carry the verified mark. Default true
  -- because a grant means somebody checked; settable to false for a claim that
  -- is merely plausible.
  verified boolean not null default true,
  granted_by text not null default 'admin' check (char_length(granted_by) <= 120),
  created_at timestamptz not null default now(),
  redeemed_at timestamptz,
  revoked_at timestamptz,
  unique (email, registrable_domain)
);

-- Ownership keeps the provenance of a manual claim. Without these columns an
-- unmarked grant would become verified on the owner's second answer, and a
-- revoked grant would leave behind permanent ownership. Domain claims have no
-- grant id and are always verified; manual claims retain the admin's choice.
alter table public.products
  add column if not exists claim_verified boolean not null default false,
  add column if not exists claim_grant_id uuid references public.product_claim_grants(id) on delete set null;

alter table public.offers
  add column if not exists claim_grant_id uuid references public.product_claim_grants(id) on delete set null;

-- Migration 18 is the only route that could have created ownership before
-- this provenance column existed, and that route required a domain match.
update public.products
set claim_verified = true
where claimed_by is not null and claim_grant_id is null;

create index if not exists products_claim_grant_idx
  on public.products (claim_grant_id) where claim_grant_id is not null;

create index if not exists offers_claim_grant_idx
  on public.offers (claim_grant_id) where claim_grant_id is not null;

create index if not exists product_claim_grants_lookup_idx
  on public.product_claim_grants (email, registrable_domain)
  where revoked_at is null;

alter table public.product_claim_grants enable row level security;

comment on table public.product_claim_grants is
  'Admin-issued permission for an account to answer as a product it cannot prove by domain. The audit trail for every manually checked claim.';
comment on column public.product_claim_grants.redeemed_at is
  'First time the grant was actually used. Null means issued and never taken up.';
comment on column public.products.claim_verified is
  'Whether the current ownership proof earns the public Verified identity mark. Domain claims are true; manual claims retain the administrator''s choice.';
comment on column public.products.claim_grant_id is
  'Manual grant that established current ownership. Null for domain-proved ownership.';
comment on column public.offers.claim_grant_id is
  'Manual grant used to authorize this answer. Retained so revocation can remove its identity mark without deleting the answer.';

-- Revocation removes ownership and the identity mark from answers authorized
-- by that grant. It does not silently delete published text; admin can still
-- hide an individual answer through the normal moderation control.

alter table public.moderation_audit
  drop constraint if exists moderation_audit_entity_type_check;
alter table public.moderation_audit
  add constraint moderation_audit_entity_type_check
  check (entity_type in ('problem', 'support_detail', 'product', 'offer', 'claim_grant'));

-- Migration 18 described this column as "the account's own email is at this
-- product's registrable domain", which stopped being the whole truth the moment
-- grants existed. The mark is about identity, by whichever route it was
-- established, and never about the accuracy of the answer.
comment on column public.offers.verified is
  'FIXTHIS confirmed the author represents this product — by domain match, by prior ownership, or by an admin grant that said so. An identity signal, never a judgement about the product or the claim.';

comment on column public.products.claimed_by is
  'Account allowed to speak for this product, established by domain proof or an admin claim grant. Null = unclaimed.';
