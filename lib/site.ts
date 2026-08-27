export const SITE_NAME = "FIXTHIS"
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fixthis.lol").replace(/\/$/, "")
export const SITE_TITLE = "FIXTHIS — Call out the software that's failing you"
export const SITE_DESCRIPTION =
  "Name the software that is failing you and what would make you switch. Others pile on with ME TOO, and the alternatives bid to win you over."

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}
