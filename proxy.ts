import { randomBytes } from "crypto"
import { NextResponse, type NextRequest } from "next/server"

const VISITOR_COOKIE = "fixthis_visitor"

/**
 * A request that should be allowed to create a visitor identity.
 *
 * Only top-level navigations mint. Previously any cookie-less request did —
 * including every API call — so a first page load fired several in parallel,
 * each minted a different id, each set it on its own response, and the last one
 * to land won in the browser. The losers had already been counted, which is how
 * a handful of browsers produced 23 "unique" visitors in a day.
 *
 * A sub-resource arriving without the cookie is simply not counted, which is
 * the correct outcome: it cannot be attributed to anyone.
 */
function isNavigation(request: NextRequest) {
  const dest = request.headers.get("sec-fetch-dest")
  if (dest) return dest === "document"
  // Older clients omit Sec-Fetch-Dest; fall back to what they asked for.
  return request.method === "GET" && (request.headers.get("accept") || "").includes("text/html")
}

export function proxy(request: NextRequest) {
  const response = NextResponse.next()

  if (!request.cookies.get(VISITOR_COOKIE)?.value && isNavigation(request)) {
    response.cookies.set(VISITOR_COOKIE, randomBytes(24).toString("base64url"), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
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
