"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, SearchAreaIcon } from "@hugeicons/core-free-icons"
import { CategoryFilter } from "@/components/marketplace/category-filter"
import { DeckPagination } from "@/components/marketplace/deck-pagination"
import { ProblemCard } from "@/components/marketplace/problem-card"
import type { ProblemSection, ProblemSectionId, ProblemSummary } from "@/types/marketplace"

const PAGE_SIZE = 30

const SECTION_MARK: Record<ProblemSectionId, string> = {
  trending: "01",
  answered: "02",
  fresh: "03",
  unanswered: "04",
}

export function MarketplaceHome({ problems, sections }: { problems: ProblemSummary[]; sections: ProblemSection[] }) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [active, setActive] = useState<ProblemSectionId>(sections[0]?.id || "trending")
  const [page, setPage] = useState(1)
  const deckRef = useRef<HTMLDivElement>(null)

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(problems.map((problem) => problem.category))).sort()],
    [problems],
  )

  const query = search.trim().toLowerCase()
  const filtering = Boolean(query) || category !== "All"

  // While a filter is active the section shelves are replaced by one flat result
  // set, so a search never silently hides matches sitting in another section.
  const results = useMemo(() => {
    if (!filtering) return []
    return problems.filter((problem) => {
      const matchesCategory = category === "All" || problem.category === category
      const matchesSearch = !query || `${problem.statement} ${problem.target_product_name || ""} ${problem.category}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, filtering, problems, query])

  const activeSection = sections.find((section) => section.id === active) || sections[0]
  const pool = filtering ? results : activeSection?.problems || []

  const pageCount = Math.max(1, Math.ceil(pool.length / PAGE_SIZE))
  // Clamp rather than trusting state: switching to a shorter section or
  // narrowing a filter can strand the page number past the end.
  const currentPage = Math.min(page, pageCount)
  const offset = (currentPage - 1) * PAGE_SIZE
  const entries = pool.slice(offset, offset + PAGE_SIZE)

  // A new section or a changed filter is a new list — start at its first page.
  useEffect(() => { setPage(1) }, [active, query, category])

  function goToPage(next: number) {
    const target = Math.min(Math.max(next, 1), pageCount)
    if (target === currentPage) return
    setPage(target)
    // Bring the top of the deck into view without touching the rest of the
    // page; this is a re-render, not a navigation.
    deckRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <section id="problems" className="w-full">


      {/* Full-bleed filter bar: the rules run edge to edge instead of stopping
          short inside the header padding. */}
      <div className="grid border-b border-t border-[rgba(55,50,47,0.12)] bg-white sm:grid-cols-[1fr_auto]">
        <div className="group relative flex items-center">
          <HugeiconsIcon icon={SearchAreaIcon} size={13} className="pointer-events-none absolute left-5 text-[#c4c0ba] transition-colors duration-200 group-focus-within:text-[#ef4e37] sm:left-7" />
          <label className="sr-only" htmlFor="problem-search">Search problems</label>
          <input
            id="problem-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="h-12 w-full bg-transparent pl-12 pr-5 text-[13px] text-[#2f2c28] outline-none transition-colors placeholder:text-[#b5b0a9] focus:bg-[#fdfcfb] sm:pl-14 sm:pr-7"
            placeholder="Search the board…"
          />
          {search ? (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-4 grid size-6 place-items-center rounded-full text-[#b5b0a9] transition-colors hover:bg-[rgba(55,50,47,.06)] hover:text-[#111] sm:right-6"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={13} />
            </button>
          ) : null}
        </div>
        <div className="relative border-t border-[rgba(55,50,47,0.12)] sm:border-l sm:border-t-0">
          <label className="sr-only" htmlFor="problem-category">Filter by category</label>
          <CategoryFilter
            categories={categories}
            value={category}
            onChange={setCategory}
          />
        </div>
      </div>

      {filtering ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-5 py-3 sm:px-7">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#777]">
            {results.length} {results.length === 1 ? "match" : "matches"}
            {category !== "All" ? <span className="text-[#aaa]"> · {category}</span> : null}
          </p>
          <button type="button" onClick={() => { setSearch(""); setCategory("All") }} className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#999] underline underline-offset-2 transition-colors hover:text-[#111]">
            Clear filters
          </button>
        </div>
      ) : (
        <nav aria-label="Problem sections" className="flex overflow-x-auto border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((section) => {
            const selected = section.id === activeSection?.id
            return (
              <button
                key={section.id}
                type="button"
                aria-current={selected ? "true" : undefined}
                onClick={() => setActive(section.id)}
                className={`group relative flex shrink-0 items-center gap-2 border-r border-[rgba(55,50,47,0.12)] px-5 py-3 text-left transition-colors duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef4e37] sm:px-6 ${selected ? "bg-[#fafafa]" : "hover:bg-[#fafafa]"}`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-0 top-0 h-[2px] origin-left bg-[#ef4e37] transition-transform duration-300 ease-out ${selected ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
                <span className={`font-mono text-[8px] tabular-nums tracking-[0.14em] transition-colors duration-300 ${selected ? "text-[#de422a]" : "text-[#c4c0ba]"}`}>{SECTION_MARK[section.id]}</span>
                <span className={`whitespace-nowrap text-[12px] font-medium transition-colors duration-300 ${selected ? "text-[#111]" : "text-[#77726a] group-hover:text-[#111]"}`}>{section.title}</span>
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] tabular-nums transition-colors duration-300 ${selected ? "bg-[#fff0eb] text-[#de422a]" : "bg-[rgba(55,50,47,.06)] text-[#a8a39c]"}`}>{section.problems.length}</span>
              </button>
            )
          })}
        </nav>
      )}

      {!filtering && activeSection ? (
        <p className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-5 py-3 text-[11px] text-[#8a857e] sm:px-7">{activeSection.blurb}</p>
      ) : null}

      {entries.length ? (
        <div ref={deckRef} className="grid scroll-mt-24 bg-[rgba(55,50,47,0.12)] md:grid-cols-2 md:gap-px">
          {entries.map((problem, index) => (
            <div key={problem.id} className={`${index ? "border-t border-[rgba(55,50,47,.12)]" : ""} md:border-t-0`}>
              <ProblemCard problem={problem} index={offset + index} />
            </div>
          ))}
        </div>
      ) : (
        <div className="border-y border-dashed border-[rgba(55,50,47,.16)] bg-[#fafafa] px-6 py-20 text-center">
          <p className="font-serif text-3xl text-[#111]">Nothing matches yet.</p>
          <p className="mt-2 text-sm text-[#777]">Try another filter, or put this problem on the board.</p>
        </div>
      )}

      <DeckPagination
        page={currentPage}
        pageCount={pageCount}
        total={pool.length}
        pageSize={PAGE_SIZE}
        onChange={goToPage}
      />
    </section>
  )
}
