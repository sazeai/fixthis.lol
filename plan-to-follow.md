# FIXTHIS — Pivot to a Switching Marketplace

## Context

FIXTHIS launched as a complaint board with an advertising auction bolted on. It got no traction, and the one piece of real feedback was correct: *"your product and direction is good, but it's too confusing, me as a user is fighting."*

That has a precise, verifiable cause. Open a problem page today and a **buyer** is shown an **advertiser's dashboard**:

- [problem-metrics.tsx](components/marketplace/problem-detail/problem-metrics.tsx) — "solution impressions", "solution clicks", "products competing"
- [problem-competition.tsx](components/marketplace/problem-detail/problem-competition.tsx) — "The battlefield", rank badges, `N views · N clicks · X% CTR`, bid amounts, `~N% visibility` / "outside top 5", "Next bid $5+", "Paid rotating placement, not an endorsement"

None of that is information a person evaluating software can act on. The buyer must decode an ad-tech ranking system before reaching anything useful. That is the fight.

Meanwhile the page is missing the content that would make it worth reading. **`problems.switch_condition` — "what would make you switch?" — is write-only.** It is collected by the form, validated, stored, typed in [types/marketplace.ts:16](types/marketplace.ts:16), and selected in [queries.ts:90](lib/marketplace/queries.ts:90) — and rendered by **zero components**. The single most valuable field in the database never reaches a human eye.

`better-decision.md` sets the direction:

> **Old FIXTHIS:** people complain, founders buy the attention around those complaints.
> **New FIXTHIS:** people say why they're ready to leave software, and competing products show them why to switch.

**Constraint given:** no users, no data worth preserving. Deleting code, routes, tables and columns is explicitly allowed.

---

## Scope decisions (locked)

These were decided explicitly and constrain everything below:

1. **FIXTHIS stays horizontal across all software.** It is not an AI/AEO product. AI/AEO is a *go-to-market* experiment — a set of founders who happen to be reachable now. Concentrating outreach there changes the outreach list, not the architecture. Every table, route and component below is category-agnostic.
2. **The problem page is the center.** Products attach themselves to problems as solutions. Problems do not become content hanging off product pages. Products are secondary, navigational infrastructure — the moment that inverts, FIXTHIS is another AlternativeTo.
3. **Not every problem belongs to a vendor.** `target_product_id` is nullable. Backfill it only where a complaint genuinely names a specific product. *"AI SEO writers produce generic articles that don't rank"* is a legitimate category-level problem; forcing it onto Jasper to populate a product page corrupts the data. Category-level problems stay first-class and discoverable.

---

## The thesis

FIXTHIS is **a public record of why people leave software, and the place competitors answer.**

Two assets compound, both anchored to the problem page:

1. **A structured switching-intent corpus.** `I use X → Y is the problem → I'd switch if Z`. G2 has star ratings. Reddit has unstructured rants. Nobody has this shape.
2. **A competitor graph declared by vendors themselves** ("we compete with Notion") — deterministic, no embeddings, self-building.

The loop, exactly as converged on:

```
user posts problem about X → ME TOO accumulates → founders watching X are alerted
  → founder answers with how their product solves this specific complaint
  → buyers compare answers → click out
```

---

## What I'm adding to `better-decision.md`

Three things it doesn't cover, all of which sit *on the problem page* and therefore respect scope decision #2.

### 1. Demand should name its own supply

`better-decision.md` identifies the cold-start problem — *nobody can alert a vendor before that vendor exists in FIXTHIS* — and concludes there's no technical fix, so you keep tweeting at founders manually.

There is a fix, and it's one input field. **The people complaining already know what they'd switch to.** Add to the ME TOO flow:

> **What are you looking at instead?** *(optional)*

That single field produces four things:

- **Substance on unanswered problem pages.** *"11 people said they're considering Promptwatch and Peec"* is useful to a buyer even when zero vendors have answered. This is the real fix for thin problem pages — content the page generates itself, not aggregation into some other page.
- **A ranked outreach list.** Instead of guessing which founders to tag, you email the most-mentioned products. Manual acquisition becomes data-driven.
- **The product graph, built by demand** rather than by waiting for vendors.
- **A far stronger cold email.** *"14 people on FIXTHIS named your product as what they'd switch to"* beats *"someone complained about your competitor."*

Cost: **one nullable column** on `problem_supports`, which already has a unique row per visitor per problem. No new table.

### 2. Render `switch_condition`

Not a new feature — a bug. The field exists, is populated, and is invisible. It is literally the brief a founder needs before answering. Putting it on the page is a few lines and it is the highest value-per-line change in this entire plan.

### 3. A trust layer, or the problem pages become spam

If any founder can write "we solve this," problem pages rot within a month. That is how every "alternatives to X" directory died. `better-decision.md` has no defense. Minimum viable:

- **Domain-verified offers** — the offer email must be at the product's registrable domain. `tldts` is already a dependency and `products.registrable_domain` is already the unique key, so this is nearly free.
- **One offer per product per problem** — hard constraint, and it already exists as `unique (problem_id, product_id)` on `placements`.
- **Structural offers, not ads** — `solves_text` required and capped short, so it must answer *this* complaint rather than pitch generally.
- **A right of reply.** Every product page carries the vendor's own response slot. This is the ethical and legal safety valve for publishing criticism of named companies.

---

## Where "the fight" goes

`better-decision.md` says it "moves inside the problem page," which is true but thin — a flat list of offers isn't a fight.

**The fight becomes ordering by usefulness to the buyer instead of ordering by payment.** Offers sort: verified → has a switch incentive → specificity → recency. A founder wins position by writing a better, more specific answer and a better switch deal. The buyer benefits from watching it. And it stays honestly monetizable later, because *verified* is a disclosed advantage in a way a hidden bid never was.

Keep the brand voice. FIXTHIS.LOL, blunt and funny, is the differentiation. The pivot removes **advertiser jargon from the buyer's surface** — it does not turn the site beige.

---

## Information architecture

| URL | Role |
|---|---|
| `/problems/[slug]` | **Primary.** The marketplace. Complaint → switch condition → ME TOO + details → what people are considering → offers → make an offer. |
| `/` | The board. Cards reduce to: product name → complaint → 🔥 N ME TOO → N answers. |
| `/category/[slug]` | Where category-level problems live — the home for curated rows with no vendor. Also fixes the breadcrumb JSON-LD in [problems/[slug]/page.tsx:56](app/problems/[slug]/page.tsx:56), which currently points at `/?category=…`, a URL that resolves to an unfiltered board because the category filter is client-only. |
| `/products/[slug]` | **Secondary, navigational.** A vendor profile: what this product says it solves, offers it has made, competitors it watches, and problems posted about it. A hub and a founder surface — not the SEO centerpiece. |
| `/for-saas` | Founder entry: search a competitor, see the demand, subscribe to alerts. |
| `/manage/[token]` | Founder console (existing, repurposed). |

SEO follows from the problem page being substantive, not from aggregation. Concretely: `target_product_name` should lead the `<title>` so it reads like a query (*"Profound's $99 plan only tracks ChatGPT — alternatives"*) rather than the current bare statement, and the description must stop saying *"the N alternatives bidding to win them over."* Product and category pages are internal-linking hubs that distribute authority to problems.

---

## What gets deleted

### Schema — drop outright

`bid_quotes`, `bids`, `rotation_epochs`, `visitor_assignments`, `placement_impressions`, `placement_clicks`, `daily_traffic`, `visitor_presence`, `market_events`
Functions: `rebuild_rotation`, `rebuild_rotation_for_placement`, `lock_rotation_for_placement`, `assign_featured_placement`, `create_bid_quote`, `release_bid_quote`, `settle_bid`, `reconcile_bid_state`, `record_market_event`, `log_placement_event`
Triggers: `placements_market_event`, `placements_rotation_lock`, `placements_rotation_sync`
Columns: `problems.impression_count`, `problems.last_bid_at`

`products` and `placements` are **kept and transformed** — see Phase 1.

### Routes

`app/bid/**`, `app/api/bids/**`, `app/api/dodopayments/webhook/`, `app/api/problems/[id]/feature/` (the impression biller), `app/api/presence/`, `app/api/market-events/`, `app/api/admin/founding-claims/`, `app/refund-policy/`.

Keep `app/manage/**` — it becomes the founder console.

### Components

`bid-modal.tsx` (its fields survive into the offer form), `bid-success.tsx`, `release-checkout.tsx`, `featured-solution.tsx`, `sponsor-row.tsx`, `live-fights-strip.tsx`, `floating-events.tsx`, `market-event-feed.tsx`, `presence-tracker.tsx`, `founding-claim-form.tsx`, `problem-detail/problem-metrics.tsx`, `problem-detail/problem-competition.tsx`
plus `lib/marketplace/live-fights.ts` (the paid injection engine), `rotationPercentages()` and `formatMoney()` in `helpers.ts`, `bidSchema` in `validation.ts`, and roughly half of `queries.ts` (`toBattlefield`, `toCompetitors`, `getBidStatus`, the bid joins and `next_bid_cents` / `trending_score` bid weighting).

Prune `types/marketplace.ts`: `BidStatus`, `PaymentState`, `RotationShare`, `FeaturedPlacement`, `BattlefieldEntry`, `BidQuote`, `ProblemCompetitor`, `AdminPlacement`, and the ad fields on `ProblemSummary`.

### Copy — the actual fix for "I'm fighting"

| Remove | Replace with |
|---|---|
| `CLAIM $5`, `TAKE #1`, `EXTEND LEAD`, `Next bid $5+` | `MAKE AN OFFER` (founder-facing only) |
| `Featured solution`, `Currently claiming this problem`, `Paid rotating placement` | `Alternatives that answered` |
| `The battlefield`, `Products competing` | `3 products say they can fix this` |
| `solution impressions`, `solution clicks`, `~N% visibility`, `CTR`, rank badges | *(gone from the buyer surface entirely)* |
| `Unclaimed` / `Being fought over` board tabs ([sections.ts](lib/marketplace/sections.ts), keyed on `competitor_count`) | `No answer yet` / `Answered` |
| `LIVE FIGHT` ⚡ injection on cards | *(gone)* |

Also rewrite: `lib/site.ts` (`SITE_TITLE`/`SITE_DESCRIPTION` are ad-framed), both `opengraph-image.tsx` files ("Alternatives fight", "N alternatives bidding"), `public/llms.txt` (auction language on lines 3, 12–13, 19–20, 27–28), `terms` (5 of 9 sections), and the advertiser/impression paragraphs in `privacy-policy`.

---

## What gets kept

Everything that isn't the auction is infrastructure the new model needs:

- **Anonymous visitor identity** — [proxy.ts](proxy.ts) mints `fixthis_visitor` only on true document navigations (the fix for the phantom-visitor bug), HMAC'd in [visitor.ts](lib/marketplace/visitor.ts). ME TOO stays one anonymous tap. **Do not gate it behind login** — it is the easiest demand signal you have.
- **Resend** ([email.ts](lib/marketplace/email.ts)) — becomes the alert engine.
- **The double-opt-in token pattern** from `problem_subscriptions` + `/api/subscriptions/verify` — the template for founder watches.
- **Magic-link management sessions** ([management.ts](lib/marketplace/management.ts), `app/manage/[token]`) — the founder console. Founders still need no account.
- **Supabase magic-link auth** for problem posting, **Upstash rate limits, Turnstile, zod, `diceSimilarity` dedupe, admin auth, `moderation_audit`, `problem_reports`** — all still needed, more so once vendors write public text.
- **`tldts` + `registrable_domain`** — the natural key for product identity and domain-verified offers.
- **`lib/marketplace/ui.ts` tokens and the visual system.** Untouched.
- **`lib/dodopayments-server.ts` + the `dodopayments` dep**, unwired. Phase 4 needs it; the reference implementation stays in git history.
- **Click counting**, simplified to one counter per offer, shown **only** in the founder console. Real value for supply, invisible to buyers.

---

## Phases

### Phase 0 — The cut

Delete everything under *What gets deleted*. One migration; strip the auction blocks from `problem-detail-view.tsx`, `problem-card.tsx`, `marketplace-home.tsx`, `problem-header.tsx`, `admin/page.tsx`; prune `queries.ts`, `types/marketplace.ts`, `sections.ts`, `helpers.ts`, `validation.ts`.

**Then render `switch_condition`** on the problem page and card — the field already exists and is populated.

Ship this alone. It is not a stepping stone; it is the fix for the reported complaint. The site becomes clear before it becomes clever.

**Done when:** a problem page shows the complaint, what would make them switch, the ME TOO count, and nothing a buyer has to decode. Typecheck and production build pass, no dead imports.

### Phase 1 — The problem page becomes the marketplace

**`placements` is already the offers table** — `problem_id + product_id + unique(problem_id, product_id) + event_text`. Rename it, don't recreate it.

Migration, `placements` → `offers`:
- drop `current_bid_cents`, `founding_claim`, `settled_at`, `impression_count`, `event_text`, `event_text_updated_at`
- keep `click_count`, `status`
- add `solves_text` (required, ~240 chars — *how we solve this exact complaint*), `switch_incentive` (optional, ~140 — *free migration, first month free*), `created_by_email`, `verified boolean`

Also `problem_supports.switch_candidate text` (nullable, ≤60) — addition #1. No new table.

Build:
- **MAKE AN OFFER** — fork `bid-modal.tsx`, keep product name / tagline / URL / email, delete the amount field and the 60/25/15 `Share` grid, add `solves_text` + `switch_incentive`. **Free.** No checkout in front of a founder answering a complaint.
- Offers block replacing `problem-competition.tsx`: *"3 products say they can fix this"* → per-offer card with the answer, the incentive, and `VISIT X →`, keeping `rel="sponsored nofollow noopener"`. Sorted verified → has-incentive → recency.
- *"What are you looking at instead?"* in `support-problem.tsx`; rendered as *"11 people said they're considering: Promptwatch, Peec."*
- `INVITE THEM →` on unanswered problems — copy link plus a prewritten X post. Turns the manual growth hack into a feature.
- `/api/placements/[id]/click` → `/api/offers/[id]/click`.
- Rewrite `generateMetadata` in `app/problems/[slug]/page.tsx` — lead with `target_product_name`, drop *"alternatives bidding to win them over."*

**Done when:** a vendor answers a complaint end-to-end with no payment, and an unanswered problem page still has real content on it.

### Phase 2 — Products and categories as navigation

`products` today is an advertiser account (`owner_email text not null`), which is why FIXTHIS cannot know a product exists until someone pays.

Migration:
- `products.owner_email` → **nullable**; add `slug` (unique), `created_via ('mention' | 'vendor' | 'admin')`, `claimed_at`, `claim_verified_at`
- `problems.target_product_id uuid references products(id)` — **nullable**, backfilled from `target_product_name` via the existing `problems_target_product_idx on (lower(target_product_name))`, and **only where the complaint genuinely names a vendor.** Keep `target_product_name` as the raw text the poster typed. Curated rows without a vendor stay NULL by design.
- get-or-create-product helper beside the existing normalization in `helpers.ts`

Build:
- **`/products/[slug]`** — vendor profile: what this product says it solves (its offers), competitors it watches, problems posted about it, and a claim CTA. Reuses `problem-card.tsx` and `product-icon.tsx`.
- **`/category/[slug]`** — server-rendered category feed. Home for the 52 curated rows and every other category-level problem. `problems_category_idx` already exists; categories come from `PROBLEM_CATEGORIES` in [helpers.ts:6](lib/marketplace/helpers.ts:6). Fixes the dangling breadcrumb URL.
- Cross-links both ways; `sitemap.ts` gains product + category entries and drops the `competitor_count`-based priority; `robots.ts` updated (`/bid/` is gone); rewrite `public/llms.txt`.

**Done when:** every problem reaches a hub and every hub reaches its problems; no category-level problem is stranded.

### Phase 3 — Competitor watch and alerts

Where retention lives. One new table:

```sql
product_watches (
  id, email, product_id, watcher_product_id (nullable),
  verification_token_hash, verified_at, last_notified_at, created_at,
  unique (email, product_id)
)
```

- **`/for-saas`** — *"Find people unhappy with your competitors."* Search a competitor → *"23 problems about Intercom, 184 people agree"* → **🔔 Watch Intercom**, email only. They do **not** have to list their SaaS to subscribe; ask *"what's your product / how do you solve it"* only when they click **I CAN FIX THIS** on a specific problem.
- Matching is deterministic on `problems.target_product_id`. No LLM, no embeddings, no hallucinated matches.
- Batched digest email with a deep link into the offer form. Never one email per problem.
- `/manage/[token]` becomes the founder console: my offers, my watchlist, my click counts.

**Four defects must be fixed here, because this phase depends on all of them:**
1. [email.ts:46](lib/marketplace/email.ts:46) — `sendManagementLink` receives a `token` and never interpolates it (`href="${appUrl}/manage/"`). Every founder email currently lands on the "lost your link" page. The founder console is unreachable today.
2. `/api/subscriptions/verify` is a **GET that mutates** — an email scanner's prefetch silently confirms a subscription. Move to a confirm page that POSTs.
3. **No unsubscribe exists anywhere** in the codebase. Required before sending recurring founder digests.
4. `notifyProblemSubscribers` only fires when `beforeCount === 0` and stamps `notified_at` permanently, so a subscriber is notified at most once ever. Rework for offers.

**ME TOO stays anonymous.** No emails to supporters. If notifications are ever wanted, they are a separate opt-in — never a login gate on your easiest demand signal.

**Done when:** a founder subscribes once and receives every future opportunity with no manual outreach from you.

### Phase 4 — Monetize (not before ~100 verified watchers)

Deliberately last, and deliberately not "sell intent data" — that's an enterprise sales motion needing scale you won't have for years. Self-serve instead:

1. **Watch limits** — 1 competitor free, more paid. Priced directly against the value delivered.
2. **Verified vendor profile** — logo, longer offer, sorts above unverified. Disclosed, honest, and the monetized form of the fight.

Rewire Dodo then; `lib/dodopayments-server.ts` and `payment_webhook_events` are still there.

---

## Cleanup worth doing alongside (all confirmed present)

- **`.github/workflows/deploy-trigger.yml` fails on every push to `main`** — runs `npx trigger.dev deploy` with no `trigger.config.ts`, no dependency, no tasks. Delete it, the `"trigger.config.ts"` entry in `tsconfig.json`, and the `trigger` MCP entries in the six editor configs.
- **`font-mono` is silently broken.** `--font-mono: var(--font-geist-mono)` ([globals.css:153](app/globals.css:153)) points at a variable that is never defined and never overridden, so every "mono micro-label" in `ui.ts` renders in Inter. Same class of bug as the `--font-clash` one. Also dangling: `--font-caveat`, `--font-space-grotesk`, `--font-playfair`, `--font-bricolage`.
- **`ui.ts` is aspirational** — nearly every component hardcodes the same hex values inline instead of importing the tokens. Worth converging while touching these files anyway.
- `globals.css` carries ~350 lines of dead `.blog-content` / `.neo-container` / `.landing-page` CSS from the previous product.
- `.env.local` carries ~20 stale keys (QSTASH_*, TRIGGER_*, TAVILY, GEMINI, R2_*, WORDPRESS_*, …) that nothing reads.
- `initialSupported` in `support-problem.tsx:19` is documented as "server-derived: no flash" but neither call site passes it — every button flashes idle.
- `eslint-config-next` is pinned at `15.5.4` against Next `^16`.

---

## Risks worth naming

- **Publishing criticism of named companies.** Mitigated by user-attributed opinion, a free and prominent vendor right of reply on every product page, and a working report path (`problem_reports` exists with an `advertising` reason).
- **Vendor spam.** Mitigated by domain verification, one-offer-per-product, and the short structural `solves_text`.
- **Zero RLS policies exist** despite RLS being enabled on every table. Correct for the service-role-only design, but a single leaked `SUPABASE_SERVICE_ROLE_KEY` is total access — and `MANAGEMENT_LINK_SECRET` falls back to that key ([management.ts:8](lib/marketplace/management.ts:8)), the exact footgun `visitor.ts` deliberately removed for visitor identity.
- **This still requires manually acquiring the first ~50 founders.** No feature removes that. Addition #1 makes targeting data-driven, and Phase 3 makes each acquisition permanent — one founder becomes a standing watch node instead of a one-off tweet. AI/AEO is where to start that outreach, purely because those founders are reachable now.

---

## Verification

Per phase:

```bash
npx tsc --noEmit && npm run build && npm run lint
```

Then with the `fixthis-dev` launch config in the Browser pane:

- **Phase 0** — `grep -ri "battlefield\|CTR\|next_bid\|impression\|rotation" app components lib` returns nothing outside legal copy. A problem page renders `switch_condition`.
- **Phase 1** — submit an offer end-to-end with no payment; confirm `unique (problem_id, product_id)` rejects a second offer from the same domain; ME TOO with a switch candidate renders; outbound links carry `rel="sponsored nofollow noopener"`.
- **Phase 2** — `/products/[slug]` and `/category/[slug]` resolve; no published problem is unreachable from a hub; curated rows appear on category pages; `/sitemap.xml` includes both; `generateMetadata` contains no auction language.
- **Phase 3** — subscribe a watch, confirm the double-opt-in mail arrives via Resend, post a matching problem, confirm exactly one digest fires and its deep link opens the offer form. Confirm the management link now contains its token, and that every email has a working unsubscribe.

Migrations apply from empty (`supabase db reset` against `supabase/migrations/` + `supabase/seed-problems.sql`) at every phase — the repo's stated invariant.