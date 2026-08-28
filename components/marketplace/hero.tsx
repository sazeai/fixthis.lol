import { PostProblemModal } from "@/components/marketplace/post-problem-modal"
import type { PublicTrafficStats } from "@/types/marketplace"

export function Hero({ traffic }: { traffic: PublicTrafficStats }) {
  return (
    // The CTA straddles the hero's bottom rule, hanging half its own height
    // past it. That overhang is cleared by the following section's top padding
    // rather than a margin here — a margin would break the frame's vertical
    // rules for the height of the gap, since the hero sits outside the framed
    // column and the section below sits inside it.
    <section className="relative flex w-full flex-col items-center border-b border-[rgba(55,50,47,0.12)] pb-9 text-center">
      <div className="z-10 flex w-full max-w-3xl flex-col items-center px-5 sm:px-6">
        {/* One real number, or nothing. The live-visitor ticker was atmosphere
            and it cost a database write per tab per twenty seconds. */}
        {traffic.visitors_24h > 0 ? (
          <p className="mb-5 inline-flex items-center gap-2" aria-label={`${traffic.visitors_24h.toLocaleString("en-US")} visitors in the last 24 hours`}>
            <span aria-hidden="true" className="h-px w-1.5 bg-[#ef654f]/40" />
            <strong className="font-sans text-[24px] font-bold leading-none tracking-[-0.04em] text-[#e94f3d]">
              {traffic.visitors_24h.toLocaleString("en-US")}
            </strong>
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-[#5f5a54]">
              Visitors / 24h
            </span>
          </p>
        ) : null}

        <h1 className="font-serif text-[36px] leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-[46px] lg:text-[60px] lg:leading-[1.02]">
          What software is pissing you off?
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] font-normal leading-[1.6] tracking-tight text-[#555] sm:text-[15px] lg:text-[1rem]">
          Say what sucks about the software you pay for, and what would make you leave it. See who else is stuck with the same thing. Then let the alternatives answer.
        </p>
      </div>

      <div className="absolute bottom-0 z-20 flex w-full translate-y-1/2 justify-center">
        <PostProblemModal trigger="CALL IT OUT" />
      </div>
    </section>
  )
}
