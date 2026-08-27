"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowUpRight, Flag, MousePointerClick } from "lucide-react"
import { FloatingEventLayer, useFloatingEvents } from "@/components/marketplace/floating-events"
import { toneFor, type MarketEvent } from "@/components/marketplace/market-event-feed"
import { ProductIcon } from "@/components/marketplace/product-icon"
import { formatMoney } from "@/lib/marketplace/helpers"
import type { FeaturedPlacement, ProblemCompetitor } from "@/types/marketplace"

/**
 * The advertiser band on a board card.
 *
 * Deliberately not a panel. The card is already a panel inside a grid of
 * panels, so an inset box would be a third level of nesting the rest of the
 * page never uses. Zones here are separated the way the action row separates
 * itself — a hairline rule running the card's full width — so the band reads as
 * part of the card rather than something dropped into it.
 *
 * One product is featured and clickable; the rotation picks which, per visitor.
 * The others appear only as desaturated icons, so lower placements keep
 * persistent presence without diluting the click advantage of being first.
 * The full battlefield lives on the problem page, which has room for a table.
 */
export function SponsorRow({
  problemId,
  competitors,
  nextBidCents,
  events = [],
}: {
  problemId: string
  competitors: ProblemCompetitor[]
  nextBidCents: number
  /** Real recorded marketplace events for this problem, replayed as they arrive. */
  events?: MarketEvent[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<FeaturedPlacement | null | undefined>(undefined)
  const [requested, setRequested] = useState(false)
  const { events: floating, spawn } = useFloatingEvents(2)
  const shown = useRef(new Set<string>())

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

  useEffect(() => {
    const fresh = events.filter((event) => !shown.current.has(event.id))
    if (!fresh.length) return
    fresh.forEach((event, index) => {
      shown.current.add(event.id)
      // Staggered: two events landing together should read as a sequence, not
      // a pile. Never labelled "just now" — these are replayed, not live.
      setTimeout(() => spawn(event.text, toneFor(event.type)), index * 700)
    })
  }, [events, spawn])

  // The featured advertiser's standing offer, floated slowly rather than
  // recorded as an event. It is given the distinct "offer" tone and never goes
  // through market_events, so it cannot read as a thing that just happened.
  // Skipped entirely under reduced motion: a label that reappears on a timer is
  // harder to tolerate than one tied to a real arrival.
  useEffect(() => {
    const offer = placement?.offer
    if (!offer) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    let timer: ReturnType<typeof setTimeout>
    const schedule = (delay: number) => {
      timer = setTimeout(() => {
        spawn(offer, "offer")
        // Jittered so cards carrying the same advertiser do not pulse in
        // lockstep down the board.
        schedule(52_000 + Math.random() * 16_000)
      }, delay)
    }
    schedule(9_000 + Math.random() * 4_000)
    return () => clearTimeout(timer)
  }, [placement?.offer, spawn])

  function trackClick() {
    if (!placement) return
    navigator.sendBeacon?.(`/api/placements/${placement.placement_id}/click`)
  }

  // Full-bleed: cancel the card's padding so the rules meet both edges, then
  // put the padding back on the content.
  const band = "-mx-5 border-y border-[rgba(55,50,47,0.1)] px-5 sm:-mx-6 sm:px-6"

  if (placement === undefined) {
    return (
      <div ref={ref} className={`${band} py-2.5`}>
        <span aria-hidden="true" className={`block h-[10px] w-32 max-w-full rounded-full bg-[rgba(55,50,47,.08)] ${requested ? "animate-pulse" : ""}`} />
      </div>
    )
  }

  if (placement === null) {
    return (
      <div ref={ref} className={`${band} flex items-center gap-1.5 py-2.5`}>
        <Flag size={10} className="shrink-0 text-[#c4c0ba]" />
        <span className="truncate font-mono text-[8px] uppercase tracking-[0.12em] text-[#a8a39c]">
          Unclaimed · first claim {formatMoney(nextBidCents)}
        </span>
      </div>
    )
  }

  const featured = competitors.find((item) => item.placement_id === placement.placement_id)
  const others = competitors.filter((item) => item.placement_id !== placement.placement_id)
  const otherNames = others.map((item) => item.name).join(", ")

  return (
    <div ref={ref} className={`group/band ${band} relative flex items-center gap-2.5 py-2.5`}>
      <FloatingEventLayer events={floating} align="left" />
      <ProductIcon
        name={placement.product_name}
        seed={placement.registrable_domain}
        iconUrl={featured?.icon_url ?? null}
        size={28}
      />

      <div className="min-w-0 flex-1">
        {/* The name is the link. A separate "visit" label sat detached from the
            thing it acted on; making the product itself clickable is the
            stronger affordance and gives the name the weight it was paid for. */}
        <a
          href={placement.destination_url}
          target="_blank"
          rel="sponsored nofollow noopener"
          onClick={trackClick}
          className="group/visit inline-flex max-w-full items-center gap-1 text-[13px] font-semibold leading-tight text-[#111] transition-colors hover:text-[#ef4e37]"
        >
          <span className="truncate underline decoration-[rgba(55,50,47,.2)] decoration-1 underline-offset-[3px] transition-colors group-hover/visit:decoration-[#ef4e37]">
            {placement.product_name}
          </span>
          <ArrowUpRight size={11} className="shrink-0 text-[#a8a39c] transition-[transform,color] duration-200 group-hover/visit:-translate-y-px group-hover/visit:translate-x-px group-hover/visit:text-[#ef4e37]" />
        </a>
        <p className="mt-0.5 flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#bbb6ae]">
          <span>{placement.claim_kind === "founding" ? "Founding claim" : "Sponsored"}</span>
          {/* Live from the rotation RPC, not the cached board, so the number a
              founder sees here is the real one. */}
          {placement.click_count > 0 ? (
            <>
              <span className="text-[#e0dcd6]">·</span>
              <span className="flex items-center gap-0.5 text-[#a8a39c]" title={`${placement.click_count.toLocaleString("en-US")} outbound clicks`}>
                <MousePointerClick size={9} className="shrink-0" />
                <span className="tabular-nums">{placement.click_count.toLocaleString("en-US")}</span>
              </span>
            </>
          ) : null}
        </p>
      </div>

      {others.length ? (
        <span className="flex shrink-0 items-center" title={`Also competing: ${otherNames}`}>
          {/* Overlapped and desaturated at rest. On hover each icon separates,
              comes up to full colour and unfurls its own name, so a name is
              attached to the product it belongs to. All width and opacity, so
              the row's height never changes and nothing can clip. */}
          {others.slice(0, 3).map((item, index) => (
            <span
              key={item.placement_id}
              className={`flex items-center overflow-hidden rounded-full transition-[margin,background-color] duration-300 ease-out group-hover/band:bg-[rgba(55,50,47,.05)] ${index ? "-ml-2.5 group-hover/band:ml-1" : ""}`}
            >
              <ProductIcon
                name={item.name}
                seed={item.registrable_domain}
                iconUrl={item.icon_url}
                size={18}
                className="shrink-0 opacity-60 saturate-[.3] ring-2 ring-white transition-[opacity,filter] duration-300 ease-out group-hover/band:opacity-100 group-hover/band:saturate-100 group-hover/band:ring-0"
              />
              <span className="max-w-0 overflow-hidden whitespace-nowrap font-mono text-[8px] uppercase tracking-[0.1em] text-[#77726a] opacity-0 transition-all duration-300 ease-out group-hover/band:max-w-[74px] group-hover/band:pl-1 group-hover/band:pr-1.5 group-hover/band:opacity-100">
                <span className="block truncate">{item.name}</span>
              </span>
            </span>
          ))}
        </span>
      ) : null}
    </div>
  )
}
