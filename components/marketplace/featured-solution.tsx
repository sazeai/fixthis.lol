"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Flag } from "lucide-react"
import { formatMoney } from "@/lib/marketplace/helpers"
import type { FeaturedPlacement } from "@/types/marketplace"

export function FeaturedSolution({
  problemId,
  compact = false,
  nextBidCents,
}: {
  problemId: string
  compact?: boolean
  /** Lets the unclaimed state name its own entry price instead of staying vague. */
  nextBidCents?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  // "unavailable" is a failed request, kept distinct from null so a problem
  // that could not be resolved is never advertised as unclaimed. See the same
  // split in SponsorRow.
  const [placement, setPlacement] = useState<FeaturedPlacement | null | "unavailable" | undefined>(undefined)
  // Distinguishes "not yet in view" from "in view, waiting on the server", so
  // off-screen cards stay inert instead of shimmering all the way down the board.
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    let cancelled = false
    const resolve = (attempt = 0) => {
      if (cancelled) return
      setRequested(true)
      fetch(`/api/problems/${problemId}/feature`, { method: "POST" })
        .then((response) => {
          if (!response.ok) throw new Error(`feature ${response.status}`)
          return response.json()
        })
        .then((result) => { if (!cancelled) setPlacement(result.placement ?? null) })
        .catch(() => {
          if (cancelled) return
          if (attempt === 0) { setTimeout(() => resolve(1), 1200); return }
          setPlacement("unavailable")
        })
    }

    const node = ref.current
    // Without IntersectionObserver we cannot tell what is on screen, so resolve
    // immediately rather than leaving the card permanently blank.
    if (!node || typeof IntersectionObserver === "undefined") {
      resolve()
      return () => { cancelled = true }
    }

    // Resolve only when the card actually enters the viewport, so below-the-fold
    // cards never generate an impression.
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return
      observer.disconnect()
      resolve()
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => { cancelled = true; observer.disconnect() }
  }, [problemId])

  // A failed resolve holds the placeholder rather than falling through to the
  // unclaimed copy. Same height, no pulse, no claim either way.
  const unresolved = placement === undefined || placement === "unavailable"

  function trackClick() {
    if (!placement || placement === "unavailable") return
    navigator.sendBeacon?.(`/api/placements/${placement.placement_id}/click`)
  }

  if (compact) {
    return (
      <div ref={ref} className="min-h-[18px]">
        {unresolved ? (
          <span aria-hidden="true" className={`block h-[10px] w-40 max-w-full rounded-full bg-[rgba(55,50,47,.09)] ${requested && placement === undefined ? "animate-pulse" : ""}`} />
        ) : placement === null ? (
          <p className="flex min-w-0 items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.11em] text-[#a8a39c]">
            <Flag size={9} className="shrink-0" />
            <span className="truncate">
              Unclaimed{nextBidCents ? ` · first claim ${formatMoney(nextBidCents)}` : ""}
            </span>
          </p>
        ) : (
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#d84d37]">
              {placement.claim_kind === "founding" ? "Founding" : "Paid"}
            </span>
            <span className="truncate text-[11px] font-semibold text-[#2f2c28]">{placement.product_name}</span>
            <a
              href={placement.destination_url}
              target="_blank"
              rel="sponsored nofollow noopener"
              onClick={trackClick}
              className="group/visit ml-auto inline-flex shrink-0 items-center gap-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#8a857e] transition-colors hover:text-[#ef4e37]"
            >
              Visit
              <ArrowUpRight size={9} className="transition-transform duration-200 group-hover/visit:-translate-y-px group-hover/visit:translate-x-px" />
            </a>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={ref} className="min-h-[128px] bg-white p-5">
      {unresolved ? (
        <div className={`flex h-[88px] flex-col justify-center gap-2.5 ${requested && placement === undefined ? "animate-pulse" : ""}`} aria-hidden="true">
          <span className="block h-[9px] w-24 rounded-full bg-[rgba(55,50,47,.09)]" />
          <span className="block h-[18px] w-44 max-w-full rounded-full bg-[rgba(55,50,47,.11)]" />
          <span className="block h-[9px] w-full max-w-xs rounded-full bg-[rgba(55,50,47,.07)]" />
        </div>
      ) : placement === null ? (
        <div className="flex h-[88px] flex-col justify-center">
          <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#a8a39c]">
            <Flag size={10} /> Unclaimed
          </p>
          <p className="mt-2 text-[13px] text-[#77726a]">
            No product has claimed this problem yet
            {nextBidCents ? <> — the first claim is <span className="font-semibold text-[#2f2c28]">{formatMoney(nextBidCents)}</span></> : null}.
          </p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#d84d37]">
              {placement.claim_kind === "founding" ? "Founding claim" : "Paid placement"}
            </span>
            <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#a8a39c]">
              {placement.click_count.toLocaleString("en-US")} clicks
            </span>
          </div>
          <p className="mt-3 font-serif text-[22px] leading-none tracking-[-0.03em] text-[#111]">{placement.product_name}</p>
          <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[#77726a]">{placement.product_tagline}</p>
          <a
            href={placement.destination_url}
            target="_blank"
            rel="sponsored nofollow noopener"
            onClick={trackClick}
            className="group/visit mt-4 inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#111] transition-colors hover:text-[#ef4e37]"
          >
            <span className="border-b border-current pb-0.5">Visit solution</span>
            <ArrowUpRight size={12} className="transition-transform duration-200 group-hover/visit:-translate-y-px group-hover/visit:translate-x-px" />
          </a>
        </div>
      )}
    </div>
  )
}
