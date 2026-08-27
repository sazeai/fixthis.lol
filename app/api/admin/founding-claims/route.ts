import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthenticated } from "@/lib/marketplace/admin-auth"
import { normalizeProductUrl } from "@/lib/marketplace/helpers"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { createAdminClient } from "@/utils/supabase/admin"

const schema = z.object({ problemId: z.string().uuid(), productName: z.string().trim().min(1).max(80), productTagline: z.string().trim().min(3).max(180), destinationUrl: z.string().url(), email: z.string().email() })
export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid claim." }, { status: 400 })
  let normalized: ReturnType<typeof normalizeProductUrl>; try { normalized = normalizeProductUrl(parsed.data.destinationUrl) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid URL." }, { status: 400 }) }
  const supabase = createAdminClient()
  const { data: product, error: productError } = await supabase.from("products").upsert({ registrable_domain: normalized.registrableDomain, name: parsed.data.productName, tagline: parsed.data.productTagline, destination_url: normalized.destinationUrl, owner_email: parsed.data.email.toLowerCase() }, { onConflict: "registrable_domain" }).select("id").single()
  if (productError || !product) return NextResponse.json({ error: "Product could not be created." }, { status: 500 })
  const { error } = await supabase.from("placements").upsert({ problem_id: parsed.data.problemId, product_id: product.id, current_bid_cents: 0, status: "active", founding_claim: true }, { onConflict: "problem_id,product_id" })
  if (error) return NextResponse.json({ error: "Founding claim could not be created." }, { status: 500 })
  // A silently failed rebuild leaves the claim with no rotation epoch, so the
  // problem keeps serving nothing. Surface it instead of reporting success.
  const { error: rotationError } = await supabase.rpc("rebuild_rotation", { p_problem_id: parsed.data.problemId })
  if (rotationError) {
    console.error("Founding claim rotation rebuild failed", rotationError)
    return NextResponse.json({ error: "Claim saved but the rotation could not be rebuilt." }, { status: 500 })
  }
  invalidateProblemOrdering()
  return NextResponse.json({ ok: true })
}
