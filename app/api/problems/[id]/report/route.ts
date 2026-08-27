import { NextResponse } from "next/server"
import { z } from "zod"
import { getRequestIp, isKnownBot } from "@/lib/marketplace/helpers"
import { jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { checkMarketplaceRateLimit } from "@/lib/marketplace/rate-limit"
import { verifyTurnstile } from "@/lib/marketplace/turnstile"
import { firstZodError } from "@/lib/marketplace/validation"
import { tryGetVisitorKey } from "@/lib/marketplace/visitor"
import { createAdminClient } from "@/utils/supabase/admin"

const schema = z.object({
  reason: z.enum(["spam", "advertising", "abusive", "nonsense", "other"]),
  detail: z.string().trim().max(280).optional().default(""),
  turnstileToken: z.string().optional().default(""),
  website: z.string().max(0).optional().default(""),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)
  if (isKnownBot(request)) return jsonError("Automated reports are not accepted.", 403)

  const { id } = await params
  const ip = getRequestIp(request)
  const limit = await checkMarketplaceRateLimit(`report:${ip}`, 20)
  if (!limit.allowed) return jsonError("Too many reports. Try again later.", 429)

  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(firstZodError(parsed.error))
  if (parsed.data.website) return NextResponse.json({ recorded: true })
  if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) return jsonError("Bot verification failed.", 403)

  // One report per visitor per problem is enforced on the anonymous key, so a
  // report without one cannot be deduped and is refused rather than counted.
  const visitorKey = await tryGetVisitorKey()
  if (!visitorKey) return jsonError("Enable cookies to report a problem.", 400)

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("report_problem", {
    p_problem_id: id,
    p_visitor_key: visitorKey,
    p_reason: parsed.data.reason,
    p_detail: parsed.data.detail || null,
  })
  if (error) {
    console.error("Report failed", error)
    return jsonError("Your report could not be recorded.", 500)
  }

  const result = data?.[0] || { recorded: false, hidden: false }
  if (result.hidden) invalidateProblemOrdering()
  // Never reveal the threshold or the running count — that is a map for gaming it.
  return NextResponse.json({ recorded: Boolean(result.recorded) })
}
