"use client"

import { useEffect, useState } from "react"
import type { PublicTrafficStats } from "@/types/marketplace"

/**
 * The hero's live-traffic badge.
 *
 * Sends a presence heartbeat only while the tab is actually visible, so
 * backgrounded tabs never inflate the live count, and polls the public figures
 * back. Both figures are shown: who is here right now, and the 24-hour total.
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

  const live = stats.live_visitors ?? 0

  return (
    <p
      className="mb-4 inline-flex items-baseline gap-2.5 font-mono sm:mb-6"
      aria-label={`${live} online now, ${stats.visitors_24h.toLocaleString("en-US")} visitors in the last 24 hours`}
    >
      {/* The two figures carry equal weight, so they are set at equal size; only
          the colour and the live dot separate "right now" from "today". */}
      {/* The dot centres itself against the line; wrapping it with the number in
          an inline-flex made the dot define that group's baseline and dropped
          the live figure 5px below the 24-hour one. */}
      <span aria-hidden className="size-1.5 self-center rounded-full bg-[#2f7d4f]" />
      <span className="-ml-1 tabular-nums text-[21px] font-semibold leading-none tracking-[-0.05em] text-[#111]">{live}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5f5a54]">online</span>
      <span aria-hidden className="text-[9px] text-[#c9c4bd]">·</span>
      <span className="tabular-nums text-[21px] font-semibold leading-none tracking-[-0.05em] text-[#d84d37]">
        {stats.visitors_24h.toLocaleString("en-US")}
      </span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[#5f5a54]">visitors / 24h</span>
    </p>
  )
}
