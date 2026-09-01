export const SITE_NAME = "FIXTHIS"
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fixthis.lol").replace(/\/$/, "")
export const GOOGLE_SITE_VERIFICATION_TOKEN = "fQFM6X09kRkUJOVpu8xkamgQ3zC3o9qrh2ibjkpl6Mg"
// Both sides of the marketplace have to see themselves here. A shared link
// reaches complainers and SaaS founders alike, and the founders are the ones
// who pay - a title addressed only to the free side gives them no reason to
// read on.
export const SITE_TITLE = "FIXTHIS — What sucks about the software you use"
export const SITE_DESCRIPTION =
  "Post what sucks about the software you use. Competing SaaS products respond with how they’d fix it and what they’ll offer to make you switch."

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}

/**
 * The value a product filters on in its own analytics to find traffic we sent
 * it. Deliberately a literal rather than derived from SITE_URL, so the string
 * stays the same whatever environment the link was rendered in.
 */
export const SITE_REFERRAL_SOURCE = "fixthis.lol"
