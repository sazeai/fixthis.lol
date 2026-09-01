import "server-only"
import { createHmac, randomBytes } from "crypto"
import { cookies } from "next/headers"
import { createAdminClient } from "@/utils/supabase/admin"

export const VISITOR_COOKIE = "fixthis_visitor"

/**
 * The one secret every anonymous identity is derived from.
 *
 * There is deliberately no fallback. It used to fall through to the service
 * role key and then the admin password, which meant rotating either of those —
 * or deploying to an environment that happened to have a different one — silently
 * reissued every visitor key and let the same browser vote again. The identity
 * must depend on exactly one value, and that value must be configured
 * explicitly. Changing it resets every anonymous identity.
 */
function visitorSecret() {
  const value = process.env.VISITOR_HASH_SECRET
  if (!value) throw new Error("VISITOR_HASH_SECRET is not configured")
  return value
}

export function hashVisitorToken(token: string) { return createHmac("sha256", visitorSecret()).update(token).digest("hex") }

export async function getVisitorKey() {
  const token = (await cookies()).get(VISITOR_COOKIE)?.value
  if (!token || token.length < 32) throw new Error("Anonymous visitor cookie is missing")
  return hashVisitorToken(token)
}

/**
 * Same as getVisitorKey but returns null instead of throwing when the browser
 * sent no visitor cookie — blocked cookies, a privacy mode, or a request that
 * raced the proxy. Callers decide whether that is fatal; for analytics it just
 * means "do not count this", which must never surface as a 500.
 */
export async function tryGetVisitorKey() {
  try { return await getVisitorKey() } catch { return null }
}
export function newVisitorToken() { return randomBytes(24).toString("base64url") }
export function dailyIpKey(ip: string) {
  const day = new Date().toISOString().slice(0, 10)
  return createHmac("sha256", visitorSecret()).update(`${day}:${ip}`).digest("hex")
}

export const VISITOR_SEEN_COOKIE = "fixthis_seen"

export async function recordVisitorActivity() {
  try {
    const cookieStore = await cookies()
    if (cookieStore.get(VISITOR_SEEN_COOKIE)) return

    const visitorKey = await tryGetVisitorKey()
    if (!visitorKey) return

    const supabase = createAdminClient()
    const now = new Date().toISOString()
    await supabase.from("visitors").upsert({
      visitor_key: visitorKey,
      last_seen_at: now,
    }, { onConflict: "visitor_key" })

    cookieStore.set(VISITOR_SEEN_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 15, // 15 minutes throttle window
    })
  } catch {
    // Visitor tracking should fail silently and never disrupt page loads
  }
}
