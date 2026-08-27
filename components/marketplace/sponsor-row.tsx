"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Flag } from "lucide-react"
import { ProductIcon } from "@/components/marketplace/product-icon"
import { formatMoney } from "@/lib/marketplace/helpers"
import type { FeaturedPlacement, ProblemCompetitor } from "@/types/marketplace"

/**
 * The advertiser surface on a board card.
 *
 * One product is featured and clickable — the rotation decides which, per
 * visitor. Everyone else appears as a desaturated icon in a stack: persistent
 * presence for positions below #1 (so lower placements are worth buying)
 * without diluting the click advantage that makes #1 worth competing for.
 */
export function SponsorRow({
  problemId,
  competitors,
  nextBidCents,
}: {
  problemId: string
  competitors: ProblemCompetitor[]
  nextBidCents: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<FeaturedPlacement | null | undefined>(undefined)
  const [requested, setRequested] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    const resolve = () => {
      if (cancelled) return
      setRequested(true)
      fetch(`/api/problems/${problemId}/feature`, { method: "POST" })
        .then((response) => response.json())
        .then((result) => { if (!cancelled) setPlacement(result.placement || null) })
        .catch(() => { if (!cancelled) setPlacement(null) })
    }

    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      resolve()
      return () => { cancelled = true }
    }
    // Resolve only in view, so below-the-fold cards never bill an impression.
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return
      observer.disconnect()
      resolve()
    }, { threshold: 0.45 })
    observer.observe(node)
    return () => { cancelled = true; observer.disconnect() }
  }, [problemId])

  // Close the reveal on an outside click or Escape.
  useEffect(() => {
    if (!open) return
    const onDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false) }
    document.addEventListener("mousedown", onDown)
    document.addEventListener("keydown", onKey)
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey) }
  }, [open])

  function trackClick() {
    if (!placement) return
    navigator.sendBeacon?.(`/api/placements/${placement.placement_id}/click`)
  }

  // The rotation picks the featured placement client-side, but the card was
  // served with every competitor's icon — so look it up rather than widening
  // the RPC's return shape.
  const featured = placement ? competitors.find((item) => item.placement_id === placement.placement_id) : undefined
  const others = placement ? competitors.filter((item) => item.placement_id !== placement.placement_id) : []

  if (placement === null) {
    return (
      <div ref={ref} className="flex min-h-[34px] items-center gap-1.5 border border-dashed border-[rgba(55,50,47,0.16)] px-2.5 py-2">
        <Flag size={11} className="shrink-0 text-[#c4c0ba]" />
        <span className="truncate font-mono text-[9px] uppercase tracking-[0.11em] text-[#a8a39c]">
          Unclaimed · first claim {formatMoney(nextBidCents)}
        </span>
      </div>
    )
  }

  if (placement === undefined) {
    return (
      <div ref={ref} className="min-h-[34px] border border-[rgba(55,50,47,0.09)] px-2.5 py-2">
        <span aria-hidden="true" className={`block h-[10px] w-32 max-w-full rounded-full bg-[rgba(55,50,47,.09)] ${requested ? "animate-pulse" : ""}`} />
      </div>
    )
  }

  return (
    <div ref={ref} className="relative bg-white/70 px-2.5 py-2 shadow-[inset_0_0_0_1px_rgba(55,50,47,.09)]">
      <div className="flex min-w-0 items-center gap-2">
        <ProductIcon
          name={placement.product_name}
          seed={placement.registrable_domain}
          iconUrl={featured?.icon_url ?? null}
          size={20}
        />
        <span className="truncate text-[13px] font-semibold leading-tight text-[#111]">{placement.product_name}</span>
        <a
          href={placement.destination_url}
          target="_blank"
          rel="sponsored nofollow noopener"
          onClick={trackClick}
          className="group/visit ml-auto inline-flex shrink-0 items-center gap-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-[#8a857e] transition-colors hover:text-[#ef4e37]"
        >
          Visit
          <ArrowUpRight size={10} className="transition-transform duration-200 group-hover/visit:-translate-y-px group-hover/visit:translate-x-px" />
        </a>
      </div>

      <div className="mt-1.5 flex min-w-0 items-center gap-2">
        <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#a8a39c]">
          {placement.claim_kind === "founding" ? "Founding claim" : "Sponsored"}
        </span>

        {others.length ? (
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-label={`${others.length} other ${others.length === 1 ? "product" : "products"} competing for this problem`}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5"
          >
            <span className="flex">
              {others.slice(0, 3).map((item, index) => (
                <ProductIcon
                  key={item.placement_id}
                  name={item.name}
                  seed={item.registrable_domain}
                  iconUrl={item.icon_url}
                  size={16}
                  muted
                  className={index ? "-ml-1.5 ring-2 ring-white" : "ring-2 ring-white"}
                />
              ))}
            </span>
            <span className="border-b border-[rgba(55,50,47,.25)] font-mono text-[8px] uppercase tracking-[0.1em] text-[#8a857e] transition-colors hover:text-[#111]">
              {others.length} more
            </span>
          </button>
        ) : null}
      </div>

      {open && others.length ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1 border border-[rgba(55,50,47,0.12)] bg-white px-3 py-2.5 shadow-[0_2px_14px_rgba(55,50,47,.1)]">
          <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#a8a39c]">Competing for this problem</p>
          <div className="mt-2">
            {competitors.slice(0, 5).map((item, index) => (
              <div
                key={item.placement_id}
                className={`flex items-center gap-2 py-1.5 ${index ? "border-t border-[rgba(55,50,47,0.08)]" : ""}`}
              >
                <ProductIcon name={item.name} seed={item.registrable_domain} iconUrl={item.icon_url} size={17} />
                <span className="truncate text-[12px] text-[#111]">{item.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[11px] tabular-nums text-[#111]">
                  {item.founding_claim ? "$0" : formatMoney(item.current_bid_cents)}
                </span>
                <span className="w-11 shrink-0 text-right font-mono text-[8px] uppercase tracking-[0.08em] text-[#a8a39c]">
                  ~{item.visibility_percentage}%
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-4 text-[#8a857e]">
            One is shown at a time. Higher bids appear more often.
          </p>
        </div>
      ) : null}
    </div>
  )
}
