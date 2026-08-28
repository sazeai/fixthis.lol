"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, LoaderCircle } from "lucide-react"
import { FounderDashboard } from "@/components/marketplace/founder-dashboard"
import { Footer } from "@/components/marketplace/footer"
import { FramedSection, MarketplaceFrame } from "@/components/marketplace/frame"
import { Header } from "@/components/marketplace/header"
import { MagicLinkAuth } from "@/components/marketplace/magic-link-auth"
import { useAccessToken, useSession } from "@/components/marketplace/use-session"
import type { AdminOffer } from "@/types/marketplace"

type Owned = { product: Record<string, any>; offers: AdminOffer[] }

export function DashboardClient() {
  const session = useSession()
  const getToken = useAccessToken()
  const [owned, setOwned] = useState<Owned[] | null>(null)

  useEffect(() => {
    let active = true
    if (!session.checked) return
    if (!session.email) { setOwned([]); return }
    getToken().then(async (token) => {
      if (!token || !active) return
      try {
        const response = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
        const result = await response.json()
        if (active) setOwned(result.products || [])
      } catch { if (active) setOwned([]) }
    })
    return () => { active = false }
  }, [session.checked, session.email, getToken])

  if (!session.checked || owned === null) return <Shell><Loading /></Shell>

  if (!session.email) {
    return (
      <Shell>
        <div className="mx-auto max-w-md border border-[rgba(55,50,47,0.12)] bg-white">
          <MagicLinkAuth
            redirectTo={typeof window !== "undefined" ? window.location.href : "/dashboard"}
            titleId="dashboard-auth"
            title="Sign in to your product."
            blurb="Use the address at your product's domain. That is the same sign-in that lets you answer problems."
            returnHint="open your dashboard"
            emailPlaceholder="you@yourproduct.com"
          />
        </div>
      </Shell>
    )
  }

  if (!owned.length) {
    return (
      <Shell>
        <div className="mx-auto max-w-lg border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-6 py-12 text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Nothing claimed yet</p>
          <h1 className="mt-3 font-serif text-[28px] leading-[1.05] tracking-[-0.04em] text-[#111]">
            You don&rsquo;t have a product here yet.
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-[#666]">
            Find a problem your product solves and answer it. Answering from an address at your own
            domain is what claims the product &mdash; there is no separate signup.
          </p>
          <Link
            href="/#problems"
            className="mt-6 inline-flex h-11 items-center gap-1.5 bg-[#111] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ef4e37]"
          >
            Find a problem you solve <ArrowUpRight size={13} />
          </Link>
          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.1em] text-[#aaa]">
            Signed in as {session.email}
          </p>
        </div>
      </Shell>
    )
  }

  // One product is the overwhelmingly common case; more than one just stacks.
  return <>{owned.map((item) => (
    <FounderDashboard key={item.product.id} product={item.product} offers={item.offers} />
  ))}</>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#fafafa] font-sans text-[#111]">
      <div className="flex min-h-screen flex-col items-center">
        <MarketplaceFrame>
          <Header />
          <main className="relative z-10 mt-28 flex w-full flex-col items-center">
            <FramedSection contentClassName="px-5 py-12 sm:px-8">{children}</FramedSection>
            <FramedSection><Footer /></FramedSection>
          </main>
        </MarketplaceFrame>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <p className="flex items-center justify-center gap-2 py-16 font-mono text-[10px] uppercase tracking-[0.14em] text-[#a8a39c]">
      <LoaderCircle size={13} className="animate-spin" /> Loading
    </p>
  )
}
