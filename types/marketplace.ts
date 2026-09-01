export type ProblemOrigin = "curated" | "user" | "founder"
export type ProblemStatus = "published" | "pending" | "hidden"
export type OfferStatus = "active" | "suspended" | "hidden"

export type ProblemComplaint = { id: string; detail: string; created_at: string }

export type ProblemSummary = {
  id: string
  slug: string
  statement: string
  /** Software the complaint is about, e.g. "Intercom". Null on curated rows. */
  target_product_name: string | null
  /**
   * What would make the poster switch. Optional, and the whole point: it is the
   * brief a competing product reads before deciding whether it can answer.
   */
  switch_condition: string | null
  category: string
  origin: ProblemOrigin
  launch_priority: number | null
  support_count: number
  /** Outbound clicks on the answers to this problem. Not shown to buyers. */
  click_count: number
  /** How many products have said they can fix this. */
  answer_count: number
  supports_24h: number
  /**
   * Demand only. Answers deliberately do not raise a problem's rank: the moment
   * a product can lift a problem up the board by replying to it, placement is
   * for sale again through the back door.
   */
  trending_score: number
  /** The products answering, in the order a buyer should read them. */
  answers: ProblemAnswer[]
  created_at: string
  published_at: string | null
}

export type ProblemSectionId = "trending" | "answered" | "fresh" | "unanswered"

export type ProblemSection = {
  id: ProblemSectionId
  title: string
  blurb: string
  problems: ProblemSummary[]
}

/**
 * One product's answer to one problem.
 *
 * Deliberately not a placement: there is no rank, no bid and no share of
 * anything. A product earns its position by answering the complaint better,
 * which is the only ordering a buyer has any reason to care about.
 */
export type ProblemAnswer = {
  offer_id: string
  product_id: string
  name: string
  registrable_domain: string
  destination_url: string
  tagline: string
  /** How this product solves this exact complaint. Required. */
  solves_text: string
  /** What they will do for someone switching. Optional. */
  switch_incentive: string | null
  /** FIXTHIS confirmed the author represents this product; not a claim-quality judgement. */
  verified: boolean
  /** Cache-busting icon URL, or null when the monogram should render. */
  icon_url: string | null
  created_at: string
}

/** What people said they were looking at instead, counted and never attributed. */
export type SwitchCandidate = { name: string; count: number }

export type ProblemDetail = ProblemSummary & {
  complaints: ProblemComplaint[]
  switch_candidates: SwitchCandidate[]
}

export type PublicTrafficStats = {
  total_visitors: number
  total_days: number
}

export type AdminProblem = ProblemSummary & {
  status: ProblemStatus
  normalized_statement: string
  updated_at: string
}

export type AdminComplaint = {
  id: string
  detail: string
  detail_status: "none" | "published" | "pending" | "hidden"
  created_at: string
  problem_id: string
  problem_statement: string
  problem_slug: string
}

export type AdminOffer = ProblemAnswer & {
  problem_id: string
  problem_statement: string
  problem_slug: string
  owner_email: string | null
  status: OfferStatus
  /** Lifetime outbound clicks. Private to the founder console and admin. */
  click_count: number
}
