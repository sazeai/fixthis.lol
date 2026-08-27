import { FeaturedSolution } from "@/components/marketplace/featured-solution"
import { ProductIcon } from "@/components/marketplace/product-icon"
import { DetailBlockHeader } from "@/components/marketplace/problem-detail/detail-block-header"
import { formatMoney } from "@/lib/marketplace/helpers"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemCompetition({ problem }: { problem: ProblemDetail }) {
  return (
    <section className="border-y border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      <DetailBlockHeader label="Marketplace activity" aside="Demand meets supply" />
      <div className="grid gap-px bg-[rgba(55,50,47,0.12)] lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
        <section className="bg-[#fafafa] px-3 py-3.5 sm:px-5 sm:py-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Currently claiming this problem</p>
          <h2 className="mt-1.5 font-serif text-[21px] tracking-[-0.02em] text-[#111]">Featured solution</h2>
          <div className="mt-3 border border-[rgba(55,50,47,0.12)]">
            <FeaturedSolution problemId={problem.id} nextBidCents={problem.next_bid_cents} />
          </div>
          <p className="mt-2.5 text-[10px] leading-4 text-[#999]">
            Paid rotating placement, not an endorsement. Different visitors may see different products.
          </p>
        </section>

        <section className="bg-[#fafafa] px-3 py-3.5 sm:px-5 sm:py-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">The battlefield</p>
              <h2 className="mt-1.5 font-serif text-[21px] tracking-[-0.02em] text-[#111]">Products competing</h2>
            </div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#999]">Next bid {formatMoney(problem.next_bid_cents)}+</p>
          </div>

          {problem.battlefield.length ? (
            <div className="mt-3 border border-[rgba(55,50,47,0.12)] bg-white">
              {problem.battlefield.map((entry) => (
                <div key={entry.placement_id} className="group grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-[rgba(55,50,47,0.1)] px-3 py-2.5 transition-colors duration-200 last:border-0 hover:bg-[#fdfcfb]">
                  <span className={`grid size-6 place-items-center rounded-full font-mono text-[8px] font-semibold ${entry.rank === 1 ? "bg-[#ef654f] text-white" : "border border-[rgba(55,50,47,.13)] bg-[#fafafa] text-[#777]"}`}>
                    {entry.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 truncate text-[12px] font-semibold text-[#111]">
                      <ProductIcon
                        name={entry.product_name}
                        seed={entry.registrable_domain}
                        iconUrl={problem.competitors.find((item) => item.placement_id === entry.placement_id)?.icon_url ?? null}
                        size={17}
                      />
                      {entry.product_name}
                      {entry.founding_claim ? <span className="shrink-0 bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#d84d37]">Founding</span> : null}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[8px] uppercase tracking-[0.1em] text-[#aaa]">
                      {entry.impression_count.toLocaleString("en-US")} views · {entry.click_count.toLocaleString("en-US")} clicks · {entry.ctr}% CTR
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-[14px] leading-none text-[#111]">{entry.founding_claim ? "$0" : formatMoney(entry.current_bid_cents)}</p>
                    <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.1em] text-[#aaa]">
                      {entry.eligible ? `~${entry.visibility_percentage}% visibility` : "outside top 5"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-5 py-8 text-center">
              <p className="font-serif text-[19px] tracking-[-0.02em] text-[#111]">No solution has claimed this yet.</p>
              <p className="mt-1.5 text-[11px] text-[#888]">The first claim starts at {formatMoney(problem.next_bid_cents)}.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  )
}
