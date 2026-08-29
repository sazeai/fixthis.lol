import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { ProblemHighlight } from "@/components/marketplace/problem-highlight"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemHeader({ problem, originLabel }: { problem: ProblemDetail; originLabel: string }) {
  return (
    <>
      <div className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-5 py-3 sm:px-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 sm:gap-x-4">
          <Link href="/#problems" className="group inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap font-sans text-[12.5px] font-medium text-[#666] transition-colors hover:text-[#111]">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={13} className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5" /> All problems
          </Link>
          <div className="flex items-center justify-self-end gap-2 whitespace-nowrap">
            <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.04em] text-[#de422a]">{problem.category}</span>
            <span className="hidden text-[#ccc] sm:inline">·</span>
            <span className="hidden font-sans text-[11px] font-normal text-[#777] sm:inline">{originLabel}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-3.5 pt-4 sm:px-7 sm:pb-4 sm:pt-5">
        {/* The software leads. It is what the reader arrived looking for, and
            what a competing product scans for. */}
        {problem.target_product_name ? (
          <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-[#de422a]">{problem.target_product_name}</p>
        ) : null}

        <ProblemHighlight
          as="h1"
          className="max-w-[820px] font-serif text-[28px] leading-[1.08] tracking-[-0.035em] text-[#111] sm:text-[35px] lg:text-[38px]"
          statement={problem.statement}
          ink="#111"
        />

        {/* The switch condition is what a buyer specifies would win them over, rendered as a natural inline sentence. */}
        {problem.switch_condition ? (
          <p className="mt-2.5 max-w-2xl font-sans text-[13.5px] leading-relaxed text-[#2a2724]">
            <span className="mr-2 inline-block rounded bg-[#fff0eb] px-2 py-0.5 font-sans text-[10px] font-semibold uppercase tracking-[0.04em] text-[#de422a] align-middle -translate-y-px">
              Would switch for :
            </span>
            {problem.switch_condition}
          </p>
        ) : null}
      </div>

      {/* Bottom Full-Bleed Action Grid Bar */}
      <div className="border-t border-[rgba(55,50,47,0.12)]">
        <SupportProblem problemId={problem.id} initialCount={problem.support_count} />
      </div>
    </>
  )
}