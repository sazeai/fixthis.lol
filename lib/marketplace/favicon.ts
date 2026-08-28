import "server-only"

/**
 * Server-side favicon fetching.
 *
 * Runs once per advertiser, not per page view, and never from the visitor's
 * browser — no third-party icon service sees who is browsing which problem.
 *
 * Small icons are rejected rather than stored: a 16px ICO upscaled to 22px in
 * the card looks worse than a clean monogram, so the caller falls back.
 */

const MAX_BYTES = 100_000
const MIN_WIDTH = 32
const TIMEOUT_MS = 6_000

export type FetchedIcon = { base64: string; contentType: string; width: number }

const ICON_REL = /^(icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)$/i

async function get(url: string, accept: string) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: { accept, "user-agent": "FIXTHIS-icon-fetcher/1.0 (+https://fixthis.lol)" },
      cache: "no-store",
    })
  } finally {
    clearTimeout(timer)
  }
}

/** Candidate icon URLs, best first: declared in the HTML, then the conventional path. */
async function candidateUrls(origin: string): Promise<string[]> {
  const urls: string[] = []
  try {
    const response = await get(origin, "text/html")
    if (response.ok) {
      const html = (await response.text()).slice(0, 200_000)
      for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
        const tag = match[0]
        const rel = /\brel\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.trim()
        const href = /\bhref\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1]?.trim()
        if (!rel || !href || !ICON_REL.test(rel)) continue
        try { urls.push(new URL(href, origin).toString()) } catch { /* skip unresolvable href */ }
      }
    }
  } catch { /* homepage unreachable; fall through to the conventional path */ }
  urls.push(new URL("/favicon.ico", origin).toString())
  // Prefer larger declared icons; apple-touch-icon is usually 180px.
  return [...new Set(urls)].sort((a, b) => Number(/apple-touch/i.test(b)) - Number(/apple-touch/i.test(a)))
}

/**
 * Pixel width without an image library. Enough formats to make a good/bad call;
 * anything unrecognised is accepted at face value rather than discarded.
 */
function readWidth(bytes: Buffer, contentType: string): number {
  if (contentType.includes("svg")) {
    const head = bytes.subarray(0, 2048).toString("utf8")
    const viewBox = /viewBox\s*=\s*["'][\d.\-\s]*?\s([\d.]+)\s+[\d.]+\s*["']/i.exec(head)
    if (viewBox) return Math.round(Number(viewBox[1])) || 64
    return 64 // scalable: always fine at 22px
  }
  // PNG: width is a big-endian uint32 at byte 16, after the IHDR marker.
  if (bytes.length > 24 && bytes[0] === 0x89 && bytes.toString("ascii", 1, 4) === "PNG") {
    return bytes.readUInt32BE(16)
  }
  // ICO: byte 6 is the width of the first image; 0 means 256.
  if (bytes.length > 6 && bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0x01) {
    return bytes[6] === 0 ? 256 : bytes[6]
  }
  // GIF: little-endian uint16 at byte 6.
  if (bytes.length > 8 && bytes.toString("ascii", 0, 3) === "GIF") return bytes.readUInt16LE(6)
  return MIN_WIDTH // unknown format: do not reject on a guess
}

/**
 * Fetch the best usable icon for a registrable domain.
 * Returns null when nothing suitable exists — the caller renders a monogram.
 */
export async function fetchProductIcon(registrableDomain: string, budgetMs = 20_000): Promise<FetchedIcon | null> {
  const deadline = Date.now() + budgetMs
  // https only, and the domain has already passed normalizeProductUrl's public
  // registrable-domain check before an answer can exist.
  const origin = `https://${registrableDomain}`
  let candidates: string[]
  try { candidates = await candidateUrls(origin) } catch { return null }

  for (const url of candidates) {
    // Serving a card must never wait indefinitely on someone else's host.
    if (Date.now() > deadline) break
    try {
      const response = await get(url, "image/*")
      if (!response.ok) continue

      const contentType = (response.headers.get("content-type") || "").split(";")[0]!.trim().toLowerCase()
      if (!contentType.startsWith("image/")) continue

      const declared = Number(response.headers.get("content-length") || 0)
      if (declared > MAX_BYTES) continue

      const bytes = Buffer.from(await response.arrayBuffer())
      if (!bytes.length || bytes.length > MAX_BYTES) continue

      const width = readWidth(bytes, contentType)
      if (width < MIN_WIDTH) continue

      return { base64: bytes.toString("base64"), contentType, width }
    } catch { /* try the next candidate */ }
  }
  return null
}

/**
 * Fetch and store an icon for one product. Records the attempt either way so a
 * domain with no usable icon is not refetched on every settlement.
 */
export async function refreshProductIcon(
  supabase: { from: (table: string) => any },
  productId: string,
  registrableDomain: string,
  budgetMs?: number,
) {
  const icon = await fetchProductIcon(registrableDomain, budgetMs).catch(() => null)
  const now = new Date().toISOString()
  const patch = icon
    ? { icon_base64: icon.base64, icon_content_type: icon.contentType, icon_width: icon.width, icon_fetched_at: now, icon_attempted_at: now }
    : { icon_attempted_at: now }
  await supabase.from("products").update(patch).eq("id", productId)
  return icon
}
