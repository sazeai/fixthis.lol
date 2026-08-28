export const SITE_NAME = "FIXTHIS"
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fixthis.lol").replace(/\/$/, "")
export const GOOGLE_SITE_VERIFICATION_TOKEN = "fQFM6X09kRkUJOVpu8xkamgQ3zC3o9qrh2ibjkpl6Mg"
// Both sides of the marketplace have to see themselves here. A shared link
// reaches complainers and SaaS founders alike, and the founders are the ones
// who pay - a title addressed only to the free side gives them no reason to
// read on.
export const SITE_TITLE = "FIXTHIS — Where software complaints turn into customers"
export const SITE_DESCRIPTION =
  "People call out the software failing them and pile on with ME TOO. Products bid once to appear as the alternative on the problems they solve."

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}

/**
 * The value advertisers filter on in their own analytics to find traffic we
 * sent them. Deliberately a literal rather than derived from SITE_URL: it is a
 * promise made to the people paying for the placement, so it must stay the
 * same string whatever environment the link was rendered in.
 */
export const SITE_REFERRAL_SOURCE = "fixthis.lol"
