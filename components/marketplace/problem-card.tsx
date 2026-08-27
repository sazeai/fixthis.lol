import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { BidModal } from "@/components/marketplace/bid-modal"
import { FeaturedSolution } from "@/components/marketplace/featured-solution"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemSummary } from "@/types/marketplace"

export function ProblemCard({ problem, index }: { problem: ProblemSummary; index: number }) {
  const isFirst = index === 0
  const contested = problem.competitor_count > 0

  return (
    <article
      className={`group relative isolate flex h-full min-h-[180px] flex-col overflow-hidden transition-[background-color,box-shadow,transform] duration-300 ease-out hover:z-10 hover:-translate-y-px ${
        isFirst
          ? "bg-[#fff6f2] shadow-[inset_0_0_0_1px_rgba(216,77,55,.16)] hover:shadow-[inset_0_0_0_1px_rgba(216,77,55,.28),0_14px_30px_-18px_rgba(216,77,55,.45)]"
          : "bg-[#fafafa] hover:bg-white hover:shadow-[0_1px_2px_rgba(55,50,47,.04),0_14px_30px_-18px_rgba(55,50,47,.42)]"
      }`}
    >

      {/* Whole card is the target; interactive controls sit above it on z-10. */}
      <Link
        href={`/problems/${problem.slug}`}
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef4e37]"
      >
        <span className="sr-only">Open “{problem.statement}”</span>
      </Link>

      <div className="pointer-events-none relative z-10 flex h-full flex-col px-5 pb-3.5 pt-4 sm:px-6">

        {/* Meta */}
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[9px] font-semibold tabular-nums transition-colors duration-300 bg-white p-1.5 rounded-md ${
              isFirst ? "text-[#d84d37]" : "text-[#929292] group-hover:text-[#777]"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-2.5 w-px bg-[rgba(55,50,47,.16)]" />
          <span className="truncate font-mono text-[12px] uppercase tracking-[0.05em] font-semibold text-[#8a857e]">{problem.category}</span>
          {problem.origin === "curated" ? (
            <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-[#7d7d7d]">Curated</span>
          ) : null}
          {isFirst ? (
            <span className="ml-auto shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[#d84d37]">Trending</span>
          ) : (
            <ArrowUpRight
              size={12}
              className="ml-auto shrink-0 -translate-x-0.5 translate-y-0.5 text-[#c4c0ba] opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            />
          )}
        </div>

        {/* The statement is the headline and owns the full width. */}
        <p className="mt-2.5 line-clamp-3 text-[14px] font-medium leading-[1.45] tracking-[-0.011em] text-[#2f2c28]">
          “{problem.statement}”
        </p>

        {/* One status line: the featured solution, or an honest unclaimed note. */}
        <div className="mt-3 flex min-w-0 items-center gap-2">
          <div className="pointer-events-auto min-w-0 flex-1">
            <FeaturedSolution problemId={problem.id} compact nextBidCents={problem.next_bid_cents} />
          </div>
          {contested ? (
            <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8a857e]">
              {problem.competitor_count} competing
            </span>
          ) : null}
        </div>

        {/* Actions */}
        <div className="pointer-events-auto mt-auto flex items-center justify-between gap-2 border-t border-[rgba(55,50,47,0.1)] pt-2.5">
          <SupportProblem problemId={problem.id} initialCount={problem.support_count} compact />
          <BidModal problemId={problem.id} statement={problem.statement} nextBidCents={problem.next_bid_cents} compact />
        </div>
      </div>
    </article>
  )
}
