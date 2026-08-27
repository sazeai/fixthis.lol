import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BidModal } from "@/components/marketplace/bid-modal"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemHeader({ problem, originLabel }: { problem: ProblemDetail; originLabel: string }) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link href="/#problems" className="group inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8a857e] transition-colors hover:text-[#111]">
          <ArrowLeft size={11} className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5" /> All problems
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">{problem.category}</span>
          <span className="text-[#ccc]">·</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#999]">{originLabel}</span>
        </div>
      </div>

      <h1 className="mt-5 max-w-4xl font-serif text-[28px] leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-[38px] lg:text-[42px]">
        “{problem.statement}”
      </h1>

      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <SupportProblem problemId={problem.id} initialCount={problem.support_count} />
        <BidModal problemId={problem.id} statement={problem.statement} nextBidCents={problem.next_bid_cents} />
      </div>
    </>
  )
}
