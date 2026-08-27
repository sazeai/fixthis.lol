"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

/**
 * Pagination for the problem deck.
 *
 * Purely client-side over data the page already shipped, so turning a page
 * re-renders the deck and nothing else — no navigation, no server round trip,
 * no re-fetch of the hero, header or footer.
 */
export function DeckPagination({
  page,
  pageCount,
  total,
  pageSize,
  onChange,
}: {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onChange: (page: number) => void
}) {
  if (pageCount <= 1) return null

  const first = (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  // Window the numbers so a long list never sprawls: first, last, and the
  // neighbours of the current page, with gaps collapsed.
  const numbers: (number | "gap")[] = []
  for (let index = 1; index <= pageCount; index += 1) {
    const near = Math.abs(index - page) <= 1
    if (index === 1 || index === pageCount || near) numbers.push(index)
    else if (numbers[numbers.length - 1] !== "gap") numbers.push("gap")
  }

  const arrow = "grid h-8 w-8 place-items-center border border-[rgba(55,50,47,0.12)] bg-white text-[#77726a] transition-colors hover:border-[#777] hover:text-[#111] disabled:cursor-default disabled:opacity-35 disabled:hover:border-[rgba(55,50,47,0.12)] disabled:hover:text-[#77726a]"

  return (
    <nav
      aria-label="Problem deck pages"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-5 py-3 sm:px-7"
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a857e]">
        <span className="tabular-nums text-[#111]">{first}–{last}</span> of <span className="tabular-nums">{total}</span>
      </p>

      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page" className={arrow}>
          <ChevronLeft size={14} />
        </button>

        {numbers.map((entry, index) =>
          entry === "gap" ? (
            <span key={`gap-${index}`} aria-hidden="true" className="px-0.5 font-mono text-[10px] text-[#c4c0ba]">…</span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? "page" : undefined}
              className={`grid h-8 min-w-8 place-items-center px-2 font-mono text-[10px] tabular-nums transition-colors ${
                entry === page
                  ? "bg-[#111] text-white"
                  : "border border-[rgba(55,50,47,0.12)] bg-white text-[#77726a] hover:border-[#777] hover:text-[#111]"
              }`}
            >
              {entry}
            </button>
          ),
        )}

        <button type="button" onClick={() => onChange(page + 1)} disabled={page >= pageCount} aria-label="Next page" className={arrow}>
          <ChevronRight size={14} />
        </button>
      </div>
    </nav>
  )
}
