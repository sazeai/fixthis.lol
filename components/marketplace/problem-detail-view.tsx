import type { ReactNode } from "react"
import { Footer } from "@/components/marketplace/footer"
import { FramedSection, MarketplaceFrame } from "@/components/marketplace/frame"
import { Header } from "@/components/marketplace/header"
import { ProblemComplaints } from "@/components/marketplace/problem-detail/problem-complaints"
import { ProblemCompetition } from "@/components/marketplace/problem-detail/problem-competition"
import { ProblemHeader } from "@/components/marketplace/problem-detail/problem-header"
import { ProblemMetrics } from "@/components/marketplace/problem-detail/problem-metrics"
import { ReleaseCheckout } from "@/components/marketplace/release-checkout"
import { ReportProblem } from "@/components/marketplace/report-problem"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemDetailView({ problem, duplicate, paymentCancelled, cancelledQuoteId = "" }: { problem: ProblemDetail; duplicate: boolean; paymentCancelled: boolean; cancelledQuoteId?: string }) {
  const originLabel = problem.origin === "curated" ? "Curated by FIXTHIS" : problem.origin === "founder" ? "Added by a product" : "Posted by someone with this problem"

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#fafafa] font-sans text-[#111]">
      <div className="flex min-h-screen flex-col items-center">
        <MarketplaceFrame>
          <Header />
          <main className="relative z-10 mt-28 flex w-full flex-col items-center">
            {duplicate ? <Banner>We found this existing problem instead of creating a duplicate. Add your support below.</Banner> : null}
            {paymentCancelled ? <Banner>Payment was cancelled. No bid or placement was published.</Banner> : null}
            {paymentCancelled && cancelledQuoteId ? <ReleaseCheckout quoteId={cancelledQuoteId} /> : null}

            <FramedSection contentClassName="py-0" extendRailTop>
              <ProblemHeader problem={problem} originLabel={originLabel} />
              <ProblemMetrics problem={problem} />
            </FramedSection>

            <FramedSection contentClassName="py-0">
              <ProblemCompetition problem={problem} />
            </FramedSection>

            <FramedSection contentClassName="py-0">
              <ProblemComplaints problem={problem} />
            </FramedSection>

            {/* Post-publication safety valve for authenticated submissions. */}
            <FramedSection contentClassName="py-3 sm:py-3">
              <ReportProblem problemId={problem.id} />
            </FramedSection>

            <FramedSection><Footer /></FramedSection>
          </main>
        </MarketplaceFrame>
      </div>
    </div>
  )
}

function Banner({ children }: { children: ReactNode }) {
  return (
    <FramedSection>
      <p className="border-y border-[rgba(55,50,47,0.12)] bg-[#fff3ee] px-5 py-3 text-[12px] text-[#8a3d2c] sm:px-8">{children}</p>
    </FramedSection>
  )
}
