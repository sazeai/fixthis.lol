"use client"

import { useState } from "react"

// Deterministic tint per product, so an advertiser's monogram is stable across
// renders and recognisable next to its competitors.
const TINTS = ["#3d6be5", "#c2410c", "#0f766e", "#6d28d9", "#b91c1c", "#0369a1", "#4d7c0f", "#a21caf"]

function tintFor(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0
  return TINTS[hash % TINTS.length]!
}

/**
 * A product's favicon, or a monogram when there is no usable one.
 *
 * Icons are served from our own origin, never a third-party favicon service —
 * that would leak every visitor's IP and browsing to a third party.
 */
export function ProductIcon({
  name,
  seed,
  iconUrl,
  size = 22,
  className = "",
}: {
  name: string
  /** Stable key for the monogram tint; the registrable domain works well. */
  seed: string
  iconUrl: string | null
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const letter = (name.trim()[0] || "?").toUpperCase()
  const radius = Math.max(3, Math.round(size * 0.22))

  const shared = {
    width: size,
    height: size,
    borderRadius: radius,
  }

  if (iconUrl && !failed) {
    return (
      <img
        src={iconUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        style={{ ...shared, objectFit: "contain", background: "#fff" }}
        className={`shrink-0 ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={{ ...shared, background: tintFor(seed || name), fontSize: Math.round(size * 0.52) }}
      className={`grid shrink-0 place-items-center font-semibold leading-none text-white ${className}`}
    >
      {letter}
    </span>
  )
}
