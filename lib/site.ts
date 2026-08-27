export const SITE_NAME = "FIXTHIS"
export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || "https://fixthis.lol").replace(/\/$/, "")
export const SITE_TITLE = "FIXTHIS — Find real problems worth solving"
export const SITE_DESCRIPTION =
  "A public problem marketplace where people post pain points, validate demand, and products compete to become the featured solution."

export function absoluteUrl(path = "/") {
  return new URL(path, `${SITE_URL}/`).toString()
}
