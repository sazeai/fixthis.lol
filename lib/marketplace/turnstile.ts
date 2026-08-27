import "server-only"

/**
 * Verify a Cloudflare Turnstile token.
 *
 * With no secret configured this bypasses in development and refuses in
 * production, so a half-configured deploy fails closed rather than silently
 * accepting every submission.
 */
export async function verifyTurnstile(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("Turnstile: TURNSTILE_SECRET_KEY is not set; refusing submission")
      return false
    }
    return true
  }

  // Outside production a missing or failing token is almost always the widget
  // refusing to load — most often because localhost is not in the sitekey's
  // allowed-domains list in the Cloudflare dashboard. Warn loudly but let local
  // work continue; production stays strict.
  const lenient = process.env.NODE_ENV !== "production" && process.env.TURNSTILE_ENFORCE_IN_DEV !== "true"

  if (!token) {
    console.warn("Turnstile: no token submitted — the widget did not render or was not solved")
    if (lenient) {
      console.warn("Turnstile: allowing in development. Add localhost to the sitekey's allowed domains to test it properly, or set TURNSTILE_ENFORCE_IN_DEV=true.")
      return true
    }
    return false
  }

  const body = new URLSearchParams({ secret, response: token })
  // Cloudflare ignores an unparseable remoteip, but there is no reason to send
  // our placeholder for a request whose IP we could not determine.
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp)

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      cache: "no-store",
    })
    if (!response.ok) {
      console.error("Turnstile: siteverify HTTP", response.status)
      return false
    }
    const result = await response.json() as { success?: boolean; "error-codes"?: string[] }
    if (result.success !== true) {
      console.warn("Turnstile: rejected", result["error-codes"] ?? [])
      return lenient
    }
    return true
  } catch (error) {
    console.error("Turnstile: siteverify request failed", error)
    return lenient
  }
}
