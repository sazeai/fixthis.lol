import { createHash, randomBytes } from "crypto"
import { getDomain } from "tldts"

import { SITE_REFERRAL_SOURCE } from "@/lib/site"

export const PROBLEM_CATEGORIES = [
  "Analytics", "Automation", "Communication", "Design", "Developer tools",
  "Finance", "Knowledge", "Marketing", "Product", "Productivity", "Sales", "Support", "Other",
] as const

/**
 * Infer a category from the software named and the complaint text.
 *
 * The form no longer asks — one less field between a person and the thing they
 * came to say. Keyword matching is deliberately shallow: it only has to be
 * right often enough for the category filter to be useful, and admin can
 * correct anything it gets wrong.
 */
const CATEGORY_HINTS: Array<[(typeof PROBLEM_CATEGORIES)[number], RegExp]> = [
  ["Support", /intercom|zendesk|helpscout|freshdesk|crisp|tidio|chatwoot|support|helpdesk|ticket|live chat/i],
  ["Analytics", /google analytics|ga4|plausible|mixpanel|amplitude|analytic|dashboard|metrics|tracking/i],
  ["Automation", /zapier|make\.com|integromat|n8n|workflow|automation|integrat/i],
  ["Finance", /quickbooks|xero|freshbooks|stripe|invoice|billing|accounting|bookkeep|expense|payroll|tax/i],
  ["Marketing", /hootsuite|buffer|later|sprout|mailchimp|klaviyo|typeform|seo|newsletter|campaign|social media|email marketing/i],
  ["Sales", /salesforce|hubspot|pipedrive|crm|lead|prospect|outreach|follow.?up|deal/i],
  ["Design", /figma|canva|adobe|photoshop|illustrator|sketch|design|logo|image|photo|video edit/i],
  ["Developer tools", /github|gitlab|vercel|aws|vmware|docker|kubernetes|api|deploy|server|hosting|database|captcha|bot protection/i],
  ["Knowledge", /notion|obsidian|confluence|evernote|roam|wiki|notes?|documentation|bookmark|knowledge/i],
  ["Communication", /slack|teams|discord|zoom|skype|meet|call|messaging|inbox|chat/i],
  ["Productivity", /asana|trello|monday|clickup|jira|linear|airtable|calendar|schedul|task|project management|spreadsheet|pdf/i],
  ["Product", /feedback|roadmap|review|user research|app store|survey/i],
]

export function inferProblemCategory(targetProductName: string, statement: string): (typeof PROBLEM_CATEGORIES)[number] {
  // The named product is the stronger signal, so it is weighed first.
  for (const [category, pattern] of CATEGORY_HINTS) if (pattern.test(targetProductName)) return category
  for (const [category, pattern] of CATEGORY_HINTS) if (pattern.test(statement)) return category
  return "Other"
}

export function normalizeProblemStatement(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
}

export function createProblemSlug(statement: string) {
  const normalized = normalizeProblemStatement(statement).split(" ").slice(0, 9).join("-").slice(0, 72) || "problem"
  return `${normalized}-${randomBytes(2).toString("hex")}`
}

export function normalizeProductUrl(value: string) {
  const url = new URL(value)
  if (url.protocol !== "https:") throw new Error("Product URLs must use HTTPS.")
  if (url.username || url.password) throw new Error("Product URLs cannot contain credentials.")
  const hostname = url.hostname.toLowerCase().replace(/^www\./, "")
  if (hostname === "localhost" || hostname.endsWith(".local")) throw new Error("Enter a public product URL.")
  const domain = getDomain(hostname, { allowPrivateDomains: false })
  if (!domain) throw new Error("Enter a valid public product domain.")
  url.hash = ""
  return { destinationUrl: url.toString(), registrableDomain: domain.toLowerCase() }
}

/**
 * Tag an outbound advertiser link so the destination can recognise the visit in
 * its own analytics, the way ChatGPT tags the links it cites.
 *
 * Three parameters because the tools disagree: GA4 reads utm_source with
 * utm_medium, Plausible and Fathom read ref. Every one of them is the same
 * constant for every visitor - nothing here says anything about the person
 * clicking, so this discloses no more than the Referer header these links
 * already send.
 *
 * Anything the advertiser set on their own URL wins; they may already be
 * tracking us their own way, and the utm pair is set together or not at all so
 * we never attach our medium to someone else's campaign.
 */
export function withReferralTag(destinationUrl: string) {
  try {
    const url = new URL(destinationUrl)
    if (url.protocol !== "https:" && url.protocol !== "http:") return destinationUrl
    if (!url.searchParams.has("ref")) url.searchParams.set("ref", SITE_REFERRAL_SOURCE)
    if (!url.searchParams.has("utm_source") && !url.searchParams.has("utm_medium")) {
      url.searchParams.set("utm_source", SITE_REFERRAL_SOURCE)
      url.searchParams.set("utm_medium", "referral")
    }
    return url.toString()
  } catch {
    // A placeholder or malformed destination is left exactly as it was rather
    // than turned into a broken link.
    return destinationUrl
  }
}

export function getAppUrl(requestUrl?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL
  if (configured) return configured.replace(/\/$/, "")
  if (requestUrl) return new URL(requestUrl).origin
  return "http://localhost:3000"
}

export function getRequestIp(request: Request) {
  return request.headers.get("cf-connecting-ip") || request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

export function isKnownBot(request: Request) {
  const userAgent = request.headers.get("user-agent") || ""
  return /bot|crawler|spider|slurp|facebookexternalhit|twitterbot|slackbot|discordbot|preview/i.test(userAgent)
}

export function sha256(value: string) { return createHash("sha256").update(value).digest("hex") }

export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100)
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: value >= 1000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value)
}

export function rotationPercentages(count: number) {
  if (count <= 0) return []
  if (count === 1) return [100]
  if (count === 2) return [70, 30]
  const lowerCount = Math.min(count, 5) - 2
  const base = Math.floor(15 / lowerCount)
  const remainder = 15 % lowerCount
  return [60, 25, ...Array.from({ length: lowerCount }, (_, index) => base + (index < remainder ? 1 : 0))]
}
