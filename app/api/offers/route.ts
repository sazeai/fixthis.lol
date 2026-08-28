import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/marketplace/auth"
import { getRequestIp, isKnownBot, normalizeProductUrl } from "@/lib/marketplace/helpers"
import { jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { checkMarketplaceRateLimit } from "@/lib/marketplace/rate-limit"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { verifyTurnstile } from "@/lib/marketplace/turnstile"
import { firstZodError, offerSchema } from "@/lib/marketplace/validation"
import { dailyIpKey } from "@/lib/marketplace/visitor"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

/** Everything after the first "@", lowercased. */
function emailDomain(email: string) {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase()
}

/**
 * A product answers a problem.
 *
 * Answering is free. It is not anonymous, and it never was safe to make it so:
 * this writes public prose under a named company, next to a complaint about
 * that company's competitor.
 *
 * The gate is ownership of the product, established one of three ways — see the
 * comment at the check itself. Whichever way it came, `verified` is decided
 * here from the session and the database. It is never read from the request
 * body, because a submitted address proves nothing about who is sending it.
 */
export async function POST(request: Request) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)
  if (isKnownBot(request)) return jsonError("Automated submissions are not accepted.", 403)

  const user = await getAuthenticatedUser(request)
  if (!user?.email) return jsonError("Sign in to answer a problem.", 401)
  const accountEmail = user.email.toLowerCase()

  const ip = getRequestIp(request)
  const ipKey = dailyIpKey(ip)
  // Per account as well as per IP: the account is the real identity here, and
  // one person behind a shared NAT should not exhaust everyone else's budget.
  const [ipLimit, userLimit] = await Promise.all([
    checkMarketplaceRateLimit(`offer-ip:${ipKey}`, 10),
    checkMarketplaceRateLimit(`offer-user:${user.id}`, 10),
  ])
  if (!ipLimit.allowed || !userLimit.allowed) return jsonError("Too many answers. Try again later.", 429)

  const parsed = offerSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(firstZodError(parsed.error))
  if (parsed.data.website) return jsonError("This answer could not be posted.")
  if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) return jsonError("Bot verification failed.", 403)

  let normalized: ReturnType<typeof normalizeProductUrl>
  try { normalized = normalizeProductUrl(parsed.data.destinationUrl) }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Enter a valid product URL.") }

  const supabase = createAdminClient()
  const { data: problem } = await supabase
    .from("problems").select("id,slug")
    .eq("id", parsed.data.problemId).eq("status", "published").maybeSingle()
  if (!problem) return jsonError("Problem not found.", 404)

  const { data: existing } = await supabase
    .from("products")
    .select("id,claimed_by,claim_verified,claim_grant_id")
    .eq("registrable_domain", normalized.registrableDomain)
    .maybeSingle()

  // Three ways to be allowed to speak for a product, checked strongest first.
  // All three produce the same thing — ownership — so nothing downstream has to
  // know which one applied.
  //
  //   1. Mail at the product's own domain. Self-serve, and the reason the
  //      magic link is proof: nobody outside the company reads that mailbox. A
  //      subdomain address counts for the same reason.
  //   2. You already own this product, from an earlier answer or an admin grant.
  //   3. An admin issued you a claim. This exists because real founders run
  //      their mail on gmail and the first suppliers here are hand-recruited.
  const domain = emailDomain(accountEmail)
  const ownsDomain = domain === normalized.registrableDomain || domain.endsWith(`.${normalized.registrableDomain}`)
  const alreadyOwns = Boolean(existing?.claimed_by && existing.claimed_by === user.id)

  // A product has one owning account. A second person at the same company may
  // genuinely represent it, but silently replacing the dashboard owner would
  // make the first account lose control. That needs an explicit admin transfer,
  // not a side effect of posting an answer.
  if (existing?.claimed_by && !alreadyOwns) {
    return jsonError("This product is already managed by another account. Ask an administrator to transfer it.", 409)
  }

  let grantId: string | null = null
  let grantVerified = false
  if (!ownsDomain && !alreadyOwns) {
    const { data: grant } = await supabase
      .from("product_claim_grants")
      .select("id,verified")
      .eq("email", accountEmail)
      .eq("registrable_domain", normalized.registrableDomain)
      .is("revoked_at", null)
      .maybeSingle()
    if (!grant) {
      return jsonError(
        `To answer as ${normalized.registrableDomain}, sign in with an email at that domain. You are signed in as ${accountEmail}. If you cannot, ask us to verify you by hand.`,
        403,
        { needsDomain: normalized.registrableDomain, signedInAs: accountEmail },
      )
    }
    grantId = grant.id
    grantVerified = grant.verified
  }

  // A domain match always earns the mark. A grant earns it only if the admin
  // said so, because the badge's promise is that somebody confirmed this author
  // represents this product — not that a regex matched.
  const verified = ownsDomain || (alreadyOwns ? Boolean(existing?.claim_verified) : grantVerified)
  const ownershipGrantId = ownsDomain
    ? null
    : alreadyOwns
      ? existing?.claim_grant_id || null
      : grantId
  const now = new Date().toISOString()
  const productFields = {
    name: parsed.data.productName,
    tagline: parsed.data.productTagline,
    destination_url: normalized.destinationUrl,
    owner_email: accountEmail,
    claimed_by: user.id,
    claim_verified: verified,
    claim_grant_id: ownershipGrantId,
    updated_at: now,
  }

  // Claiming is conditional instead of a broad upsert: two accounts racing to
  // claim the same previously unowned product must never be able to overwrite
  // each other. Existing owners may update their own product; unclaimed rows
  // may be claimed once; new rows rely on the unique domain constraint.
  const productResult = existing
    ? await (() => {
        let update = supabase.from("products").update({
          ...productFields,
          ...(alreadyOwns ? {} : { claimed_at: now }),
        }).eq("id", existing.id)
        update = alreadyOwns ? update.eq("claimed_by", user.id) : update.is("claimed_by", null)
        return update.select("id,name").maybeSingle()
      })()
    : await supabase.from("products").insert({
        registrable_domain: normalized.registrableDomain,
        ...productFields,
        claimed_at: now,
        created_via: "vendor",
      }).select("id,name").single()
  const { data: product, error: productError } = productResult
  if (productError || !product) {
    console.error("Offer product upsert failed", productError)
    if (productError?.code === "23505" || (!productError && !product)) {
      return jsonError("This product was claimed by another account while you were posting. Ask an administrator to transfer it.", 409)
    }
    return jsonError("Your answer could not be posted.", 500)
  }

  // Ownership is the grant's redemption, even if this particular answer later
  // collides with an existing one. Reissued grants also restore the identity
  // mark on earlier answers made under the same manual check.
  if (grantId) {
    const [{ error: redeemError }, { error: verificationError }] = await Promise.all([
      supabase.from("product_claim_grants")
        .update({ redeemed_at: now })
        .eq("id", grantId)
        .is("redeemed_at", null),
      supabase.from("offers")
        .update({ verified: grantVerified })
        .eq("claim_grant_id", grantId),
    ])
    if (redeemError || verificationError) {
      console.error("Claim grant redemption bookkeeping failed", { redeemError, verificationError })
    }
    invalidateProblemOrdering()
  }

  const { error: offerError } = await supabase.from("offers").insert({
    problem_id: problem.id,
    product_id: product.id,
    solves_text: parsed.data.solvesText,
    switch_incentive: parsed.data.switchIncentive || null,
    created_by_email: accountEmail,
    created_by: user.id,
    claim_grant_id: ownershipGrantId,
    verified,
    status: "active",
  })
  if (offerError) {
    // unique (problem_id, product_id): one answer per product per problem, so a
    // product cannot stack the page with restatements of the same pitch.
    if (offerError.code === "23505") {
      return jsonError("Your product has already answered this problem. Edit it from your dashboard.", 409)
    }
    console.error("Offer insert failed", offerError)
    return jsonError("Your answer could not be posted.", 500)
  }

  invalidateProblemOrdering()
  return NextResponse.json({ ok: true, slug: problem.slug, verified })
}
