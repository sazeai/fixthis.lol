"use client"

import { useCallback, useRef, useState } from "react"

export type FloatingTone = "pain" | "alternative" | "lead" | "offer" | "bid"

export type FloatingEvent = {
  id: number
  text: string
  tone: FloatingTone
  /** Horizontal drift in pixels, randomised so repeats do not stack. */
  drift: number
  /** Start offset along the anchor, so simultaneous spawns do not overlap. */
  offset: number
  /** Start height, for the same reason. */
  lift: number
}

const TONE: Record<FloatingTone, string> = {
  pain: "bg-[#fff0eb] text-[#d84d37] ring-[rgba(216,77,55,.22)]",
  alternative: "bg-[#eef4ff] text-[#2f5bbd] ring-[rgba(47,91,189,.2)]",
  lead: "bg-[#111] text-white ring-[rgba(17,17,17,.25)]",
  offer: "bg-[#eef7f0] text-[#2f7d4f] ring-[rgba(47,125,79,.22)]",
  bid: "bg-[#fdf4e3] text-[#8a5a12] ring-[rgba(138,90,18,.2)]",
}

/** Matches the animation length, so a node is gone before it could pile up. */
const LIFETIME_MS = 1650

/**
 * Queue of short-lived floating labels.
 *
 * The cap exists because several real events can land at once and a card should
 * never become a wall of text.
 */
export function useFloatingEvents(max = 3) {
  const [events, setEvents] = useState<FloatingEvent[]>([])
  const nextId = useRef(0)

  const spawn = useCallback((text: string, tone: FloatingTone = "pain") => {
    const id = (nextId.current += 1)
    const random = (spread: number) => Math.round((Math.random() * 2 - 1) * spread)
    setEvents((current) => [
      ...current.slice(-(max - 1)),
      { id, text, tone, drift: random(20), offset: random(14), lift: Math.round(Math.random() * 10) },
    ])
    setTimeout(() => setEvents((current) => current.filter((event) => event.id !== id)), LIFETIME_MS)
  }, [max])

  return { events, spawn }
}

/**
 * Renders floating labels above an anchor.
 *
 * Each label is positioned absolutely and animates alone. They used to sit in a
 * flex column, which meant a second spawn pushed the first down and a removal
 * made the survivors jump - the movement read as the labels swapping places
 * rather than each one rising from where it was born.
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

  // The anchor wrapper carries the placement; the label inside carries the
  // animation, so centring never fights the animated transform.
  const anchor = align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2"

  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full z-30 block h-0">
      {events.map((event) => (
        <span
          key={event.id}
          className={`absolute bottom-0 ${anchor}`}
          style={{ marginLeft: `${event.offset}px`, marginBottom: `${event.lift + 4}px` }}
        >
          <span
            style={{ ["--fx-drift" as string]: `${event.drift}px` }}
            className={`fx-float block whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.1em] ring-1 ring-inset ${TONE[event.tone]}`}
          >
            {event.text}
          </span>
        </span>
      ))}
    </span>
  )
}
