import { NextResponse } from "next/server"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

/**
 * Serves a stored product favicon from our own origin.
 *
 * Cached hard: the URL carries the fetch timestamp as `v`, so a refreshed icon
 * gets a new URL rather than needing an invalidation.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: product } = await createAdminClient()
    .from("products")
    .select("icon_base64,icon_content_type,status")
    .eq("id", id)
    .maybeSingle()

  if (!product?.icon_base64 || product.status !== "active") {
    // No icon is a normal state, not an error — the card renders a monogram.
    return new NextResponse(null, { status: 404 })
  }

  const bytes = Buffer.from(product.icon_base64, "base64")
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": product.icon_content_type || "image/x-icon",
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // A third-party icon should never be able to run script on our origin.
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  })
}
