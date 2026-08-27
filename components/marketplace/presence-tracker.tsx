"use client"

import { useEffect, useState } from "react"
import type { PublicTrafficStats } from "@/types/marketplace"

export function PresenceTracker({ initial }: { initial: PublicTrafficStats }) {
  const [stats, setStats] = useState(initial)

  useEffect(() => {
    // Heartbeat only while the tab is actually visible, so backgrounded tabs
    // never inflate the live count.
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

  // Nothing real to show yet — never render a fabricated counter.
  if (!stats.live_visitors && stats.visitors_24h === 0) return null

  return (
    <div className="fixed bottom-4 left-4 z-30 flex items-center gap-2.5 border border-[rgba(55,50,47,0.12)] bg-white/92 px-3 py-2 font-mono text-[8px] uppercase tracking-[0.12em] text-[#777] shadow-[0_6px_20px_rgba(55,50,47,.08)] backdrop-blur">
      {stats.live_visitors ? (
        <span className="flex items-center gap-1.5 text-[#111]">
          <span className="size-1.5 rounded-full bg-[#ef4e37] shadow-[0_0_0_3px_rgba(239,78,55,.12)]" />
          {stats.live_visitors} live
        </span>
      ) : null}
      {stats.live_visitors ? <span className="text-[#ddd]">·</span> : null}
      <span>{stats.visitors_24h.toLocaleString("en-US")} visitors / 24h</span>
    </div>
  )
}
