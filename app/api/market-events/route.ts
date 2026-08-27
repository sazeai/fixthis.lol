import { NextResponse } from "next/server"
import { isKnownBot } from "@/lib/marketplace/helpers"
import { createAdminClient } from "@/utils/supabase/admin"

export const dynamic = "force-dynamic"

/**
 * Recent marketplace events for the floating UI.
 *
 * Only real, meaningful moments — a product entering a problem, a bid, a change
 * of leader, an updated hook. Nothing is fabricated, and impressions are
 * deliberately absent: this must stay small enough to poll.
 *
 * Consumers must not present these as happening "just now"; they are recent
 * history being replayed, and the timestamp is returned so they can tell.
 */
export async function GET(request: Request) {
  if (isKnownBot(request)) return NextResponse.json({ events: [] })

  const url = new URL(request.url)
  const problemId = url.searchParams.get("problemId")
  const since = url.searchParams.get("since")

  let query = createAdminClient()
    .from("market_events")
    .select("id,problem_id,placement_id,type,text,created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  if (problemId) query = query.eq("problem_id", problemId)
  // Only replay the recent past; older events are atmosphere, not news.
  query = query.gte("created_at", since || new Date(Date.now() - 6 * 3_600_000).toISOString())

  const { data, error } = await query
  if (error) {
    console.error("Market events query failed", error)
    return NextResponse.json({ events: [] })
  }
  return NextResponse.json({ events: data || [] })
}
