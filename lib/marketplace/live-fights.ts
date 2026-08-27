import type { ProblemSummary } from "@/types/marketplace"

/**
 * Paid circulation, kept strictly separate from organic ranking.
 *
 * Organic order is decided by ME TOO activity, clicks, and freshness — money
 * cannot buy it. What money buys is *additional circulation*: a contested
 * problem is injected into pages it would not organically reach, so a problem
 * sitting at #48 still gets seen while companies are actively fighting inside
 * it. The two systems never feed each other.
 */

/** Cards per board page, and where injected fights sit within one. */
export const PAGE_SIZE = 12
export const INJECTION_SLOTS = [4, 10] as const // zero-based: positions #5 and #11
export const ORGANIC_PER_PAGE = PAGE_SIZE - INJECTION_SLOTS.length

/** No single problem may take more than this share of all injected slots. */
const MAX_SHARE_PER_PROBLEM = 0.3

/**
 * Circulation weight for a contested problem.
 *
 * Deliberately softened: a $500 bid should out-circulate a $5 claim, but not by
 * a hundred times, or one advertiser would own every injected slot on the site.
 * The square root compresses that to roughly ten times, and the multipliers for
 * a real fight and for recent money keep a busy contest ahead of a rich one.
 */
export function circulationWeight(problem: ProblemSummary): number {
  if (problem.competitor_count < 1 || problem.top_bid_cents <= 0) return 0

  const spend = Math.sqrt(problem.top_bid_cents / 100)
  // An actual fight circulates more than a single uncontested claim.
  const contest = 1 + Math.min(problem.competitor_count - 1, 4) * 0.35
  // Money moving right now is more interesting than money that moved a while ago.
  const momentum = problem.bids_24h > 0 ? 1.4 : 1
  return spend * contest * momentum
}

/**
 * Build the rotation of injected slots.
 *
 * Independent weighted draws cannot honour a hard share ceiling: a board has
 * only a handful of injected slots, so the outcome quantises and the richest
 * problem routinely lands well past its cap. Instead the slots are *allocated*
 * — each problem gets a whole number of places in a fixed-length rotation,
 * proportional to weight and hard-capped — and pages read from that rotation.
 *
 * The cap is then arithmetic rather than probabilistic: no problem holds more
 * places than the ceiling allows, so none can exceed that share of injections.
 */
function buildRotation(
  pool: Array<{ problem: ProblemSummary; weight: number }>,
  buckets = 20,
): ProblemSummary[] {
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
  if (total <= 0) return []

  const maxPerProblem = Math.max(1, Math.floor(buckets * MAX_SHARE_PER_PROBLEM))
  const ranked = [...pool].sort((a, b) => b.weight - a.weight)

  // Proportional share, floored and capped, largest weight served first.
  const allocation = ranked.map((entry) => ({
    problem: entry.problem,
    places: Math.min(maxPerProblem, Math.max(1, Math.round((entry.weight / total) * buckets))),
  }))

  // Hand any places freed by the cap to problems still under it, so a whale's
  // surplus circulation goes to its rivals rather than back to itself.
  let spare = buckets - allocation.reduce((sum, entry) => sum + entry.places, 0)
  while (spare > 0) {
    const candidate = allocation.find((entry) => entry.places < maxPerProblem)
    if (!candidate) break
    candidate.places += 1
    spare -= 1
  }

  // Interleave rather than blocking, so consecutive pages do not all show the
  // same problem before moving on to the next.
  const rotation: ProblemSummary[] = []
  const remaining = allocation.map((entry) => ({ ...entry }))
  while (remaining.some((entry) => entry.places > 0)) {
    for (const entry of remaining) {
      if (entry.places <= 0) continue
      rotation.push(entry.problem)
      entry.places -= 1
    }
  }
  return rotation
}

export type BoardEntry = { problem: ProblemSummary; injected: boolean }

/**
 * Build one displayed page: organic cards with contested problems woven in.
 *
 * A problem already present organically on this page is never injected onto it,
 * and the organic ranking itself is left completely untouched.
 */
export function buildBoardPage(
  organic: ProblemSummary[],
  page: number,
  allProblems: ProblemSummary[],
): BoardEntry[] {
  const start = (page - 1) * ORGANIC_PER_PAGE
  const slice = organic.slice(start, start + ORGANIC_PER_PAGE)
  const entries: BoardEntry[] = slice.map((problem) => ({ problem, injected: false }))

  const rotation = buildRotation(
    allProblems
      .map((problem) => ({ problem, weight: circulationWeight(problem) }))
      .filter((entry) => entry.weight > 0),
  )
  if (!rotation.length) return entries

  const onPage = new Set(slice.map((problem) => problem.id))

  INJECTION_SLOTS.forEach((slot, index) => {
    if (slot > entries.length) return
    // Read the rotation at a position derived from the page, so a given page is
    // stable across renders while consecutive pages advance through it.
    const cursor = (page - 1) * INJECTION_SLOTS.length + index
    for (let step = 0; step < rotation.length; step += 1) {
      const candidate = rotation[(cursor + step) % rotation.length]!
      // Never inject a problem already on this page, organically or injected.
      if (onPage.has(candidate.id)) continue
      onPage.add(candidate.id)
      entries.splice(slot, 0, { problem: candidate, injected: true })
      return
    }
  })

  return entries
}

/** Total pages, counted on organic supply since injections are additional. */
export function boardPageCount(organicTotal: number) {
  return Math.max(1, Math.ceil(organicTotal / ORGANIC_PER_PAGE))
}

/** The contested problems worth naming in the Live Fights strip. */
export function topLiveFights(problems: ProblemSummary[], limit = 3): ProblemSummary[] {
  return problems
    .map((problem) => ({ problem, weight: circulationWeight(problem) }))
    .filter((entry) => entry.weight > 0 && entry.problem.competitor_count >= 1)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, limit)
    .map((entry) => entry.problem)
}
