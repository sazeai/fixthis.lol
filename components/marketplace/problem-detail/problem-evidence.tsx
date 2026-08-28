import type { ProblemDetail } from "@/types/marketplace"

/**
 * The two kinds of evidence behind the headline, mapped side by side.
 *
 * Switch candidates are aggregate intent; complaint details are published
 * prose. They belong in one evidence layer, but their different provenance is
 * kept explicit instead of flattening them into one list.
 */
export function ProblemEvidence({ problem }: { problem: ProblemDetail }) {
  const candidateMentions = problem.switch_candidates.reduce((sum, item) => sum + item.count, 0)
  const evidenceCount = candidateMentions + problem.complaints.length
  const hasCandidates = problem.switch_candidates.length > 0
  const hasComplaints = problem.complaints.length > 0

  // An all-empty evidence section is scaffolding, not information. The support
  // flow explains how to add context; the page should not reserve two panels
  // for data that does not exist yet.
  if (!evidenceCount) return null

  return (
    <section className="border-b border-t border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-3 py-2.5 sm:px-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">People behind the count</p>
        <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">
          {evidenceCount} {evidenceCount === 1 ? "signal" : "signals"} shared
        </p>
      </div>

      <div className={`grid ${hasCandidates && hasComplaints ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {hasCandidates ? (
        <section className={`px-5 py-5 sm:px-6 ${hasComplaints ? "border-b border-[rgba(55,50,47,.1)] lg:border-b-0 lg:border-r" : ""}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-[#111]">Considering instead</h2>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#aaa]">
              {candidateMentions} named
            </span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {problem.switch_candidates.map((item) => (
              <li
                key={item.name.toLowerCase()}
                className="inline-flex items-baseline gap-1.5 border border-[rgba(55,50,47,0.12)] bg-white px-2.5 py-1.5"
              >
                <span className="text-[12px] text-[#333]">{item.name}</span>
                <span className="font-mono text-[8px] tabular-nums text-[#aaa]">&times;{item.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[9px] leading-4 text-[#aaa]">Anonymous product names, grouped into counts. Not endorsements.</p>
        </section>
        ) : null}

        {hasComplaints ? (
        <section className="px-5 py-5 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-[#111]">What specifically sucks</h2>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#aaa]">
              {problem.complaints.length} {problem.complaints.length === 1 ? "detail" : "details"}
            </span>
          </div>

          <div className="mt-3 divide-y divide-[rgba(55,50,47,.09)] border-y border-[rgba(55,50,47,.09)]">
            {problem.complaints.map((item) => (
              <blockquote key={item.id} className="py-2.5 text-[12px] leading-5 text-[#555]">
                <span aria-hidden="true" className="mr-1 text-[#d84d37]">“</span>{item.detail}<span aria-hidden="true" className="text-[#d84d37]">”</span>
              </blockquote>
            ))}
          </div>

          <p className="mt-3 text-[9px] leading-4 text-[#aaa]">Published by signed-in people who said they share this problem.</p>
        </section>
        ) : null}
      </div>
    </section>
  )
}
