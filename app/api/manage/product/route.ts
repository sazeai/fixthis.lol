import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/marketplace/auth"
import { normalizeProductUrl } from "@/lib/marketplace/helpers"
import { jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { verifyManagementToken } from "@/lib/marketplace/management"
import { firstZodError, productEditSchema } from "@/lib/marketplace/validation"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

/**
 * Edit a product.
 *
 * Two ways in, because there are two ways to hold a product. A signed-in owner
 * arrives from the dashboard and is matched on `claimed_by`; an older emailed
 * management link is matched on `owner_email`. Both resolve to one product id
 * before anything is written, so the update path below cannot tell them apart
 * and cannot be widened by accident.
 */
async function resolveProductId(request: Request, bodyProductId?: string): Promise<string | null> {
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  if (!bearer) return null

  // A signed-in owner. Ownership is looked up, never taken from the request.
  const user = await getAuthenticatedUser(request)
  if (user) {
    if (!bodyProductId) return null
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("products").select("id").eq("id", bodyProductId).eq("claimed_by", user.id).maybeSingle()
    return data?.id || null
  }

  // An emailed management link.
  const access = verifyManagementToken(bearer)
  if (!access) return null
  const supabase = createAdminClient()
  const { data } = await supabase.from("products").select("id,owner_email").eq("id", access.productId).maybeSingle()
  if (!data || data.owner_email?.toLowerCase() !== access.email) return null
  return data.id
}

export async function PATCH(request: Request) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)

  const body = await request.json().catch(() => null)
  const productId = await resolveProductId(request, body?.productId)
  if (!productId) return jsonError("Management access denied.", 401)

  const parsed = productEditSchema.safeParse(body)
  if (!parsed.success) return jsonError(firstZodError(parsed.error))

  let normalized: ReturnType<typeof normalizeProductUrl>
  try { normalized = normalizeProductUrl(parsed.data.destinationUrl) }
  catch (error) { return jsonError(error instanceof Error ? error.message : "Invalid URL.") }

  const supabase = createAdminClient()
  const { data: product } = await supabase.from("products").select("registrable_domain").eq("id", productId).single()
  if (!product) return jsonError("Management access denied.", 403)
  // The domain is the identity. Letting it move would carry an established
  // product record, and any verified answers under it, to somewhere the owner
  // has never proved control of.
  if (normalized.registrableDomain !== product.registrable_domain) {
    return jsonError("A product cannot be moved to a different domain.")
  }

  const { error } = await supabase.from("products")
    .update({ name: parsed.data.name, tagline: parsed.data.tagline, destination_url: normalized.destinationUrl })
    .eq("id", productId)
  if (error) return jsonError("Product could not be updated.", 500)
  return NextResponse.json({ ok: true })
}
