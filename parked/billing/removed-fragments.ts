// Fragments removed from live files during the pivot. Restore into their
// original locations when billing is rewired. Not compiled (see tsconfig exclude).

// ── lib/marketplace/validation.ts ────────────────────────────────────────────
export const bidSchema = z.object({
  problemId: z.string().uuid(),
  productName: z.string().trim().min(1).max(80),
  productTagline: z.string().trim().min(3).max(180),
  destinationUrl: z.string().trim().url().max(2048),
  /**
   * Short competitive hook, fired as a floating event rather than printed on
   * the card. Kept apart from the tagline so it cannot become permanent
   * coupon text sitting over the placement.
   */
  eventText: z.string().trim().max(60).optional().default("")
    .refine((value) => !value || value.length >= 3, "Make it a few characters longer."),
  email,
  amountCents: z.coerce.number().int().min(500).max(10_000_000),
  turnstileToken: z.string().optional().default(""),
  website: honeypot,
})

// ── types/marketplace.ts ─────────────────────────────────────────────────────
export type BidStatus = "settled" | "suspended" | "revoked"
export type PaymentState = "processing" | "settled" | "failed" | "cancelled"
export type BidQuote = {
  quote_id: string
  minimum_cents: number
  amount_cents: number
  expires_at: string
  checkout_url?: string
}

// ── lib/marketplace/queries.ts ───────────────────────────────────────────────
export async function getBidStatus(quoteId: string) {
  const supabase = createAdminClient()
  const { data: quote } = await supabase.from("bid_quotes").select("id,status,problem_id,amount_cents,expires_at").eq("id", quoteId).maybeSingle()
  if (!quote) return null
  const { data: bid } = await supabase.from("bids").select("placement_id,status,settled_at").eq("quote_id", quoteId).maybeSingle()
  let rank: number | null = null
  if (bid?.placement_id) {
    const { data: placement } = await supabase.from("placements").select("problem_id,current_bid_cents,settled_at").eq("id", bid.placement_id).maybeSingle()
    if (placement) {
      const { data: ranked } = await supabase.from("placements").select("id,current_bid_cents,settled_at").eq("problem_id", placement.problem_id).eq("status", "active").order("current_bid_cents", { ascending: false }).order("settled_at", { ascending: true })
      rank = (ranked || []).findIndex((item: Row) => item.id === bid.placement_id) + 1 || null
    }
  }
  return { ...quote, bid, rank }
}
