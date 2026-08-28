"use client"

import { useEffect, useState } from "react"

/**
 * Ask once per page which problems this visitor has already supported.
 *
 * Every SupportProblem on the page registers its own id, and they are collected
 * across a microtask into a single request — a 36-card board asks once, a detail
 * page asks once for its one id. Without this the button always came back idle
 * after a reload, which made an already-counted vote look like it never landed
 * and invited the visitor to press again.
 *
 * Deliberately server-answered. Nothing about the supported state is kept in
 * localStorage: the anonymous cookie is the only identity, and the database is
 * the only record of what it has voted on.
 */
let pending: string[] = []
let waiters: Array<() => void> = []
let resolved = new Set<string>()
let answered = new Set<string>()
let scheduled = false

async function flush() {
  scheduled = false
  const ids = Array.from(new Set(pending))
  pending = []
  const wake = waiters
  waiters = []
  try {
    const response = await fetch("/api/problems/support-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ problemIds: ids }),
    })
    const result = await response.json()
    for (const id of result.supportedProblemIds || []) resolved.add(id)
  } catch {
    // A failed lookup leaves the button idle. Pressing again is harmless: the
    // unique constraint refuses the duplicate and the count does not move.
  }
  for (const id of ids) answered.add(id)
  for (const notify of wake) notify()
}

// A microtask is too eager: the board's cards do not all mount in one commit, so
// flushing at the end of the first one split a single board into five requests.
// A short timer collects every card that mounts in the same frame or two. The
// delay is invisible — it only postpones turning an already-counted button from
// idle to counted on first paint.
const BATCH_WINDOW_MS = 50

function request(id: string, notify: () => void) {
  if (answered.has(id)) { notify(); return }
  pending.push(id)
  waiters.push(notify)
  if (!scheduled) { scheduled = true; setTimeout(flush, BATCH_WINDOW_MS) }
}

export function useSupportStatus(problemId: string, initialSupported = false) {
  const [supported, setSupported] = useState(initialSupported)

  useEffect(() => {
    if (initialSupported) return
    let live = true
    request(problemId, () => { if (live && resolved.has(problemId)) setSupported(true) })
    return () => { live = false }
  }, [problemId, initialSupported])

  return [supported, setSupported] as const
}

/** Test seam: forget everything learned so far. */
export function resetSupportStatusCache() {
  pending = []; waiters = []; resolved = new Set(); answered = new Set(); scheduled = false
}
