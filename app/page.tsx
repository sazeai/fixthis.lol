import type { Metadata } from "next"
import { Footer } from "@/components/marketplace/footer"
import { FramedSection, MarketplaceFrame } from "@/components/marketplace/frame"
import { Header } from "@/components/marketplace/header"
import { Hero } from "@/components/marketplace/hero"
import { LiveFightsStrip } from "@/components/marketplace/live-fights-strip"
import { MarketplaceHome } from "@/components/marketplace/marketplace-home"
import { HomeJsonLd } from "@/components/seo/home-json-ld"
import { getProblemSummaries, getPublicTrafficStats } from "@/lib/marketplace/queries"
import { topLiveFights } from "@/lib/marketplace/live-fights"
import { buildProblemSections } from "@/lib/marketplace/sections"
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/site"
import type { ProblemSummary, PublicTrafficStats } from "@/types/marketplace"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
}

/** Errors log as "{}" when passed as a console.error argument; unwrap them. */
function describeError(reason: unknown) {
  if (reason instanceof Error) return `${reason.message}
${reason.stack || ""}`
  if (reason && typeof reason === "object") return JSON.stringify(reason)
  return String(reason)
}

function HowItWorks() {
  const steps = [
    ["01", "Call it out", "Tell everyone what sucks about the software you are using."],
    ["02", "People pile on", "Others with the same frustration hit ME TOO."],
    ["03", "Alternatives fight", "Competing products can pay to get in front of everyone with that problem."],
  ]
  return <section id="how-it-works" className="w-full"><header className="flex flex-col gap-1.5 border-y border-[rgba(55,50,47,0.12)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-8"><div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3"><p className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.16em] text-[#999]">How it works</p><h2 className="font-serif text-[19px] leading-tight text-[#111] sm:text-xl">Call it out. Pile on. Watch them fight.</h2></div><p className="text-[11px] text-[#777]">Magic link required to post.</p></header><div className="grid border-y border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)] md:grid-cols-3 md:gap-px">{steps.map(([number, title, body], index) => <article key={number} className={`bg-[#fafafa] p-7 transition-colors hover:bg-white ${index ? "border-t border-[rgba(55,50,47,0.12)] md:border-t-0" : ""}`}><p className="font-mono text-[9px] tracking-[0.16em] text-[#aaa]">{number}</p><h3 className="mt-6 font-serif text-xl text-[#111]">{title}</h3><p className="mt-2 text-[13px] leading-5 text-[#666]">{body}</p></article>)}</div></section>
}

export default async function HomePage() {
  let problems: ProblemSummary[] = []
  let traffic: PublicTrafficStats = { live_visitors: null, visitors_24h: 0 }
  // Settled, not all: a hiccup in the visitor counter must not discard the
  // whole board. Errors are logged with their real reason — passing an Error
  // straight to console.error prints "{}", because message and stack are
  // non-enumerable, which is why this failure used to say nothing at all.
  const [problemResult, trafficResult] = await Promise.allSettled([getProblemSummaries(), getPublicTrafficStats()])
  if (problemResult.status === "fulfilled") problems = problemResult.value
  else console.error("FIXTHIS problem board query failed:", describeError(problemResult.reason))
  if (trafficResult.status === "fulfilled") traffic = trafficResult.value
  else console.error("FIXTHIS traffic stats query failed:", describeError(trafficResult.reason))
  const sections = buildProblemSections(problems)
  // Paid circulation, surfaced separately from the organic board so money is
  // visible without money reordering anything.
  const fights = topLiveFights(problems)
  return <div className="relative flex min-h-screen w-full flex-col bg-[#fafafa] font-sans text-[#111]"><HomeJsonLd /><div className="flex min-h-screen flex-col items-center"><MarketplaceFrame><Header /><main className="relative z-10 mt-28 flex w-full flex-col items-center"><Hero traffic={traffic} /><FramedSection><LiveFightsStrip fights={fights} /><MarketplaceHome problems={problems} sections={sections} /></FramedSection><FramedSection contentClassName="pb-16"><HowItWorks /></FramedSection><FramedSection><Footer /></FramedSection></main></MarketplaceFrame></div></div>
}
