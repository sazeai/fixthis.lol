import { NextResponse } from "next/server"
import { jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Releases the hold on a checkout the founder backed out of.
 *
 * Dodo returns them through cancel_url carrying their own quote id, and the
 * page posts it here so an abandoned attempt stops sitting in bid_quotes as
 * though it were still live.
 *
 * Safe to call with someone else's id: a hold no longer influences anyone's
 * price, releasing only touches a quote still waiting to be paid, and a payment
 * that lands afterwards settles regardless of what the hold says. The worst a
 * guessed uuid achieves is tidying a row that would have expired anyway.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)
  const { id } = await params
  if (!UUID.test(id)) return jsonError("Quote not found.", 404)

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("release_bid_quote", { p_quote_id: id })
  if (error) {
    console.error("Bid quote release failed", { quoteId: id, detail: error.message })
    return jsonError("The checkout could not be released.", 500)
  }
  return NextResponse.json({ released: Boolean(data) })
}
