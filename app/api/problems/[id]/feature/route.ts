import { NextResponse } from "next/server"
import { isKnownBot, withReferralTag } from "@/lib/marketplace/helpers"
import { jsonError } from "@/lib/marketplace/http"
import { tryGetVisitorKey } from "@/lib/marketplace/visitor"
import { createAdminClient } from "@/utils/supabase/admin"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (isKnownBot(request)) return NextResponse.json({ placement: null })
  const { id } = await params
  const visitorKey = await tryGetVisitorKey()
  // No anonymous identity means we cannot hold a stable 30-minute assignment,
  // so serve nothing rather than an unattributable impression.
  if (!visitorKey) return NextResponse.json({ placement: null })
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("assign_featured_placement", { p_problem_id: id, p_visitor_key: visitorKey })
  if (error) { console.error("Placement assignment failed", error); return jsonError("Featured solution unavailable.", 500) }
  const placement = data?.[0]
  if (!placement) return NextResponse.json({ placement: null })

  // Read separately rather than widening assign_featured_placement's return
  // table, which would mean migrating a function that runs for every in-view
  // card. A null hook just means this advertiser has not set one.
  const { data: hook } = await supabase.from("placements").select("event_text").eq("id", placement.placement_id).maybeSingle()
  // Tagged here rather than at the anchor: every outbound link to this
  // advertiser is rendered from this one response, so the advertiser's
  // analytics cannot see a click from us that arrived unattributed.
  return NextResponse.json({
    placement: {
      ...placement,
      destination_url: withReferralTag(placement.destination_url),
      offer: hook?.event_text ?? null,
    },
  })
}
