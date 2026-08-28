import Link from "next/link"
import { Zap } from "lucide-react"
import { formatMoney } from "@/lib/marketplace/helpers"
import type { ProblemSummary } from "@/types/marketplace"

/**
 * A thin strip naming the problems companies are actively fighting over.
 *
 * Deliberately not a leaderboard: one line each, no ranking theatre. It exists
 * so a visitor can see where the money is without the board itself being
 * reordered by it.
 */
export function LiveFightsStrip({ fights }: { fights: ProblemSummary[] }) {
  if (!fights.length) return null

  return (
    <section aria-label="Live fights" className="border-t border-[rgba(55,50,47,0.12)] bg-[#f4f2f0]">
      <div className="flex items-stretch justify-center overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <p className="flex shrink-0 items-center gap-1.5 border-l border-r border-[rgba(55,50,47,0.12)] px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37] sm:px-7">
          <Zap size={11} className="shrink-0" />
          Live fights
        </p>

        {fights.map((fight) => (
          <Link
            key={fight.id}
            href={`/problems/${fight.slug}`}
            className="group flex shrink-0 items-center gap-2 border-r border-[rgba(55,50,47,0.12)] px-4 py-2.5 transition-colors hover:bg-[#fafafa] sm:px-5"
          >
            <span className="truncate text-[12px] font-medium text-[#2f2c28] transition-colors group-hover:text-[#111]">
              {fight.target_product_name || fight.category}
            </span>
            <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.1em] text-[#8a857e]">
              {fight.competitor_count} {fight.competitor_count === 1 ? "alternative" : "alternatives"}
            </span>
            <span className="whitespace-nowrap font-mono text-[9px] tabular-nums text-[#111]">
              {formatMoney(fight.top_bid_cents)} leader
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
