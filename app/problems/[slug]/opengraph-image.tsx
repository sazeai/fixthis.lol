import { ImageResponse } from "next/og"
import { getProblemBySlug } from "@/lib/marketplace/queries"

export const alt = "A problem on the FIXTHIS marketplace"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const problem = await getProblemBySlug(slug).catch(() => null)
  const statement = problem?.statement || "Call out the software that is failing you."
  const demand = problem ? `${problem.support_count} hit ME TOO` : "A public board of software complaints"
  const competition = problem ? `${problem.competitor_count} alternatives bidding` : "Pile on with ME TOO"

  return new ImageResponse(
    <div
      style={{
        background: "#fafafa",
        color: "#111111",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-between",
        padding: "64px 72px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 24, fontWeight: 700 }}>
        <span style={{ background: "#ff4f38", borderRadius: 999, display: "flex", height: 16, width: 16 }} />
        FIXTHIS
        <span style={{ color: "#8a857e", fontSize: 18, fontWeight: 400 }}>PROBLEM MARKETPLACE</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", fontSize: statement.length > 130 ? 48 : 58, fontWeight: 600, letterSpacing: "-2px", lineHeight: 1.08 }}>
          “{statement}”
        </div>
        <div style={{ display: "flex", gap: 16, color: "#625e58", fontSize: 22 }}>
          <span style={{ border: "1px solid #dedbd7", borderRadius: 999, padding: "10px 18px" }}>{demand}</span>
          <span style={{ border: "1px solid #dedbd7", borderRadius: 999, padding: "10px 18px" }}>{competition}</span>
        </div>
      </div>
      <div style={{ color: "#8a857e", display: "flex", fontSize: 18 }}>fixthis.lol</div>
    </div>,
    size,
  )
}
