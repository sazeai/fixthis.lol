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
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-4 py-2.5 sm:px-6">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.05em] text-[#de422a]">
          What people here say they’re looking at
        </p>
        <p className="font-sans text-[11px] font-medium text-[#777]">
          {evidenceCount} {evidenceCount === 1 ? "signal" : "signals"} shared
        </p>
      </div>

      <div className={`grid ${hasCandidates && hasComplaints ? "lg:grid-cols-2" : "grid-cols-1"}`}>
        {hasCandidates ? (
        <section className={`p-4 sm:p-5 ${hasComplaints ? "border-b border-[rgba(55,50,47,.1)] lg:border-b-0 lg:border-r" : ""}`}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-[#111]">Considering instead</h2>
            <span className="font-sans text-[11px] font-medium text-[#777]">
              {candidateMentions} named
            </span>
          </div>

          <ul className="mt-3 flex flex-wrap gap-1.5">
            {problem.switch_candidates.map((item) => (
              <li
                key={item.name.toLowerCase()}
                className="inline-flex items-baseline gap-1.5 border border-[rgba(55,50,47,0.12)] bg-white px-2.5 py-1"
              >
                <span className="font-sans text-[13px] text-[#222]">{item.name}</span>
                <span className="font-sans text-[11px] font-bold text-[#777]">&times;{item.count}</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 font-sans text-[11px] leading-relaxed text-[#777]">Anonymous product names, grouped into counts. Not endorsements.</p>
        </section>
        ) : null}

        {hasComplaints ? (
        <section className="px-5 py-5 sm:px-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-[14px] font-semibold text-[#111]">What specifically sucks</h2>
            <span className="font-sans text-[11px] font-medium text-[#777]">
              {problem.complaints.length} {problem.complaints.length === 1 ? "detail" : "details"}
            </span>
          </div>

          <div className="mt-3 divide-y divide-[rgba(55,50,47,.09)] border-y border-[rgba(55,50,47,.09)]">
            {problem.complaints.map((item) => (
              <blockquote key={item.id} className="py-2.5 font-sans text-[13px] leading-relaxed text-[#333]">
                <span aria-hidden="true" className="mr-1 font-bold text-[#de422a]">“</span>{item.detail}<span aria-hidden="true" className="font-bold text-[#de422a]">”</span>
              </blockquote>
            ))}
          </div>

          <p className="mt-3 font-sans text-[11px] leading-relaxed text-[#777]">Published by signed-in people who said they share this problem.</p>
        </section>
        ) : null}
      </div>
    </section>
  )
}
