"use client"

import { useEffect, useRef, useState } from "react"

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  remove: (id: string) => void
  reset: (id?: string) => void
}

declare global {
  interface Window { turnstile?: TurnstileApi }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
let scriptPromise: Promise<void> | null = null

/**
 * Load the Turnstile API once per page, explicitly.
 *
 * We cannot use next/script here: every widget lives inside a modal that is
 * portalled into document.body and mounts long after the window load event, so
 * a lazily-injected script never arrives and Cloudflare's implicit scan never
 * sees the container. Explicit rendering is the supported path for widgets that
 * appear after load.
 */
function loadTurnstile(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.turnstile) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve())
      existing.addEventListener("error", () => reject(new Error("Turnstile script failed")))
      return
    }
    const script = document.createElement("script")
    script.src = SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => { scriptPromise = null; reject(new Error("Turnstile script failed")) }
    document.head.appendChild(script)
  })
  return scriptPromise
}

export function TurnstileField() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const ref = useRef<HTMLDivElement>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!siteKey) return
    let widgetId: string | undefined
    let cancelled = false

    loadTurnstile()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return
        // Strict mode mounts effects twice in development; rendering into an
        // already-populated container throws, so clear it first.
        ref.current.innerHTML = ""
        widgetId = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme: "light",
          size: "flexible",
          "error-callback": () => setFailed(true),
        })
      })
      .catch(() => { if (!cancelled) setFailed(true) })

    return () => {
      cancelled = true
      if (widgetId && window.turnstile) {
        try { window.turnstile.remove(widgetId) } catch { /* already torn down */ }
      }
    }
  }, [siteKey])

  // No key configured: render nothing, and the server bypasses verification
  // outside production.
  if (!siteKey) return null

  return (
    <div>
      <div ref={ref} />
      {failed ? (
        <p className="mt-2 text-[11px] leading-5 text-[#d84d37]">
          Bot verification could not load. Disable any blocker for challenges.cloudflare.com and retry.
        </p>
      ) : null}
    </div>
  )
}
