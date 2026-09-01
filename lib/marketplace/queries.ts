import "server-only"

import { cache } from "react"
import type { AdminComplaint, AdminOffer, AdminProblem, ProblemAnswer, ProblemDetail, ProblemSummary, PublicTrafficStats, SwitchCandidate } from "@/types/marketplace"
import { createAdminClient } from "@/utils/supabase/admin"

type Row = Record<string, any>

function number(value: unknown) { return Number(value || 0) }

const PRODUCT_COLUMNS = "id,name,tagline,destination_url,registrable_domain,icon_base64,icon_fetched_at,icon_attempted_at"
const OFFER_COLUMNS = `id,problem_id,product_id,status,solves_text,switch_incentive,verified,click_count,created_at,products(${PRODUCT_COLUMNS})`

/**
 * Icon URL for a product, or null to render the monogram.
 *
 * A product that has never been fetched still gets a URL: requesting it is what
 * triggers the lazy fetch in the icon route. Once a fetch has been attempted and
 * found nothing, the URL goes away so we stop asking. The timestamp busts cache
 * when an icon is refreshed.
 */
export function productIconUrl(product: Row | null | undefined): string | null {
  if (!product?.id) return null
  const neverAttempted = !product.icon_attempted_at
  if (!product.icon_base64 && !neverAttempted) return null
  const version = product.icon_fetched_at ? new Date(product.icon_fetched_at).getTime() : 0
  return `/api/products/${product.id}/icon?v=${version}`
}

/**
 * Order the answers to a problem.
 *
 * Verified first, then whoever put something concrete on the table for a
 * switcher, then newest. Every term is something the reader can act on. There
 * is nothing here a product can buy.
 */
function toAnswers(rows: Row[]): ProblemAnswer[] {
  return [...rows]
    .sort((a, b) =>
      Number(Boolean(b.verified)) - Number(Boolean(a.verified))
      || Number(Boolean(b.switch_incentive)) - Number(Boolean(a.switch_incentive))
      || new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .map((row) => {
      const product = Array.isArray(row.products) ? row.products[0] : row.products
      return {
        offer_id: row.id,
        product_id: product?.id || row.product_id,
        name: product?.name || "Unknown product",
        registrable_domain: product?.registrable_domain || "",
        destination_url: product?.destination_url || "#",
        tagline: product?.tagline || "",
        solves_text: row.solves_text || "",
        switch_incentive: row.switch_incentive ?? null,
        verified: Boolean(row.verified),
        icon_url: productIconUrl(product),
        created_at: row.created_at,
      }
    })
}

/** Free text, so fold on a normalised key but show what people actually typed. */
function toSwitchCandidates(rows: Row[]): SwitchCandidate[] {
  const counts = new Map<string, { name: string; count: number }>()
  for (const row of rows) {
    const raw = String(row.switch_candidate || "").trim()
    if (!raw) continue
    const key = raw.toLowerCase()
    const existing = counts.get(key)
    if (existing) existing.count += 1
    else counts.set(key, { name: raw, count: 1 })
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 8)
}

async function loadProblemSummaries(): Promise<ProblemSummary[]> {
  const supabase = createAdminClient()
  const { data: problems, error } = await supabase.from("problems")
    .select("id,slug,statement,target_product_name,switch_condition,category,origin,launch_priority,support_count,click_count,created_at,published_at")
    .eq("status", "published")
    .limit(200)
  if (error) throw error
  if (!problems?.length) return []

  const ids = problems.map((item: Row) => item.id)
  const since = new Date(Date.now() - 86_400_000).toISOString()
  const [{ data: offers, error: offerError }, { data: supports }] = await Promise.all([
    supabase.from("offers").select(OFFER_COLUMNS).in("problem_id", ids).eq("status", "active"),
    supabase.from("problem_supports").select("problem_id").in("problem_id", ids).gte("created_at", since),
  ])
  if (offerError) throw offerError

  const supportsBy = new Map<string, number>()
  for (const item of supports || []) supportsBy.set(item.problem_id, (supportsBy.get(item.problem_id) || 0) + 1)
  const answersBy = new Map<string, Row[]>()
  for (const item of offers || []) {
    const list = answersBy.get(item.problem_id) || []
    list.push(item)
    answersBy.set(item.problem_id, list)
  }

  const now = Date.now()
  return problems.map((row: Row) => {
    const answers = toAnswers(answersBy.get(row.id) || [])
    const supports24h = supportsBy.get(row.id) || 0
    // Freshness bonus decays linearly to zero across the first 24 published hours.
    const hoursOld = (now - new Date(row.published_at || row.created_at).getTime()) / 3_600_000
    const freshness = Math.max(0, 24 - hoursOld) / 6
    return {
      ...row,
      support_count: number(row.support_count),
      click_count: number(row.click_count),
      answer_count: answers.length,
      answers,
      supports_24h: supports24h,
      trending_score: supports24h * 5 + freshness,
    } as ProblemSummary
  })
}

// Public problem ordering is cached for two minutes so the board re-ranks on a
// visible cadence without every visitor paying for the aggregate queries.
const ORDERING_TTL_MS = 120_000
let orderingCache: { rows: ProblemSummary[]; expiresAt: number } | null = null
let orderingInFlight: Promise<ProblemSummary[]> | null = null

async function loadOrderedSummaries(): Promise<ProblemSummary[]> {
  if (orderingCache && orderingCache.expiresAt > Date.now()) return orderingCache.rows
  if (orderingInFlight) return orderingInFlight
  orderingInFlight = loadProblemSummaries()
    .then((rows) => {
      // Rank by rolling demand; fall back to curated launch priority while the board is quiet.
      rows.sort((a, b) => (b.trending_score - a.trending_score) || ((a.launch_priority || 999) - (b.launch_priority || 999)))
      orderingCache = { rows, expiresAt: Date.now() + ORDERING_TTL_MS }
      return rows
    })
    .finally(() => { orderingInFlight = null })
  return orderingInFlight
}

// Dedupe repeat calls within a single render pass on top of the cross-request TTL.
const cachedSummaries = cache(loadOrderedSummaries)

export function invalidateProblemOrdering() { orderingCache = null }

export async function getProblemSummaries(options: { search?: string; category?: string; limit?: number } = {}) {
  let rows = await cachedSummaries()
  const search = options.search?.trim().toLowerCase()
  if (search) {
    rows = rows.filter((item) =>
      item.statement.toLowerCase().includes(search)
      || item.category.toLowerCase().includes(search)
      || (item.target_product_name || "").toLowerCase().includes(search))
  }
  if (options.category && options.category !== "All") rows = rows.filter((item) => item.category === options.category)
  return rows.slice(0, options.limit || 100)
}

export async function getProblemBySlug(slug: string): Promise<ProblemDetail | null> {
  const supabase = createAdminClient()
  const { data: problem, error } = await supabase.from("problems").select("*").eq("slug", slug).eq("status", "published").maybeSingle()
  if (error) throw error
  if (!problem) return null

  const since = new Date(Date.now() - 86_400_000).toISOString()
  // Derived counts are computed for this one problem rather than looked up in
  // the cached board. The cache is up to two minutes stale and capped at 200
  // rows, so reading it here would 404 a problem that was just posted.
  const [complaintResult, offerResult, supportResult, candidateResult] = await Promise.all([
    supabase.from("problem_supports").select("id,detail,created_at").eq("problem_id", problem.id).eq("detail_status", "published").not("detail", "is", null).order("created_at", { ascending: false }).limit(30),
    supabase.from("offers").select(OFFER_COLUMNS).eq("problem_id", problem.id).eq("status", "active"),
    supabase.from("problem_supports").select("id", { count: "exact", head: true }).eq("problem_id", problem.id).gte("created_at", since),
    supabase.from("problem_supports").select("switch_candidate").eq("problem_id", problem.id).not("switch_candidate", "is", null).limit(500),
  ])

  const answers = toAnswers(offerResult.data || [])
  const supports24h = supportResult.count || 0
  const hoursOld = (Date.now() - new Date(problem.published_at || problem.created_at).getTime()) / 3_600_000
  const freshness = Math.max(0, 24 - hoursOld) / 6

  return {
    id: problem.id,
    slug: problem.slug,
    statement: problem.statement,
    target_product_name: problem.target_product_name ?? null,
    switch_condition: problem.switch_condition ?? null,
    category: problem.category,
    origin: problem.origin,
    launch_priority: problem.launch_priority,
    support_count: number(problem.support_count),
    click_count: number(problem.click_count),
    answer_count: answers.length,
    answers,
    supports_24h: supports24h,
    trending_score: supports24h * 5 + freshness,
    created_at: problem.created_at,
    published_at: problem.published_at,
    complaints: (complaintResult.data || []).map((item: Row) => ({ id: item.id, detail: item.detail, created_at: item.created_at })),
    switch_candidates: toSwitchCandidates(candidateResult.data || []),
  }
}

export async function getPublicTrafficStats(): Promise<PublicTrafficStats> {
  const supabase = createAdminClient()
  const [countResult, earliestResult] = await Promise.all([
    supabase.from("visitors").select("visitor_key", { count: "exact", head: true }),
    supabase.from("visitors").select("first_seen_at").order("first_seen_at", { ascending: true }).limit(1).maybeSingle(),
  ])
  const totalVisitors = countResult.count || 0
  const earliest = earliestResult.data?.first_seen_at ? new Date(earliestResult.data.first_seen_at).getTime() : Date.now()
  const totalDays = Math.max(1, Math.ceil((Date.now() - earliest) / (1000 * 60 * 60 * 24)))
  return { total_visitors: totalVisitors, total_days: totalDays }
}

export async function getAdminComplaints(): Promise<AdminComplaint[]> {
  const supabase = createAdminClient()
  // Pending first: those are the ones holding up a visitor's contribution.
  const { data } = await supabase
    .from("problem_supports")
    .select("id,detail,detail_status,created_at,problem_id,problems(statement,slug)")
    .not("detail", "is", null)
    .in("detail_status", ["pending", "published", "hidden"])
    .order("created_at", { ascending: false })
    .limit(200)
  const rows = (data || []).map((row: Row) => {
    const problem = Array.isArray(row.problems) ? row.problems[0] : row.problems
    return {
      id: row.id,
      detail: row.detail,
      detail_status: row.detail_status,
      created_at: row.created_at,
      problem_id: row.problem_id,
      problem_statement: problem?.statement || "",
      problem_slug: problem?.slug || "",
    } as AdminComplaint
  })
  const rank = { pending: 0, published: 1, hidden: 2, none: 3 } as Record<string, number>
  return rows.sort((a, b) => (rank[a.detail_status] ?? 9) - (rank[b.detail_status] ?? 9))
}

export async function getAdminMarketplaceData(): Promise<{ problems: AdminProblem[]; offers: AdminOffer[] }> {
  const supabase = createAdminClient()
  const summaries = await getProblemSummaries()
  const [{ data: problemRows }, { data: offerRows }] = await Promise.all([
    supabase.from("problems").select("*").order("created_at", { ascending: false }),
    supabase.from("offers").select(`${OFFER_COLUMNS},created_by_email,problems(statement,slug)`).order("created_at", { ascending: false }),
  ])
  const summaryById = new Map(summaries.map((row) => [row.id, row]))
  const problems = (problemRows || []).map((row: Row) => ({
    ...(summaryById.get(row.id) || {
      id: row.id, slug: row.slug, statement: row.statement, target_product_name: row.target_product_name ?? null,
      switch_condition: row.switch_condition ?? null, category: row.category, origin: row.origin,
      launch_priority: row.launch_priority, support_count: number(row.support_count),
      click_count: number(row.click_count), answer_count: 0, answers: [],
      supports_24h: 0, trending_score: 0, created_at: row.created_at, published_at: row.published_at,
    }),
    status: row.status, normalized_statement: row.normalized_statement, updated_at: row.updated_at,
  })) as AdminProblem[]

  const offers: AdminOffer[] = (offerRows || []).map((row: Row) => {
    const [answer] = toAnswers([row])
    const problem = Array.isArray(row.problems) ? row.problems[0] : row.problems
    return {
      ...answer,
      problem_id: row.problem_id,
      problem_statement: problem?.statement || "",
      problem_slug: problem?.slug || "",
      owner_email: row.created_by_email ?? null,
      status: row.status,
      click_count: number(row.click_count),
    }
  })
  return { problems, offers }
}

/**
 * Everything a founder sees about their own product.
 *
 * Click counts live here and only here. On the buyer's side they would be
 * noise; to the person who wrote the answer they are the reason to come back.
 */
export async function getFounderStats(productId: string): Promise<{ product: Row; offers: AdminOffer[] } | null> {
  const supabase = createAdminClient()
  const { data: product } = await supabase.from("products").select("id,name,tagline,destination_url,registrable_domain,owner_email,status").eq("id", productId).maybeSingle()
  if (!product) return null
  const { data: offerRows } = await supabase
    .from("offers")
    .select(`${OFFER_COLUMNS},created_by_email,problems(statement,slug)`)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  const offers: AdminOffer[] = (offerRows || []).map((row: Row) => {
    const [answer] = toAnswers([row])
    const problem = Array.isArray(row.problems) ? row.problems[0] : row.problems
    return {
      ...answer,
      problem_id: row.problem_id,
      problem_statement: problem?.statement || "",
      problem_slug: problem?.slug || "",
      owner_email: row.created_by_email ?? null,
      status: row.status,
      click_count: number(row.click_count),
    }
  })
  return { product, offers }
}

export type ClaimGrant = {
  id: string
  email: string
  registrable_domain: string
  note: string
  verified: boolean
  created_at: string
  redeemed_at: string | null
  revoked_at: string | null
}

/** Every claim taken on trust rather than proved by domain. Live grants first. */
export async function getClaimGrants(): Promise<ClaimGrant[]> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("product_claim_grants")
    .select("id,email,registrable_domain,note,verified,created_at,redeemed_at,revoked_at")
    .order("created_at", { ascending: false })
    .limit(200)
  return ((data || []) as ClaimGrant[])
    .sort((a, b) => Number(Boolean(a.revoked_at)) - Number(Boolean(b.revoked_at)))
}
