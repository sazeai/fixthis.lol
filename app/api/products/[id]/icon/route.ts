import { NextResponse } from "next/server"
import { refreshProductIcon } from "@/lib/marketplace/favicon"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

// One in-flight fetch per product per instance, so a board full of cards for the
// same advertiser cannot stampede its origin.
const inFlight = new Map<string, Promise<{ base64: string; contentType: string } | null>>()

function serve(base64: string, contentType: string) {
  const bytes = Buffer.from(base64, "base64")
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType || "image/x-icon",
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // A third-party icon must never be able to run script on our origin.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  })
}

/**
 * Serves a stored product favicon from our own origin, fetching it on first
 * request if it has never been tried.
 *
 * Self-healing on purpose: relying on settlement alone meant advertisers added
 * before icons existed would never get one, and a backfill nobody remembers to
 * run is not a mechanism. After one attempt the result is recorded either way,
 * so a domain with no usable icon is asked once and then falls back to the
 * monogram without further requests.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: product } = await supabase
    .from("products")
    .select("id,registrable_domain,icon_base64,icon_content_type,icon_attempted_at,status")
    .eq("id", id)
    .maybeSingle()

  if (!product || product.status !== "active") return new NextResponse(null, { status: 404 })
  if (product.icon_base64) return serve(product.icon_base64, product.icon_content_type)

  // If already tried very recently (< 15 mins) and found nothing, 404 fast
  const attemptedRecently = product.icon_attempted_at && (Date.now() - new Date(product.icon_attempted_at).getTime() < 15 * 60 * 1000)
  if (attemptedRecently) return new NextResponse(null, { status: 404 })

  try {
    let pending = inFlight.get(id)
    if (!pending) {
      // Tight budget: this is blocking an image request, not a webhook.
      pending = refreshProductIcon(supabase, id, product.registrable_domain, 4_000)
        .then((icon) => (icon ? { base64: icon.base64, contentType: icon.contentType } : null))
        .finally(() => inFlight.delete(id))
      inFlight.set(id, pending)
    }
    const icon = await pending
    if (icon) return serve(icon.base64, icon.contentType)
  } catch (error) {
    console.error("Lazy icon fetch failed", { productId: id, error })
  }

  return new NextResponse(null, { status: 404 })
}
