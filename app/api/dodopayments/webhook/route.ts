import "server-only"

import { NextResponse } from "next/server"
import { Webhook } from "standardwebhooks"
import { notifyProblemSubscribers, sendManagementLink } from "@/lib/marketplace/email"
import { refreshProductIcon } from "@/lib/marketplace/favicon"
import { createManagementToken } from "@/lib/marketplace/management"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"
type Loose = Record<string, unknown>
const object = (value: unknown): Loose => value && typeof value === "object" && !Array.isArray(value) ? value as Loose : {}
const stringValue = (value: unknown) => typeof value === "string" ? value : ""
const hasValues = (value: Loose) => Object.keys(value).length > 0

export async function POST(request: Request) {
  const secret = process.env.DODO_PAYMENTS_WEBHOOK_SECRET || process.env.DODO_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 })
  const raw = await request.text()
  const headers = {
    "webhook-id": request.headers.get("webhook-id") || "",
    "webhook-signature": request.headers.get("webhook-signature") || "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") || "",
  }
  if (!headers["webhook-id"] || !headers["webhook-signature"] || !headers["webhook-timestamp"]) return NextResponse.json({ error: "Missing webhook signature." }, { status: 400 })
  try { await new Webhook(secret).verify(raw, headers) } catch { return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 }) }
  let payload: Loose
  try { payload = object(JSON.parse(raw)) } catch { return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 }) }
  const eventType = String(payload.type || "")
  const envelopeData = object(payload.data)
  const nestedData = object(envelopeData.object)
  const data = hasValues(nestedData) ? nestedData : envelopeData
  const supported = ["payment.succeeded", "refund.succeeded", "dispute.opened", "dispute.accepted", "dispute.cancelled", "dispute.won", "dispute.lost"]
  if (!supported.includes(eventType)) return NextResponse.json({ ok: true, ignored: true })

  const supabase = createAdminClient()
  const { error: eventError } = await supabase.from("payment_webhook_events").insert({ provider_event_id: headers["webhook-id"], event_type: eventType })
  if (eventError?.code === "23505") return NextResponse.json({ ok: true, idempotent: true })
  if (eventError) return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })

  try {
    if (eventType === "payment.succeeded") {
      const metadata = object(data.metadata || envelopeData.metadata || payload.metadata)
      if (metadata.checkout_type !== "fixthis_bid" || !metadata.quote_id) return NextResponse.json({ ok: true, ignored: true })
      if (String(data.status || "").toLowerCase() !== "succeeded") return NextResponse.json({ ok: true, ignored: true })
      const configuredProduct = process.env.DODO_BID_PRODUCT_ID
      const productCart = Array.isArray(data.product_cart) ? data.product_cart.map(object) : []
      const productIds = productCart.map((item) => stringValue(item.product_id))
      if (!configuredProduct || productCart.length !== 1 || productIds[0] !== configuredProduct || Number(productCart[0].quantity) !== 1) throw new Error("Payment product mismatch")

      const paymentId = stringValue(data.payment_id)
      const checkoutSessionId = stringValue(data.checkout_session_id)
      const currency = stringValue(data.currency).toUpperCase()
      const totalAmount = Number(data.total_amount)
      if (!paymentId || !checkoutSessionId) throw new Error("Payment identifiers are missing")
      if (currency !== "USD" || !Number.isInteger(totalAmount)) throw new Error("Payment currency or amount is invalid")

      const { data: quote, error: quoteError } = await supabase.from("bid_quotes").select("*,problems(statement,slug)").eq("id", metadata.quote_id).single()
      if (quoteError || !quote) throw quoteError || new Error("Bid quote not found")
      if (quote.checkout_session_id && checkoutSessionId !== quote.checkout_session_id) throw new Error("Checkout session mismatch")
      if (Number(metadata.bid_amount_cents) !== Number(quote.amount_cents)) throw new Error("Bid amount metadata mismatch")
      // Dodo's total includes tax; it must never be below the quoted USD bid.
      if (totalAmount < Number(quote.amount_cents)) throw new Error("Payment amount is below the bid")
      if (quote.status === "settled") {
        const { data: settledBid, error: settledBidError } = await supabase.from("bids").select("payment_id,checkout_session_id,amount_cents").eq("quote_id", quote.id).maybeSingle()
        if (settledBidError || !settledBid || settledBid.payment_id !== paymentId || settledBid.checkout_session_id !== checkoutSessionId || Number(settledBid.amount_cents) !== Number(quote.amount_cents)) {
          throw settledBidError || new Error("Settled bid does not match payment")
        }
      }
      const { count: beforeCount } = await supabase.from("placements").select("id", { count: "exact", head: true }).eq("problem_id", quote.problem_id).eq("status", "active")
      const settledAt = String(payload.timestamp || data.created_at || new Date().toISOString())
      const { data: settlement, error } = await supabase.rpc("settle_bid", {
        p_quote_id: quote.id, p_payment_id: paymentId, p_checkout_session_id: checkoutSessionId,
        p_amount_cents: quote.amount_cents, p_settled_at: settledAt,
      })
      if (error) throw error
      invalidateProblemOrdering()
      const { data: product } = await supabase.from("products").select("id,name,owner_email,icon_attempted_at").eq("registrable_domain", quote.registrable_domain).single()
      if (product) {
        // First settlement for this domain: grab the favicon once. Never blocks
        // the webhook — a missing icon just means the monogram renders.
        if (!product.icon_attempted_at) {
          await refreshProductIcon(supabase, product.id, quote.registrable_domain).catch(console.error)
        }
        await sendManagementLink(product.owner_email, createManagementToken(product.id, product.owner_email), product.name, new URL(request.url).origin).catch(console.error)
        const problem = Array.isArray(quote.problems) ? quote.problems[0] : quote.problems
        if ((beforeCount || 0) === 0 && problem) await notifyProblemSubscribers(quote.problem_id, problem.statement, product.name, problem.slug, new URL(request.url).origin).catch(console.error)
      }
      return NextResponse.json({ ok: true, settlement: settlement?.[0] })
    }

    const paymentId = String(data.payment_id || "")
    if (!paymentId) return NextResponse.json({ ok: true, ignored: true })
    const state = eventType === "dispute.opened" ? "suspended"
      : ["dispute.cancelled", "dispute.won"].includes(eventType) ? "settled" : "revoked"
    const { error } = await supabase.rpc("reconcile_bid_state", { p_payment_id: paymentId, p_status: state })
    if (error) throw error
    invalidateProblemOrdering()
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("FIXTHIS webhook processing failed", error)
    await supabase.from("payment_webhook_events").delete().eq("provider_event_id", headers["webhook-id"])
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}
