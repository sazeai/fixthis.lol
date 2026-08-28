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
      <div className="flex items-center justify-between border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-3 py-2.5 sm:px-5">
        <div className="flex items-baseline gap-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Product responses</p>
          <span className="font-mono text-[9px] tabular-nums text-[#999]">{String(count).padStart(2, "0")}</span>
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
              <div className="flex items-start gap-3 border-b border-[rgba(55,50,47,0.12)] p-4 sm:p-5 md:row-span-2 md:border-b-0 md:border-r lg:row-span-1">
                <ProductIcon name={answer.name} seed={answer.registrable_domain} iconUrl={answer.icon_url} size={30} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[14px] font-semibold leading-5 text-[#111]">{answer.name}</h3>
                  <p className="truncate font-mono text-[8px] tracking-[0.04em] text-[#8a857e]">{answer.registrable_domain}</p>
                  {answer.verified ? (
                    <span
                      title="FIXTHIS confirmed this answer comes from the product it names. It says nothing about whether the claim is true."
                      className="mt-2 inline-flex items-center gap-1 bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#d84d37]"
                    >
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={9} /> Verified identity
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Block 2: How they address it */}
              <div className="p-4 sm:p-5 lg:border-r border-[rgba(55,50,47,0.12)]">
                <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a857e]">How they address it</p>
                <p className="mt-1.5 text-[13px] leading-[1.6] text-[#2f2c28]">{answer.solves_text}</p>
              </div>

              {/* Block 3: Offer + Action divided into two rows */}
              <div className="flex flex-col justify-between border-t border-[rgba(55,50,47,0.12)] bg-[#fcfbfa] md:col-start-2 lg:col-start-auto lg:border-t-0">
                {/* Row 1: Offer / Coupon incentive */}
                <div className="flex flex-1 items-center px-4 py-3.5 sm:px-5">
                  {answer.switch_incentive ? (
                    <div className="flex items-start gap-2 text-[11px] leading-[1.45] text-[#444]">
                      <HugeiconsIcon icon={GiftIcon} size={13} className="mt-0.5 shrink-0 text-[#d84d37]" />
                      <span className="font-medium text-[#111]">{answer.switch_incentive}</span>
                    </div>
                  ) : (
                    <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#bbb]">No switch offer</p>
                  )}
                </div>

                {/* Row 2: Premium Visit button row */}
                <a
                  href={withReferralTag(answer.destination_url)}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="group/btn flex h-11 w-full items-center justify-center gap-2 border-t border-[rgba(55,50,47,0.12)] bg-[#111] px-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition-all duration-200 hover:bg-[#ef4e37] active:bg-[#d84d37]"
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
          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#d84d37]">
            {count ? "Alternative Solution" : "First Response"}
          </p>
          <h4 className="mt-0.5 font-serif text-[17px] font-medium leading-snug tracking-[-0.02em] text-[#111]">
            {count ? "Does your product solve this too?" : "No product response yet."}
          </h4>
          <p className="mt-1 text-[12px] leading-relaxed text-[#77726a]">
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
