export const SITE_NAME = "FIXTHIS"
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fixthis.lol").replace(/\/$/, "")
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
