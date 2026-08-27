import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

export const alt = "FIXTHIS — where software complaints turn into customers"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const INK = "#111111"
const PAPER = "#fafafa"
const MUTED = "#8a857e"
const ACCENT = "#ef4e37"
const HAIRLINE = "rgba(55,50,47,0.12)"

/** The diagonal rail that runs down both edges of every page on the site. */
const HATCH =
  "repeating-linear-gradient(45deg, rgba(55,50,47,0.10) 0px, rgba(55,50,47,0.10) 1px, transparent 1px, transparent 9px)"

const STEPS = ["Call it out", "People pile on", "Alternatives fight"]

/**
 * The site's own card, rather than a screenshot of it.
 *
 * What this replaces was a capture of the landing page, so it froze whatever
 * the board happened to say that day - a headline, a section title and three
 * stat labels that have all since changed - at 1412x809, which a feed crops,
 * and at a size where none of the card text could be read anyway. This is
 * built from the same tokens as the pages, so it keeps up with them, and it
 * carries one question big enough to read as a thumbnail.
 *
 * Clash Display stands in for Oxanium here: Oxanium ships as a variable font
 * and satori cannot parse those, so generating with it fails the build.
 */
export default async function OpenGraphImage() {
  const fonts = join(process.cwd(), "public", "fonts")
  const [display, body, logo] = await Promise.all([
    readFile(join(fonts, "ClashDisplay-Semibold.ttf")),
    readFile(join(fonts, "Inter.ttf")),
    readFile(join(process.cwd(), "public", "fixthis-logo.png")),
  ])
  const logoUri = `data:image/png;base64,${logo.toString("base64")}`

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: PAPER }}>
        <div style={{ display: "flex", width: 52, height: "100%", backgroundImage: HATCH, borderRight: `1px solid ${HAIRLINE}` }} />

        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: "52px 60px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUri} width={66} height={66} alt="" style={{ marginLeft: -13, marginRight: -7 }} />
            <div style={{ display: "flex", fontFamily: "Clash", fontSize: 28, letterSpacing: "-0.4px", color: INK }}>FIXTHIS</div>
            <div style={{ display: "flex", fontFamily: "Inter", fontSize: 15, letterSpacing: "2.4px", color: MUTED }}>PROBLEM MARKETPLACE</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontFamily: "Clash", fontSize: 86, letterSpacing: "-0.5px", lineHeight: 1.02, color: INK }}>
              What software is
            </div>
            <div style={{ display: "flex", fontFamily: "Clash", fontSize: 86, letterSpacing: "-0.5px", lineHeight: 1.02, color: INK }}>
              pissing you off?
            </div>
            <div style={{ display: "flex", marginTop: 26, fontFamily: "Inter", fontSize: 26, lineHeight: 1.45, color: "#5a5750" }}>
              People call out the software failing them. The alternatives bid to win them over.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", width: "100%", height: 1, background: HAIRLINE }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
                {STEPS.map((step, index) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{ display: "flex", fontFamily: "Inter", fontSize: 14, letterSpacing: "1.4px", color: ACCENT }}>
                      {`0${index + 1}`}
                    </div>
                    <div style={{ display: "flex", fontFamily: "Inter", fontSize: 19, color: "#3d3a35" }}>{step}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", fontFamily: "Clash", fontSize: 22, color: MUTED }}>fixthis.lol</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", width: 52, height: "100%", backgroundImage: HATCH, borderLeft: `1px solid ${HAIRLINE}` }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Clash", data: display, style: "normal", weight: 600 },
        { name: "Inter", data: body, style: "normal", weight: 400 },
      ],
    },
  )
}
