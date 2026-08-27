"use client"

import { useEffect, useState } from "react"
import type { PublicTrafficStats } from "@/types/marketplace"

/**
 * The hero's live-traffic badge.
 *
 * Sends a presence heartbeat only while the tab is actually visible, so
 * backgrounded tabs never inflate the live count, and polls the public figures
 * back. Numbers are never invented: the live figure stays hidden below five
 * visitors, and with no traffic at all the badge falls back to naming what the
 * site is rather than showing a zero.
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

  const hasTraffic = Boolean(stats.live_visitors) || stats.visitors_24h > 0
  if (!badge) return null

  return (
    <p className="mb-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8a857e]">
      <span className="flex items-center gap-2">
        <span className={`size-1.5 rounded-full bg-[#ef4e37] shadow-[0_0_0_3px_rgba(239,78,55,.11)] ${stats.live_visitors ? "animate-pulse" : ""}`} />
        {stats.live_visitors ? (
          <span className="text-[#111]"><span className="tabular-nums">{stats.live_visitors}</span> live now</span>
        ) : (
          <span>Live problem marketplace</span>
        )}
      </span>
      {hasTraffic && stats.visitors_24h > 0 ? (
        <>
          <span className="text-[#d6d2cc]">·</span>
          <span><span className="tabular-nums text-[#111]">{stats.visitors_24h.toLocaleString("en-US")}</span> visitors / 24h</span>
        </>
      ) : null}
    </p>
  )
}
