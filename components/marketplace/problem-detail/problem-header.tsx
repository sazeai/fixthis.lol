import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ProblemHighlight } from "@/components/marketplace/problem-highlight"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemHeader({ problem, originLabel }: { problem: ProblemDetail; originLabel: string }) {
  return (
    <>
      <div className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-5 py-3 sm:px-7">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 sm:gap-x-4">
          <Link href="/#problems" className="group inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.14em] text-[#8a857e] transition-colors hover:text-[#111]">
            <ArrowLeft size={11} className="transition-transform duration-200 ease-out group-hover:-translate-x-0.5" /> All problems
          </Link>
          <div className="flex items-center justify-self-end gap-2 whitespace-nowrap">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">{problem.category}</span>
            <span className="hidden text-[#ccc] sm:inline">·</span>
            <span className="hidden font-mono text-[9px] uppercase tracking-[0.14em] text-[#999] sm:inline">{originLabel}</span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
        {/* The software leads. It is what the reader arrived looking for, and
            what a competing product scans for. */}
        {problem.target_product_name ? (
          <p className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#d84d37]">{problem.target_product_name}</p>
        ) : null}

        <ProblemHighlight
          as="h1"
          className="max-w-4xl font-serif text-[28px] leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-[38px] lg:text-[42px]"
          statement={problem.statement}
          ink="#111"
        />

        {/*
          The single most useful line on the page, and until now it was stored
          and never shown. It is what the reader is actually shopping for, and
          it is the brief a competing product answers.
        */}
        {problem.switch_condition ? (
          <div className="mt-5 max-w-2xl border-l-2 border-[#ef654f] bg-[#fff6f2] px-4 py-3">
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">What would make them switch</p>
            <p className="mt-1.5 text-[15px] leading-[1.45] text-[#333]">{problem.switch_condition}</p>
          </div>
        ) : null}

        <div className="mt-5 sm:mt-6">
          <SupportProblem problemId={problem.id} initialCount={problem.support_count} />
        </div>
      </div>
    </>
  )
}
