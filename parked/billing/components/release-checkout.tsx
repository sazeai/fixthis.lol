"use client"

import { useEffect, useRef } from "react"

/**
 * Releases the hold on a checkout the founder backed out of.
 *
 * Dodo returns them to the problem page through cancel_url carrying their own
 * quote id. The hold no longer moves anyone's price, so this is housekeeping
 * rather than a correction — it stops an abandoned attempt lingering in
 * bid_quotes until its fifteen minutes run out.
 *
 * Fire and forget, and guarded against a second run in strict mode. A release
 * that fails changes nothing: the quote expires on its own, and paying after
 * the release still settles.
 */
export function ReleaseCheckout({ quoteId }: { quoteId: string }) {
  const sent = useRef(false)

  useEffect(() => {
    if (!quoteId || sent.current) return
    sent.current = true
    fetch(`/api/bids/${encodeURIComponent(quoteId)}/release`, { method: "POST" }).catch(() => {})
  }, [quoteId])

  return null
}
