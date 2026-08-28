import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProblemDetailView } from "@/components/marketplace/problem-detail-view"
import { getProblemBySlug } from "@/lib/marketplace/queries"
import { SITE_NAME, SITE_URL } from "@/lib/site"

export const dynamic = "force-dynamic"
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ duplicate?: string }> }

/**
 * The title leads with the software, not the sentence.
 *
 * Someone reaching this page typed a product name and a grievance. A title of
 * "Profound — $99 only tracks ChatGPT" matches how the question was asked; the
 * bare statement did not. The old description sold the auction to search
 * results ("the N alternatives bidding to win them over"), which is exactly
 * the framing the pivot removes.
 */
function describe(problem: { statement: string; target_product_name: string | null; support_count: number; answer_count: number; switch_condition: string | null }) {
  const title = problem.target_product_name
    ? `${problem.target_product_name} — ${problem.statement}`
    : problem.statement

  const agree = problem.support_count === 1 ? "1 person has" : `${problem.support_count} people have`
  const answers = problem.answer_count
    ? `${problem.answer_count} ${problem.answer_count === 1 ? "alternative has" : "alternatives have"} said how they solve it.`
    : "No alternative has answered it yet."
  const wanted = problem.switch_condition ? ` What would make them switch: ${problem.switch_condition}` : ""

  return { title, description: `${agree} this problem. ${answers}${wanted}` }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const problem = await getProblemBySlug(slug).catch(() => null)
  if (!problem) return { title: "Problem not found" }
  const { title, description } = describe(problem)
  return {
    title,
    description,
    alternates: { canonical: `/problems/${problem.slug}` },
    openGraph: {
      type: "article",
      url: `/problems/${problem.slug}`,
      title,
      description,
      publishedTime: problem.published_at || problem.created_at,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

export default async function ProblemPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const problem = await getProblemBySlug(slug).catch(() => null)
  if (!problem) notFound()

  // Describe the page as what it is: a page about a stated problem. No review,
  // rating or product markup — the answers here are written by the products
  // themselves and are not endorsements.
  const { description } = describe(problem)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/problems/${problem.slug}`,
        url: `${SITE_URL}/problems/${problem.slug}`,
        name: problem.statement,
        description,
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
    <ProblemDetailView problem={problem} duplicate={query.duplicate === "1"} />
  </>
}
