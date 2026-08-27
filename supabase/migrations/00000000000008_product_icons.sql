-- Self-hosted product icons.
--
-- Favicons are fetched server-side once and stored here, then served from our
-- own origin. Deliberately NOT proxied per-request from Google or DuckDuckGo:
-- that would send every visitor's IP and the domains they are browsing to a
-- third party on every card render, which contradicts the privacy policy this
-- site publishes.
--
-- Icons are small (capped at 100KB) and there is one row per advertiser, so
-- base64 in a column costs less operational surface than a storage bucket.

alter table public.products
  add column if not exists icon_base64 text,
  add column if not exists icon_content_type text,
  add column if not exists icon_width integer,
  add column if not exists icon_fetched_at timestamptz,
  -- Set even on failure so a domain with no usable icon is not refetched on
  -- every settlement; the monogram fallback renders instead.
  add column if not exists icon_attempted_at timestamptz;

comment on column public.products.icon_base64 is
  'Base64 favicon bytes served via /api/products/[id]/icon. Null means render the monogram fallback.';
comment on column public.products.icon_width is
  'Pixel width of the stored icon. Icons under 32px are rejected at fetch time because they look poor at 22px.';
