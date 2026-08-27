"use client"

import { useEffect, useState } from "react"
import type { PublicTrafficStats } from "@/types/marketplace"

/**
 * The hero's live-traffic badge.
 *
 * Sends a presence heartbeat only while the tab is actually visible, so
 * backgrounded tabs never inflate the live count, and polls the public figures
 * back. The hero shows only the useful 24-hour total; the live count remains
 * available to the rest of the application without adding visual noise here.
 */
export function PresenceTracker({
  initial,
  badge = true,
}: {
  initial: PublicTrafficStats
  /** Off on pages with no hero: the heartbeat still runs, the badge does not render. */
  badge?: boolean
}) {
  const [stats, setStats] = useState(initial)

  useEffect(() => {
    const beat = () => {
      if (document.visibilityState === "visible") {
        fetch("/api/presence", { method: "POST", keepalive: true }).catch(() => undefined)
      }
    }
    const refresh = () => fetch("/api/presence").then((response) => response.json()).then(setStats).catch(() => undefined)

    beat()
    const heartbeat = setInterval(beat, 20_000)
    const poll = setInterval(refresh, 15_000)
    document.addEventListener("visibilitychange", beat)
    return () => {
      clearInterval(poll)
      clearInterval(heartbeat)
      document.removeEventListener("visibilitychange", beat)
    }
  }, [])

  if (!badge) return null

  return (
    <p className="mb-4 inline-flex items-baseline gap-2.5 font-mono sm:mb-6" aria-label={`${stats.visitors_24h.toLocaleString("en-US")} visitors in the last 24 hours`}>
      <span className="tabular-nums text-[21px] font-semibold leading-none tracking-[-0.05em] text-[#d84d37]">
        {stats.visitors_24h.toLocaleString("en-US")}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5f5a54]">visitors / 24h</span>
    </p>
  )
}
