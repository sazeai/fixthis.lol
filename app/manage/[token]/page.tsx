import { notFound } from "next/navigation"
import { FounderDashboard } from "@/components/marketplace/founder-dashboard"
import { getFounderStats } from "@/lib/marketplace/queries"
import { verifyManagementToken } from "@/lib/marketplace/management"

export const dynamic = "force-dynamic"
export const metadata = { title: "Manage your product", robots: { index: false, follow: false } }
export default async function ManagePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const payload = verifyManagementToken(token)
  if (!payload) notFound()
  const result = await getFounderStats(payload.productId)
  // owner_email is nullable now that a product can exist before anyone claims
  // it; an unclaimed product has no owner to authenticate against.
  if (!result || result.product.owner_email?.toLowerCase() !== payload.email) notFound()
  return <FounderDashboard token={token} product={result.product} offers={result.offers} />
}
