import type { ProblemSection, ProblemSummary } from "@/types/marketplace"

const FRESH_WINDOW_MS = 7 * 86_400_000

function byPublished(a: ProblemSummary, b: ProblemSummary) {
  return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime()
}

/**
 * Split the ranked board into sections. Rows arrive already ordered by trending
 * score, so each bucket only needs its own secondary ordering.
 *
 * A problem may legitimately appear in more than one section — an answered
 * problem can also be trending. Only "unanswered" is mutually exclusive with
 * "answered", because they are defined by the same predicate.
 */
export function buildProblemSections(problems: ProblemSummary[]): ProblemSection[] {
  const now = Date.now()
  const answered = problems.filter((problem) => problem.answer_count > 0)
  const unanswered = problems.filter((problem) => problem.answer_count === 0)
  const fresh = problems
    .filter((problem) => problem.origin !== "curated" && now - new Date(problem.published_at || problem.created_at).getTime() < FRESH_WINDOW_MS)
    .sort(byPublished)

  const sections: ProblemSection[] = [
    {
      id: "trending",
      title: "Trending problems",
      blurb: "Where people are agreeing fastest right now.",
      problems,
    },
    {
      id: "answered",
      title: "Answered",
      blurb: "Products have said how they solve these, and what they will do for someone switching.",
      problems: [...answered].sort((a, b) => b.answer_count - a.answer_count || b.support_count - a.support_count),
    },
    {
      id: "fresh",
      title: "New pains",
      blurb: "Recently posted by people who ran into the problem themselves.",
      problems: fresh,
    },
    {
      id: "unanswered",
      title: "No answer yet",
      blurb: "Real demand that nobody has offered to solve. If you build one of these, this is your queue.",
      problems: [...unanswered].sort((a, b) => b.support_count - a.support_count || (a.launch_priority || 999) - (b.launch_priority || 999)),
    },
  ]

  // Never render an empty section — an empty shelf reads as a dead marketplace.
  return sections.filter((section) => section.problems.length > 0)
}
