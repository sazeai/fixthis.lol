import { PostProblemModal } from "@/components/marketplace/post-problem-modal"
import { PresenceTracker } from "@/components/marketplace/presence-tracker"
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
        {/* Live traffic replaces the static badge — the marketplace states its
            own pulse instead of asserting that it has one. */}
        <PresenceTracker initial={traffic} />

        <h1 className="font-serif text-[36px] leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-[46px] lg:text-[60px] lg:leading-[1.02]">
          What software is pissing you off?
        </h1>
        <p className="mt-4 max-w-2xl text-[14px] font-normal leading-[1.6] tracking-tight text-[#555] sm:text-[15px] lg:text-[1rem]">
          Call out what sucks about the software you use. See who else is dealing with it. Let alternatives fight to win you over.
        </p>
      </div>

      <div className="absolute bottom-0 z-20 flex w-full translate-y-1/2 justify-center">
        <PostProblemModal trigger="CALL IT OUT" />
      </div>
    </section>
  )
}
