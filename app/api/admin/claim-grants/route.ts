import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthenticated } from "@/lib/marketplace/admin-auth"
import { jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { firstZodError } from "@/lib/marketplace/validation"
import { createAdminClient } from "@/utils/supabase/admin"
import { getDomain } from "tldts"

export const runtime = "nodejs"

const createSchema = z.object({
  action: z.literal("create"),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  // Accepts a bare domain or a full URL, because the thing you have in front of
  // you when granting is usually the founder's website.
  domain: z.string().trim().min(3).max(255),
  note: z.string().trim().min(3, "Say why this was granted.").max(280),
  verified: z.boolean().default(true),
})

const revokeSchema = z.object({
  action: z.literal("revoke"),
  id: z.string().uuid(),
})

const schema = z.discriminatedUnion("action", [createSchema, revokeSchema])

/** Reduce whatever was typed to the registrable domain the offer route compares against. */
function toRegistrableDomain(input: string): string | null {
  const raw = input.replace(/^https?:\/\//i, "").split("/")[0].replace(/^www\./i, "").toLowerCase()
  return getDomain(raw, { allowPrivateDomains: false })
}

/**
 * Issue or revoke a claim grant.
 *
 * The manual half of product ownership. A grant lets one email answer as one
 * domain without proving it by mail, which is what makes hand-recruiting the
 * first suppliers possible — plenty of real founders run their company on
 * gmail, and losing one of them to a domain check is a worse outcome than
 * vouching for them by hand and writing down why.
 *
 * `note` is required for that reason: this table is the audit trail for every
 * claim that did not prove itself.
 */
export async function POST(request: Request) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)
  if (!await isAdminAuthenticated()) return jsonError("Unauthorized.", 401)

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(firstZodError(parsed.error))
  const supabase = createAdminClient()

  if (parsed.data.action === "revoke") {
    const { data: grant } = await supabase
      .from("product_claim_grants")
      .select("id,revoked_at")
      .eq("id", parsed.data.id)
      .maybeSingle()
    if (!grant) return jsonError("This grant does not exist.", 404)

    if (!grant.revoked_at) {
      const { error } = await supabase
        .from("product_claim_grants")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", parsed.data.id)
      if (error) return jsonError("Could not revoke the grant.", 500)
    }

    // Keep the answer itself public, but remove permissions and any identity
    // marks that existed only because of this manual check.
    const [{ error: productError }, { error: offerError }] = await Promise.all([
      supabase.from("products").update({
        claimed_by: null,
        claimed_at: null,
        owner_email: null,
        claim_verified: false,
        claim_grant_id: null,
      }).eq("claim_grant_id", parsed.data.id),
      supabase.from("offers").update({ verified: false }).eq("claim_grant_id", parsed.data.id),
    ])
    if (productError || offerError) {
      console.error("Claim grant cleanup failed", { productError, offerError })
      return jsonError("The grant was revoked, but its product permissions could not be fully cleared.", 500)
    }
    invalidateProblemOrdering()

    if (!grant.revoked_at) {
      const { error: auditError } = await supabase.from("moderation_audit").insert({
        entity_type: "claim_grant", entity_id: parsed.data.id, action: "revoke",
      })
      if (auditError) console.error("Claim grant revoke audit failed", auditError)
    }
    return NextResponse.json({ ok: true })
  }

  const domain = toRegistrableDomain(parsed.data.domain)
  if (!domain) return jsonError("Enter a valid public product domain.")
  const email = parsed.data.email.toLowerCase()

  const [{ data: product }, { data: previousGrant }] = await Promise.all([
    supabase.from("products")
      .select("id,claimed_by,owner_email,claim_grant_id")
      .eq("registrable_domain", domain)
      .maybeSingle(),
    supabase.from("product_claim_grants")
      .select("id,redeemed_at,revoked_at")
      .eq("email", email)
      .eq("registrable_domain", domain)
      .maybeSingle(),
  ])

  if (product?.claimed_by && product.owner_email?.toLowerCase() !== email) {
    return jsonError("That product is already managed by another account. Transfer it explicitly before issuing this grant.", 409)
  }

  const { data, error } = await supabase
    .from("product_claim_grants")
    .upsert({
      email,
      registrable_domain: domain,
      note: parsed.data.note,
      verified: parsed.data.verified,
      redeemed_at: previousGrant?.revoked_at ? null : previousGrant?.redeemed_at || null,
      // Re-issuing a previously revoked grant reopens it rather than colliding
      // with the unique constraint and reporting a confusing failure.
      revoked_at: null,
    }, { onConflict: "email,registrable_domain" })
    .select("id")
    .single()
  if (error || !data) {
    console.error("Claim grant upsert failed", error)
    return jsonError("Could not issue the grant.", 500)
  }

  // Changing the mark on a live grant must also change the product and answers
  // that inherited it. A reissued revoked grant has no owner until it is used
  // again, so it does not resurrect permissions behind the admin's back.
  if (product && product.claim_grant_id === data.id) {
    const productId = product.id
    const [{ error: productError }, { error: offerError }] = await Promise.all([
      supabase.from("products").update({ claim_verified: parsed.data.verified }).eq("id", productId),
      supabase.from("offers").update({ verified: parsed.data.verified }).eq("claim_grant_id", data.id),
    ])
    if (productError || offerError) {
      console.error("Claim grant verification update failed", { productError, offerError })
      return jsonError("The grant was issued, but its verification state could not be applied.", 500)
    }
    invalidateProblemOrdering()
  }

  const { error: auditError } = await supabase.from("moderation_audit").insert({
    entity_type: "claim_grant", entity_id: data.id, action: "grant", reason: parsed.data.note,
  })
  if (auditError) console.error("Claim grant audit failed", auditError)
  return NextResponse.json({ ok: true, id: data.id, domain, email })
}
