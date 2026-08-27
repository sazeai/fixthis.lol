import { NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"
import { isAdminAuthenticated } from "@/lib/marketplace/admin-auth"
import { refreshProductIcon } from "@/lib/marketplace/favicon"
import { createAdminClient } from "@/utils/supabase/admin"

export const runtime = "nodejs"

function hasCronSecret(request: Request) {
  const configured = process.env.MAINTENANCE_CRON_SECRET
  if (!configured) return false
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || ""
  const a = Buffer.from(supplied)
  const b = Buffer.from(configured)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Retention sweep. Callable either by a signed-in admin or by a scheduler
 * presenting MAINTENANCE_CRON_SECRET. Idempotent, so a missed run is harmless.
 */
export async function POST(request: Request) {
  if (!hasCronSecret(request) && !await isAdminAuthenticated()) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }
  const { data, error } = await createAdminClient().rpc("purge_expired_traffic")
  if (error) {
    console.error("FIXTHIS retention sweep failed", error)
    return NextResponse.json({ error: "Retention sweep failed." }, { status: 500 })
  }
  const result = data?.[0] || {}

  // Backfill icons for advertisers that predate icon support, a few per sweep
  // so one run cannot stall on a batch of slow hosts.
  const supabase = createAdminClient()
  const { data: pending } = await supabase
    .from("products").select("id,registrable_domain")
    .is("icon_attempted_at", null).eq("status", "active").limit(5)
  let iconsFetched = 0
  for (const product of pending || []) {
    const icon = await refreshProductIcon(supabase, product.id, product.registrable_domain).catch(() => null)
    if (icon) iconsFetched += 1
  }

  console.info("FIXTHIS retention sweep", { ...result, iconsFetched })
  return NextResponse.json({ ok: true, ...result, iconsFetched })
}
