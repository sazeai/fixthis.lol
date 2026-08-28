import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/marketplace/auth"
import { getFounderStats } from "@/lib/marketplace/queries"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Who is signed in, and what they own.
 *
 * One account, two hats. The second hat only exists once an account has proved
 * control of a product's domain, so this is what the header reads to decide
 * whether to offer the switch at all — showing "My product" to someone who has
 * never claimed one is how you get a nav item that leads nowhere.
 */
export async function GET(request: Request) {
  const user = await getAuthenticatedUser(request)
  if (!user?.email) return NextResponse.json({ signedIn: false, products: [] }, { status: 200 })

  const supabase = createAdminClient()
  const { data: owned } = await supabase
    .from("products")
    .select("id")
    .eq("claimed_by", user.id)
    .order("created_at", { ascending: true })

  // The header only needs to know whether a second hat exists, but the
  // dashboard needs the whole thing and would otherwise make one request per
  // product on every load. There are never many.
  const products = []
  for (const row of owned || []) {
    const stats = await getFounderStats(row.id)
    if (stats) products.push({ product: stats.product, offers: stats.offers })
  }

  return NextResponse.json({ signedIn: true, email: user.email, products })
}
