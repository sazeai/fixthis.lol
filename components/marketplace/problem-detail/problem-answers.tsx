import { ArrowUpRight, BadgeCheck, Gift } from "lucide-react"
import { OfferModal } from "@/components/marketplace/offer-modal"
import { DetailBlockHeader } from "@/components/marketplace/problem-detail/detail-block-header"
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
    <section className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      <DetailBlockHeader
        label={count ? `${count} ${count === 1 ? "product says" : "products say"} they can fix this` : "No answers yet"}
        aside={problem.target_product_name ? `Alternatives to ${problem.target_product_name}` : "Alternatives"}
      />

      <div className="px-3 py-3.5 sm:px-5 sm:py-5">
        {count ? (
          <div className="grid gap-px border border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)]">
            {problem.answers.map((answer) => (
              <article key={answer.offer_id} className="bg-white px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex flex-wrap items-center gap-2">
                  <ProductIcon name={answer.name} seed={answer.registrable_domain} iconUrl={answer.icon_url} size={20} />
                  <h3 className="font-serif text-[19px] tracking-[-0.02em] text-[#111]">{answer.name}</h3>
                  {answer.verified ? (
                    <span
                      title="FIXTHIS confirmed this answer comes from the product it names. It says nothing about whether the claim is true."
                      className="inline-flex items-center gap-1 bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#d84d37]"
                    >
                      <BadgeCheck size={9} /> Verified
                    </span>
                  ) : null}
                </div>

                <p className="mt-2.5 max-w-2xl text-[14px] leading-[1.5] text-[#333]">{answer.solves_text}</p>

                {answer.switch_incentive ? (
                  <p className="mt-2.5 inline-flex items-start gap-1.5 bg-[#f4f2f0] px-2.5 py-1.5 text-[12px] leading-5 text-[#555]">
                    <Gift size={12} className="mt-0.5 shrink-0 text-[#d84d37]" />
                    <span>{answer.switch_incentive}</span>
                  </p>
                ) : null}

                <div className="mt-3.5">
                  <a
                    href={withReferralTag(answer.destination_url)}
                    target="_blank"
                    // The link is here because the product asked to be here, so
                    // it carries no ranking credit and says so.
                    rel="sponsored nofollow noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 bg-[#111] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-[#ef4e37]"
                  >
                    Visit {answer.name} <ArrowUpRight size={12} />
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-5 py-8 text-center">
            <p className="font-serif text-[19px] tracking-[-0.02em] text-[#111]">No product has answered this yet.</p>
            <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-5 text-[#888]">
              {problem.target_product_name
                ? `If you build something that solves this better than ${problem.target_product_name}, say so.`
                : "If you build something that solves this, say so."}
            </p>
            <div className="mt-4 flex justify-center">
              <OfferModal
                problemId={problem.id}
                statement={problem.statement}
                targetProductName={problem.target_product_name}
                switchCondition={problem.switch_condition}
              />
            </div>
          </div>
        )}

        {/* Kept out of the empty state's box when answers exist, so it reads as
            an invitation rather than a fourth entry in the list. */}
        {count ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(55,50,47,0.12)] pt-4">
            <p className="text-[13px] text-[#666]">Does your product solve this too?</p>
            <OfferModal
              problemId={problem.id}
              statement={problem.statement}
              targetProductName={problem.target_product_name}
              switchCondition={problem.switch_condition}
              variant="outline"
            />
          </div>
        ) : null}

        <p className="mt-3 text-[10px] leading-4 text-[#999]">
          Products write their own answers. FIXTHIS does not verify claims, rank by payment, or recommend any of them. Answering is free.
        </p>
      </div>
    </section>
  )
}
