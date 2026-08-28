import { BidSuccess } from "@/components/marketplace/bid-success"

export const dynamic = "force-dynamic"
export const metadata = { title: "Placement status", robots: { index: false, follow: false } }
export default async function BidSuccessPage({ searchParams }: { searchParams: Promise<{ quote?: string }> }) {
  const { quote = "" } = await searchParams
  return <BidSuccess quoteId={quote} />
}
