import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProblemDetailView } from "@/components/marketplace/problem-detail-view"
import { PresenceTracker } from "@/components/marketplace/presence-tracker"
import { getProblemBySlug, getPublicTrafficStats } from "@/lib/marketplace/queries"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ duplicate?: string; payment?: string; quote?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const problem = await getProblemBySlug(slug).catch(() => null)
  if (!problem) return { title: "Problem not found" }
  const description = `${problem.support_count} people have hit ME TOO on this. See the ${problem.competitor_count} alternatives bidding to win them over on FIXTHIS.`
  return {
    title: problem.statement,
    description,
    alternates: { canonical: `/problems/${problem.slug}` },
    openGraph: {
      type: "article",
      url: `/problems/${problem.slug}`,
      title: problem.statement,
      description,
      publishedTime: problem.published_at || problem.created_at,
    },
    twitter: { card: "summary_large_image", title: problem.statement, description },
  }
}

export default async function ProblemPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const [problem, traffic] = await Promise.all([getProblemBySlug(slug).catch(() => null), getPublicTrafficStats().catch(() => ({ live_visitors: null, visitors_24h: 0 }))])
  if (!problem) notFound()

  // Describe the page as what it is: a page about a stated problem. We do not
  // emit review, rating, or product markup, because a featured solution is a
  // paid placement rather than an endorsement.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/problems/${problem.slug}`,
        url: `${SITE_URL}/problems/${problem.slug}`,
        name: problem.statement,
        description: `${problem.support_count} people report this problem. ${problem.competitor_count} products are competing for the paid featured placement.`,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
        datePublished: problem.published_at || problem.created_at,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Problems", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: problem.category, item: `${SITE_URL}/?category=${encodeURIComponent(problem.category)}` },
          { "@type": "ListItem", position: 3, name: problem.statement },
        ],
      },
    ],
  }

  return <>
    <script type="application/ld+json" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    <PresenceTracker initial={traffic} badge={false} />
    <ProblemDetailView problem={problem} duplicate={query.duplicate === "1"} paymentCancelled={query.payment === "cancelled"} cancelledQuoteId={query.quote || ""} />
  </>
}
