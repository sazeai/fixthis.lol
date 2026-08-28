import { DetailBlockHeader } from "@/components/marketplace/problem-detail/detail-block-header"
import type { ProblemDetail } from "@/types/marketplace"

/**
 * What people said they were looking at instead.
 *
 * This is the demand side naming its own supply. It is the only thing that
 * makes an unanswered problem worth reading, it is the list of products worth
 * recruiting, and it costs one optional field on the ME TOO form.
 *
 * Deliberately unlinked and unattributed: these are names people typed, not
 * endorsements, and not products that have said anything here.
 */
export function ProblemSwitchCandidates({ problem }: { problem: ProblemDetail }) {
  if (!problem.switch_candidates.length) return null

  const total = problem.switch_candidates.reduce((sum, item) => sum + item.count, 0)

  return (
    <section className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      <DetailBlockHeader label="Considering instead" aside={`${total} ${total === 1 ? "person" : "people"} named something`} />
      <div className="px-3 py-3.5 sm:px-5 sm:py-5">
        <h2 className="font-serif text-[21px] tracking-[-0.02em] text-[#111]">
          What people here say they&rsquo;re looking at
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {problem.switch_candidates.map((item) => (
            <li
              key={item.name.toLowerCase()}
              className="inline-flex items-baseline gap-1.5 border border-[rgba(55,50,47,0.12)] bg-white px-2.5 py-1.5"
            >
              <span className="text-[13px] text-[#111]">{item.name}</span>
              <span className="font-mono text-[9px] tabular-nums text-[#999]">&times;{item.count}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] leading-4 text-[#999]">
          Typed by people who have this problem. Not endorsements, and not answers from those products.
        </p>
      </div>
    </section>
  )
}
