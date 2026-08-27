import Link from "next/link"
import { ArrowUpRight, Zap } from "lucide-react"
import { BidModal } from "@/components/marketplace/bid-modal"
import { ProblemHighlight } from "@/components/marketplace/problem-highlight"
import type { MarketEvent } from "@/components/marketplace/market-event-feed"
import { SponsorRow } from "@/components/marketplace/sponsor-row"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemSummary } from "@/types/marketplace"

export function ProblemCard({
  problem,
  index,
  liveFight = false,
  events,
}: {
  problem: ProblemSummary
  index: number
  /**
   * Injected because companies are paying to fight over it, not because it
   * ranked here organically. Always labelled — a reader is entitled to know
   * why a card is in front of them.
   */
  liveFight?: boolean
  /** Real events recorded for this problem since the page opened. */
  events?: MarketEvent[]
}) {
  const isFirst = index === 0

  return (
    <article
      className={`group relative isolate flex h-full min-h-[180px] flex-col overflow-hidden transition-[background-color,box-shadow] duration-200 ease-out ${
        isFirst
          ? "bg-[#fff6f2] hover:shadow-[inset_0_0_0_1px_rgba(216,77,55,.26)]"
          : "bg-[#fafafa] hover:bg-white hover:shadow-[inset_0_0_0_1px_rgba(55,50,47,.09)]"
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
            className={`font-mono text-[9px] font-semibold tabular-nums transition-colors duration-300 bg-gray-200/70 p-1.5 rounded-md ${
              isFirst ? "text-[#d84d37]" : "text-[#929292] group-hover:text-[#777]"
            }`}
          >
            {liveFight ? "⚡" : String(index + 1).padStart(2, "0")}
          </span>
          <span className="h-2.5 w-px bg-[rgba(55,50,47,.16)]" />
          {/* The software being complained about leads, because that is what a
              reader is scanning for. Category falls back for curated rows that
              predate the field. */}
          <span className="truncate font-mono text-[12px] font-semibold uppercase tracking-[0.05em] text-[#5f5a54]">
            {problem.target_product_name || problem.category}
          </span>
          {problem.origin === "curated" ? (
            <span className="shrink-0 font-mono text-[8px] uppercase tracking-[0.1em] text-[#7d7d7d]">Curated</span>
          ) : null}
          {liveFight ? (
            <span className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[8px] uppercase tracking-[0.12em] text-[#d84d37]">
              <Zap size={9} className="shrink-0" /> Live fight
            </span>
          ) : isFirst ? (
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
          <ProblemHighlight statement={problem.statement} sequence={index} />
        </p>

        {/* The band and the actions sit together at the foot of the card, so the
            band's lower rule doubles as the action row's divider instead of
            stacking two hairlines a few pixels apart. */}
        <div className="pointer-events-auto mt-auto pt-3">
          <SponsorRow
            problemId={problem.id}
            competitors={problem.competitors}
            nextBidCents={problem.next_bid_cents}
            events={events}
          />
        </div>

        {/* Actions */}
        <div className="pointer-events-auto flex items-center justify-between gap-2 pt-2.5">
          <SupportProblem problemId={problem.id} initialCount={problem.support_count} compact />
          <BidModal problemId={problem.id} statement={problem.statement} nextBidCents={problem.next_bid_cents} compact />
        </div>
      </div>
    </article>
  )
}
