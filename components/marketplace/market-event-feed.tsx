"use client"

import { useEffect, useState } from "react"
import type { FloatingTone } from "@/components/marketplace/floating-events"

export type MarketEvent = {
  id: string
  problem_id: string
  placement_id: string | null
  type: "support" | "placement_entered" | "bid" | "took_first" | "offer_updated"
  text: string
  created_at: string
}

const TONE_FOR: Record<MarketEvent["type"], FloatingTone> = {
  support: "pain",
  placement_entered: "alternative",
  bid: "bid",
  took_first: "lead",
  offer_updated: "offer",
}

export function toneFor(type: MarketEvent["type"]): FloatingTone {
  return TONE_FOR[type] ?? "pain"
}

/**
 * One poll for the whole board, keyed by problem.
 *
 * Twelve cards each polling would be twelve requests for the same handful of
 * rows. Everything here is a real recorded event — nothing is invented, and
 * because these are replayed from recent history the UI never claims they are
 * happening "just now".
 */
export function useMarketEvents(enabled: boolean, intervalMs = 45_000) {
  const [byProblem, setByProblem] = useState<Record<string, MarketEvent[]>>({})

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    // Only events since mount are surfaced, so a visitor is never shown a
    // week-old bid as though it just landed.
    const openedAt = new Date().toISOString()

    const load = () => {
      if (document.visibilityState !== "visible") return
      fetch(`/api/market-events?since=${encodeURIComponent(openedAt)}`, { cache: "no-store" })
        .then((response) => response.json())
        .then((result: { events?: MarketEvent[] }) => {
          if (cancelled || !result.events?.length) return
          setByProblem((current) => {
            const next = { ...current }
            for (const event of result.events!) {
              const seen = next[event.problem_id] || []
              if (seen.some((item) => item.id === event.id)) continue
              next[event.problem_id] = [...seen, event]
            }
            return next
          })
        })
        .catch(() => undefined)
    }

    const timer = setInterval(load, intervalMs)
    return () => { cancelled = true; clearInterval(timer) }
  }, [enabled, intervalMs])

  return byProblem
}
