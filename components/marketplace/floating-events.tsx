"use client"

import { useCallback, useRef, useState } from "react"

export type FloatingTone = "pain" | "alternative" | "lead" | "offer" | "bid"

export type FloatingEvent = {
  id: number
  text: string
  tone: FloatingTone
  /** Horizontal drift in pixels, randomised so repeats do not stack. */
  drift: number
}

const TONE: Record<FloatingTone, string> = {
  pain: "bg-[#fff0eb] text-[#d84d37] ring-[rgba(216,77,55,.22)]",
  alternative: "bg-[#eef4ff] text-[#2f5bbd] ring-[rgba(47,91,189,.2)]",
  lead: "bg-[#111] text-white ring-[rgba(17,17,17,.25)]",
  offer: "bg-[#eef7f0] text-[#2f7d4f] ring-[rgba(47,125,79,.22)]",
  bid: "bg-[#fdf4e3] text-[#8a5a12] ring-[rgba(138,90,18,.2)]",
}

/**
 * Queue of short-lived floating labels.
 *
 * Each spawn lives for the length of its animation and is then dropped from
 * state, so nothing accumulates in the DOM. The cap exists because several real
 * events can land at once and a card should never become a wall of text.
 */
export function useFloatingEvents(max = 3) {
  const [events, setEvents] = useState<FloatingEvent[]>([])
  const nextId = useRef(0)

  const spawn = useCallback((text: string, tone: FloatingTone = "pain") => {
    const id = (nextId.current += 1)
    const drift = Math.round((Math.random() * 2 - 1) * 18)
    setEvents((current) => [...current.slice(-(max - 1)), { id, text, tone, drift }])
    // Matches the animation length; the node is gone before it could pile up.
    setTimeout(() => setEvents((current) => current.filter((event) => event.id !== id)), 1500)
  }, [max])

  return { events, spawn }
}

/**
 * Renders floating labels above an anchor.
 *
 * The parent must be `relative`. This layer is `pointer-events-none` and
 * `aria-hidden` — it is atmosphere over a real number that is already announced
 * by the control it spawns from, so it must never intercept a click or be read
 * out twice.
 */
export function FloatingEventLayer({
  events,
  align = "center",
}: {
  events: FloatingEvent[]
  align?: "center" | "left" | "right"
}) {
  if (!events.length) return null

  const position = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"

  return (
    <span aria-hidden="true" className={`pointer-events-none absolute bottom-full z-30 ${position} mb-1 flex flex-col items-center gap-1`}>
      {events.map((event) => (
        <span
          key={event.id}
          style={{ ["--fx-drift" as string]: `${event.drift}px` }}
          className={`fx-float whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ring-1 ring-inset ${TONE[event.tone]}`}
        >
          {event.text}
        </span>
      ))}
    </span>
  )
}
