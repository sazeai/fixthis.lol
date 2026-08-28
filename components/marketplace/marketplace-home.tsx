"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronDown, Search, X } from "lucide-react"
import { DeckPagination } from "@/components/marketplace/deck-pagination"
import { useMarketEvents } from "@/components/marketplace/market-event-feed"
import { boardPageCount, buildBoardPage, ORGANIC_PER_PAGE } from "@/lib/marketplace/live-fights"
import { ProblemCard } from "@/components/marketplace/problem-card"
import type { ProblemSection, ProblemSectionId, ProblemSummary } from "@/types/marketplace"

const SECTION_MARK: Record<ProblemSectionId, string> = {
  trending: "01",
  contested: "02",
  fresh: "03",
  unclaimed: "04",
}

export function MarketplaceHome({ problems, sections }: { problems: ProblemSummary[]; sections: ProblemSection[] }) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [active, setActive] = useState<ProblemSectionId>(sections[0]?.id || "trending")
  const [page, setPage] = useState(1)
  // One poll for the whole board rather than one per card.
  const eventsByProblem = useMarketEvents(true)
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
      const matchesSearch = !query || `${problem.statement} ${problem.category}`.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [category, filtering, problems, query])

  const activeSection = sections.find((section) => section.id === active) || sections[0]
  const pool = filtering ? results : activeSection?.problems || []

  // Pages are counted on organic supply; injected fights are additional
  // circulation and must never change how many pages of problems exist.
  const pageCount = boardPageCount(pool.length)
  // Clamp rather than trusting state: switching to a shorter section or
  // narrowing a filter can strand the page number past the end.
  const currentPage = Math.min(page, pageCount)
  // A filtered view is a search result, not the board — never inject into it.
  // Sliced by the organic size, which is what pageCount above is counted on:
  // slicing by the larger PAGE_SIZE meant a filtered list could report more
  // pages than it could fill, and the last one came up "Nothing matches yet"
  // while matches were sitting on the page before it.
  const entries = filtering
    ? pool.slice((currentPage - 1) * ORGANIC_PER_PAGE, currentPage * ORGANIC_PER_PAGE).map((problem) => ({ problem, injected: false }))
    : buildBoardPage(pool, currentPage, problems)

  // Card numbers follow organic rank, not position on screen. An injected fight
  // shows a bolt rather than a number, so it must not consume one — otherwise
  // every injection pushed the count one further ahead of the real rank, and
  // page 2 restarted below the highest number page 1 had already shown.
  let rank = (currentPage - 1) * ORGANIC_PER_PAGE
  const numbered = entries.map((entry) => ({ ...entry, rank: entry.injected ? rank : rank++ }))

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
      <div className="grid border-b border-[rgba(55,50,47,0.12)] bg-white sm:grid-cols-[1fr_auto]">
        <div className="group relative flex items-center">
          <Search size={13} className="pointer-events-none absolute left-5 text-[#c4c0ba] transition-colors duration-200 group-focus-within:text-[#ef4e37] sm:left-7" />
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
              <X size={13} />
            </button>
          ) : null}
        </div>
        <div className="relative border-t border-[rgba(55,50,47,0.12)] sm:border-l sm:border-t-0">
          <label className="sr-only" htmlFor="problem-category">Filter by category</label>
          <select
            id="problem-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-12 w-full cursor-pointer appearance-none bg-transparent pl-5 pr-11 font-mono text-[10px] uppercase tracking-[0.1em] text-[#77726a] outline-none transition-colors hover:text-[#111] focus:bg-[#fdfcfb] sm:min-w-[220px] sm:pl-7 sm:pr-12"
          >
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <ChevronDown size={13} className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-[#c4c0ba] sm:right-6" />
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
                <span className={`font-mono text-[8px] tabular-nums tracking-[0.14em] transition-colors duration-300 ${selected ? "text-[#d84d37]" : "text-[#c4c0ba]"}`}>{SECTION_MARK[section.id]}</span>
                <span className={`whitespace-nowrap text-[12px] font-medium transition-colors duration-300 ${selected ? "text-[#111]" : "text-[#77726a] group-hover:text-[#111]"}`}>{section.title}</span>
                <span className={`rounded-full px-1.5 py-0.5 font-mono text-[8px] tabular-nums transition-colors duration-300 ${selected ? "bg-[#fff0eb] text-[#d84d37]" : "bg-[rgba(55,50,47,.06)] text-[#a8a39c]"}`}>{section.problems.length}</span>
              </button>
            )
          })}
        </nav>
      )}

      {!filtering && activeSection ? (
        <p className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-5 py-3 text-[11px] text-[#8a857e] sm:px-7">{activeSection.blurb}</p>
      ) : null}

      {numbered.length ? (
        <div ref={deckRef} className="grid scroll-mt-24 bg-[rgba(55,50,47,0.12)] md:grid-cols-2 md:gap-px">
          {numbered.map((entry, index) => (
            <div key={`${entry.problem.id}-${entry.injected ? "fight" : "organic"}`} className={`${index ? "border-t border-[rgba(55,50,47,.12)]" : ""} md:border-t-0`}>
              <ProblemCard
                problem={entry.problem}
                index={entry.rank}
                liveFight={entry.injected}
                events={eventsByProblem[entry.problem.id]}
              />
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
        pageSize={ORGANIC_PER_PAGE}
        onChange={goToPage}
      />
    </section>
  )
}

function Stat({ value, label, middle = false, last = false }: { value: string; label: string; middle?: boolean; last?: boolean }) {
  return <p className={middle ? "px-3" : last ? "pl-3" : "pr-3"}><span className="block font-serif text-[18px] leading-none text-[#111]">{value}</span><span className="mt-1 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#999]">{label}</span></p>
}
