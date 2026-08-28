# Parked billing

Everything the Dodo Payments integration was made of, preserved verbatim. **None
of it is compiled, routed, or reachable** — `parked` is in `tsconfig.json`'s
`exclude`, and it sits outside `app/`, so Next.js never turns any of it into an
endpoint.

It is parked rather than deleted because the payment plumbing is the expensive
part and it still works. What the pivot removed was the *auction* — bidding for
rank — not the ability to take money.

## What is here

| Path | Was |
|---|---|
| `lib/dodopayments-server.ts` | Dodo SDK singleton, env-driven test/live mode |
| `api/dodopayments/webhook-route.ts` | Signature verify (standardwebhooks), idempotency ledger, settle / refund / dispute handling |
| `api/bids/checkout-route.ts` | Quote creation + Dodo dynamic-amount checkout session |
| `api/bids/[id]/status-route.ts` | Post-checkout polling |
| `api/bids/[id]/release-route.ts` | Release an abandoned hold |
| `pages/bid-success-page.tsx` | Webhook-backed success screen |
| `pages/refund-policy-page.tsx` | Refund policy — required again before charging anyone |
| `components/bid-modal.tsx` | Checkout modal |
| `components/bid-success.tsx` | Status poller |
| `components/release-checkout.tsx` | Fire-and-forget hold release |
| `removed-fragments.ts` | `bidSchema`, `getBidStatus`, and the bid types cut out of files that still exist |
| `schema.sql` | `bid_quotes`, `bids`, `payment_webhook_events` DDL + the settlement functions |
| `PLAN-auction-reference.md` | The original spec. Phase 4 is the billing design in full |

## Reusable as-is

- Dodo client and environment handling.
- **Webhook signature verification and the idempotent event ledger.** This is the
  part worth keeping: replay safety, `payment.succeeded`, `refund.succeeded`, and
  the dispute lifecycle.
- The pattern of never publishing state from the redirect, only from a verified
  webhook.
- Emailing a signed management link on successful payment.

## Needs rewriting before it can be turned back on

- Everything is keyed to `placements.current_bid_cents` and the rotation epochs.
  Those columns and tables are gone (migrations 15–16), so `create_bid_quote`,
  `settle_bid` and `reconcile_bid_state` all reference things that no longer
  exist.
- More to the point, **the thing being sold has changed.** The plan monetises
  competitor watch limits and verified vendor profiles — a subscription and a
  one-off verification — not a per-problem auction. Neither of those needs a
  quote, a floor, a rotation or a rank.

So the realistic path is: keep the webhook, the client, the ledger and the
management-link email; throw away the quote/settle/rank half.

## Environment

`.env.local` no longer carries these. Get them from the Dodo dashboard when
billing returns:

```
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_SECRET=
DODO_ENVIRONMENT=test_mode
DODO_BID_PRODUCT_ID=
```

`dodopayments` and `standardwebhooks` are back in `package.json` so the imports
resolve the moment a file moves out of here.
