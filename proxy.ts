import { NextResponse, type NextRequest } from "next/server"

const VISITOR_COOKIE = "fixthis_visitor"

function generateVisitorToken(): string {
  const bytes = new Uint8Array(24)
  crypto.getRandomValues(bytes)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * A speculative load: the browser is fetching the page in case the user goes
 * there, not because they did.
 *
 * Chrome's speculation rules prerender a link the user merely hovered, and that
 * request arrives as a full `Sec-Fetch-Dest: document` navigation. Minting for
 * it created a whole visitor identity — presence heartbeat and all — for a page
 * the user may never open, and if they did open it the prerender's token then
 * replaced the cookie they already had. One browser could accumulate several
 * long-lived identities that way, and a ME TOO would attach to whichever one
 * the rendered page happened to be holding.
 *
 * A speculative load is still served normally; it just never mints. If the user
 * activates it, the next real navigation gives them a token.
 */
function isSpeculative(request: NextRequest) {
  const purpose = `${request.headers.get("sec-purpose") || ""} ${request.headers.get("purpose") || ""} ${request.headers.get("x-moz") || ""}`
  return /prefetch|prerender/i.test(purpose)
}

/**
 * A request that should be allowed to create a visitor identity.
 *
 * Only top-level navigations mint.
 */
function isNavigation(request: NextRequest) {
  if (isSpeculative(request)) return false
  const dest = request.headers.get("sec-fetch-dest")
  if (dest) return dest === "document"
  // Older clients omit Sec-Fetch-Dest; fall back to what they asked for.
  return request.method === "GET" && (request.headers.get("accept") || "").includes("text/html")
}

export function proxy(request: NextRequest) {
  const existing = request.cookies.get(VISITOR_COOKIE)?.value
  const minted = !existing && isNavigation(request) ? generateVisitorToken() : null

  // A freshly minted token is put back on the *request* as well, so the render
  // that follows sees the same identity the browser is about to store. Setting
  // it only on the response left the first page of a visit rendering as though
  // it had no visitor at all, because server components read request cookies.
  const requestHeaders = new Headers(request.headers)
  if (minted) {
    const cookie = requestHeaders.get("cookie")
    requestHeaders.set("cookie", cookie ? `${cookie}; ${VISITOR_COOKIE}=${minted}` : `${VISITOR_COOKIE}=${minted}`)
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  if (minted) {
    response.cookies.set(VISITOR_COOKIE, minted, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // One year, matching what the Privacy Policy states. Never widened to a
      // parent domain: the identity stays host-only.
      maxAge: 60 * 60 * 24 * 365,
    })
  }

  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)"] }
