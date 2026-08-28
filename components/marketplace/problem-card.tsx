import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { ProblemHighlight } from "@/components/marketplace/problem-highlight"
import { ProductIcon } from "@/components/marketplace/product-icon"
import { SupportProblem } from "@/components/marketplace/support-problem"
import type { ProblemSummary } from "@/types/marketplace"

/**
 * One card on the board.
 *
 * Reduced to the four things a reader can act on: which software, what the
 * complaint is, how many people agree, and whether anyone has answered. The ad
 * band, the bid button, the rank badge and the injected "live fight" slot are
 * all gone — they described the auction to someone who had not asked about it.
 */
export function ProblemCard({ problem, index }: { problem: ProblemSummary; index: number }) {
  const isFirst = index === 0
  const answers = problem.answer_count
  const answerPreview = problem.answers.slice(0, 3)

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
            {String(index + 1).padStart(2, "0")}
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
          {isFirst ? (
            <span className="ml-auto shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[#d84d37]">Trending</span>
          ) : (
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={12}
              className="ml-auto shrink-0 -translate-x-0.5 translate-y-0.5 text-[#c4c0ba] opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            />
          )}
        </div>

        {/* The statement is the headline and owns the full width. */}
        <ProblemHighlight
          as="p"
          className="mt-2.5 line-clamp-3 text-[14px] font-medium leading-[1.45] tracking-[-0.011em] text-[#2f2c28]"
          statement={problem.statement}
          sequence={index}
        />

        {/* Actions */}
        <div className="pointer-events-auto mt-auto flex items-center justify-between gap-2 border-t border-[rgba(55,50,47,.09)] pt-3">
          <SupportProblem problemId={problem.id} initialCount={problem.support_count} compact />
          <Link
            href={`/problems/${problem.slug}`}
            aria-label={`Open problem and view ${answers} ${answers === 1 ? "answer" : "answers"}`}
            className="group/answers flex min-w-0 shrink items-center gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#ef4e37] focus-visible:ring-offset-2"
          >
            {answers ? (
              <>
                <span
                  className="flex shrink-0 -space-x-1.5"
                  title={answers === 1 ? `${answerPreview[0]?.name || "A product"} answered` : `${answers} products answered`}
                >
                  {answerPreview.map((answer) => (
                    <ProductIcon
                      key={answer.offer_id}
                      name={answer.name}
                      seed={answer.registrable_domain}
                      iconUrl={answer.icon_url}
                      size={18}
                      className={`ring-2 ${isFirst ? "ring-[#fff6f2]" : "ring-[#fafafa] group-hover:ring-white"}`}
                    />
                  ))}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#706a63]">
                  {answers} {answers === 1 ? "answer" : "answers"}
                </span>
              </>
            ) : (
              <>
                <span aria-hidden="true" className="size-[18px] rounded-[4px] border border-dashed border-[rgba(55,50,47,.2)]" />
                <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#aaa]">No answers</span>
              </>
            )}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={11}
              aria-hidden="true"
              className="shrink-0 text-[#b5b0a9] transition-all duration-200 group-hover/answers:translate-x-0.5 group-hover/answers:text-[#d84d37]"
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
