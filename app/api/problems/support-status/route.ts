import { NextResponse } from "next/server"
import { z } from "zod"
import { tryGetVisitorKey } from "@/lib/marketplace/visitor"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"
// Per-visitor state: it must never be cached or shared between browsers.
export const dynamic = "force-dynamic"

const schema = z.object({ problemIds: z.array(z.string().uuid()).max(200) })

/**
 * Which of these problems has this visitor already supported?
 *
 * One request for a whole board rather than one per card. It reads the caller's
 * own anonymous key and nothing else, and a visitor without a cookie simply has
 * supported nothing — it never mints an identity just to answer the question,
 * which would hand out a token to crawlers and inflate the visitor count.
 */
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success || parsed.data.problemIds.length === 0) return NextResponse.json({ supportedProblemIds: [] })

  const visitorKey = await tryGetVisitorKey()
  if (!visitorKey) return NextResponse.json({ supportedProblemIds: [] })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("problem_supports")
    .select("problem_id")
    .eq("visitor_key", visitorKey)
    .in("problem_id", parsed.data.problemIds)
  if (error) {
    console.error("Support status lookup failed", error)
    return NextResponse.json({ supportedProblemIds: [] })
  }

  return NextResponse.json({ supportedProblemIds: (data || []).map((row: { problem_id: string }) => row.problem_id) })
}
