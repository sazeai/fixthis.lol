import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, CheckmarkBadge01Icon, GiftIcon } from "@hugeicons/core-free-icons"
import { OfferModal } from "@/components/marketplace/offer-modal"
import { ProductIcon } from "@/components/marketplace/product-icon"
import { withReferralTag } from "@/lib/marketplace/helpers"
import type { ProblemDetail } from "@/types/marketplace"

/**
 * The answers to a problem.
 *
 * This block replaces what used to be "the battlefield" — a ranked table of
 * rank, bid, impressions, clicks, CTR and visibility share. None of that was
 * information a person choosing software could use; all of it was the
 * advertiser's dashboard rendered to the buyer.
 *
 * What is left is the thing a buyer actually came for: which products say they
 * fix this, how, and what they will do for someone switching.
 */
export function ProblemAnswers({ problem }: { problem: ProblemDetail }) {
  const count = problem.answer_count

  return (
    <section className="border-b border-t border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-4 py-2.5 sm:px-6">
        <div className="flex items-baseline gap-2.5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.05em] text-[#de422a]">Products say they can fix this</p>
          <span className="font-sans text-[11px] font-bold tabular-nums text-[#777]">{String(count).padStart(2, "0")}</span>
        </div>
      </div>

      {/* Product Responses Grid */}
      {count ? (
        <div className="divide-y divide-[rgba(55,50,47,0.12)]">
          {problem.answers.map((answer) => (
            <article
              key={answer.offer_id}
              className="grid bg-white md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[210px_minmax(0,1fr)_200px]"
            >
              {/* Block 1: Product identity */}
              <div className="flex items-start gap-2 border-b border-[rgba(55,50,47,0.12)] p-4 sm:p-5 md:row-span-2 md:border-b-0 md:border-r lg:row-span-1">
                <ProductIcon name={answer.name} seed={answer.registrable_domain} iconUrl={answer.icon_url} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="truncate text-[14px] font-semibold leading-5 text-[#111]">{answer.name}</h3>
                    {answer.verified ? (
                      <span
                        title="Verified identity · FIXTHIS confirmed this answer comes from the product it names."
                        className="shrink-0 text-[#de422a] inline-flex items-center"
                      >
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} size={15} />
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate font-sans text-[11px] text-[#666]">{answer.registrable_domain}</p>
                </div>
              </div>

              {/* Block 2: How they address it */}
              <div className="p-4 sm:p-5 lg:border-r border-[rgba(55,50,47,0.12)]">
                <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-[#777]">How they address it</p>
                <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-[#2a2724]">{answer.solves_text}</p>
              </div>

              {/* Block 3: Offer + Action divided into two rows */}
              <div className="flex flex-col justify-between border-t border-[rgba(55,50,47,0.12)] bg-[#fcfbfa] md:col-start-2 lg:col-start-auto lg:border-t-0">
                {/* Row 1: Offer / Coupon incentive */}
                <div className="flex flex-1 items-center px-2 py-3.5 sm:px-3">
                  {answer.switch_incentive ? (
                    <div className="flex items-start gap-2 text-[12px] leading-snug text-[#333]">
                      <HugeiconsIcon icon={GiftIcon} size={14} className="mt-0.5 shrink-0 text-[#de422a]" />
                      <span className="font-medium text-[#111]">{answer.switch_incentive}</span>
                    </div>
                  ) : (
                    <p className="font-sans text-[11px] text-[#999]">No switch offer</p>
                  )}
                </div>

                {/* Row 2: Premium Visit button row */}
                <a
                  href={withReferralTag(answer.destination_url)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="group/btn flex h-11 w-full items-center justify-center gap-2 border-t border-[rgba(55,50,47,0.12)] bg-[#111] px-4 font-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:bg-[#ef4e37] active:bg-[#de422a]"
                >
                  <span>Visit Website</span>
                  <span className="flex size-4 items-center justify-center rounded-[3px] bg-white/10 text-white/90 transition-colors duration-200 group-hover/btn:bg-white/20 group-hover/btn:text-white">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={11} strokeWidth={2.4} className="transition-transform duration-200 ease-out group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                  </span>
                </a>
              </div>
            </article>
          ))}
        </div>
      ) : null}

      {/* Dedicated Offer / Answer Row */}
      <div className="grid border-t border-[rgba(55,50,47,0.12)] bg-[#fcfbfa] lg:grid-cols-[minmax(0,1fr)_200px]">
        {/* Left side: Prompt */}
        <div className="flex flex-col justify-center p-4 sm:p-5">
          <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.06em] text-[#de422a]">
            {count ? "Alternative Solution" : "First Response"}
          </p>
          <h4 className="mt-0.5 font-serif text-[17px] font-medium leading-snug tracking-[-0.02em] text-[#111]">
            {count ? "Does your product solve this too?" : "No product response yet."}
          </h4>
          <p className="mt-1 font-sans text-[12.5px] leading-relaxed text-[#666]">
            {problem.target_product_name
              ? `If you build something that solves this better than ${problem.target_product_name}, say so.`
              : "Say how you fix this complaint and put your product in front of switching buyers."}
          </p>
        </div>

        {/* Right side: Action Button */}
        <div className="flex items-center justify-start border-t border-[rgba(55,50,47,0.08)] p-4 sm:justify-end sm:p-5 lg:border-l lg:border-t-0 lg:border-[rgba(55,50,47,0.12)] lg:justify-center">
          <OfferModal
            problemId={problem.id}
            statement={problem.statement}
            targetProductName={problem.target_product_name}
            switchCondition={problem.switch_condition}
            triggerLabel="MAKE AN OFFER"
          />
        </div>
      </div>


    </section>
  )
}
