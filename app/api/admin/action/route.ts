import { NextResponse } from "next/server"
import { z } from "zod"
import { isAdminAuthenticated } from "@/lib/marketplace/admin-auth"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { createAdminClient } from "@/utils/supabase/admin"

const schema = z.object({ entity: z.enum(["problem", "offer", "complaint"]), id: z.string().uuid(), action: z.enum(["hide", "publish", "suspend", "restore"]) })
export async function POST(request: Request) {
  if (!await isAdminAuthenticated()) return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  const supabase = createAdminClient(); const { entity, id, action } = parsed.data
  let error: any = null
  if (entity === "complaint") {
    // A complaint detail is one moderated sentence attached to a support row.
    const detailStatus = action === "publish" || action === "restore" ? "published" : "hidden"
    ;({ error } = await supabase.from("problem_supports").update({ detail_status: detailStatus, updated_at: new Date().toISOString() }).eq("id", id))
  } else if (entity === "problem") {
    const status = action === "publish" || action === "restore" ? "published" : "hidden"
    ;({ error } = await supabase.from("problems").update({ status, published_at: status === "published" ? new Date().toISOString() : undefined }).eq("id", id))
  } else {
    // Nothing to rebuild: an answer's visibility is its own status, not a
    // position in a rotation that has to be recomputed for everyone else.
    const status = action === "restore" || action === "publish" ? "active" : action === "suspend" ? "suspended" : "hidden"
    ;({ error } = await supabase.from("offers").update({ status }).eq("id", id))
  }
  if (error) return NextResponse.json({ error: "Admin action failed." }, { status: 500 })
  await supabase.from("moderation_audit").insert({ entity_type: entity, entity_id: id, action })
  invalidateProblemOrdering()
  return NextResponse.json({ ok: true })
}
