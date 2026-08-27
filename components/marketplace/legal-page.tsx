import type { ReactNode } from "react"

import { Header } from "@/components/marketplace/header"
import { MarketplaceFrame } from "@/components/marketplace/frame"

const PROSE = [
  "mt-12 space-y-10 text-[15px] leading-7 text-[#4d4943]",
  // Section headings
  "[&_h2]:mb-3 [&_h2]:font-serif [&_h2]:text-[26px] [&_h2]:leading-tight [&_h2]:tracking-[-0.02em] [&_h2]:text-[#151412] sm:[&_h2]:text-3xl",
  // Sub-headings inside a section
  "[&_h3]:mb-1.5 [&_h3]:mt-6 [&_h3]:font-mono [&_h3]:text-[9px] [&_h3]:uppercase [&_h3]:tracking-[0.14em] [&_h3]:text-[#d84d37]",
  // Paragraph rhythm within a section
  "[&_section>p+p]:mt-3",
  "[&_strong]:font-semibold [&_strong]:text-[#151412]",
  "[&_em]:not-italic [&_em]:font-medium [&_em]:text-[#77726a]",
  "[&_code]:bg-[rgba(55,50,47,.06)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[12px] [&_code]:text-[#2f2c28]",
  "[&_a]:underline [&_a]:underline-offset-2 [&_a]:decoration-[rgba(55,50,47,.3)] hover:[&_a]:decoration-[#ef4e37]",
].join(" ")

export function LegalPage({
  eyebrow,
  title,
  intro,
  updated = "August 27, 2026",
  children,
}: {
  eyebrow: string
  title: string
  intro: string
  updated?: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen justify-center bg-[#fafafa] text-[#111]">
      <MarketplaceFrame>
        <Header />
        <article className="mx-auto mt-32 max-w-3xl border-x border-[rgba(55,50,47,.12)] px-5 py-14 sm:mt-40 sm:px-12 sm:py-24">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">{eyebrow}</p>
          <h1 className="mt-4 font-serif text-[38px] leading-[1.05] tracking-[-0.04em] sm:text-6xl">{title}</h1>
          <p className="mt-5 text-[16px] leading-7 text-[#68635b] sm:text-lg sm:leading-8">{intro}</p>
          <div className={PROSE}>{children}</div>
          <p className="mt-14 border-t border-[rgba(55,50,47,0.12)] pt-6 font-mono text-[9px] uppercase tracking-[0.12em] text-[#999]">
            Last updated: {updated}
          </p>
        </article>
      </MarketplaceFrame>
    </main>
  )
}
