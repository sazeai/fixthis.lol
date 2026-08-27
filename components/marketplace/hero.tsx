import { PostProblemModal } from "@/components/marketplace/post-problem-modal"
import { PresenceTracker } from "@/components/marketplace/presence-tracker"
import type { PublicTrafficStats } from "@/types/marketplace"

export function Hero({ traffic }: { traffic: PublicTrafficStats }) {
  return (
    // mb-7 reserves the CTA's overhang. The button straddles the hero's bottom
    // rule, hanging half its own height below the section, and nothing else
    // should have to know that: left unreserved it lands on whatever renders
    // next and swallows its clicks, which is what happened to the live-fight
    // strip.
    <section className="relative mb-10 flex w-full flex-col items-center border-b border-[rgba(55,50,47,0.12)] pb-9 text-center">
      <div className="z-10 flex w-full max-w-3xl flex-col items-center px-5 sm:px-6">
        {/* Live traffic replaces the static badge — the marketplace states its
            own pulse instead of asserting that it has one. */}
        <PresenceTracker initial={traffic} />

        <h1 className="font-serif text-[30px] leading-[1.06] tracking-[-0.04em] text-[#111] sm:text-[46px] lg:text-[60px] lg:leading-[1.02]">
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
