import { NextResponse } from "next/server"
import { createProblemSubscription } from "@/lib/marketplace/email"
import { createProblemSlug, getRequestIp, isKnownBot, normalizeProblemStatement } from "@/lib/marketplace/helpers"
import { diceSimilarity, jsonError, mutationAllowed } from "@/lib/marketplace/http"
import { checkMarketplaceRateLimit } from "@/lib/marketplace/rate-limit"
import { verifyTurnstile } from "@/lib/marketplace/turnstile"
import { tryGetVisitorKey } from "@/lib/marketplace/visitor"
import { getAuthenticatedUser } from "@/lib/marketplace/auth"
import { firstZodError, problemSchema } from "@/lib/marketplace/validation"
import { getProblemSummaries, invalidateProblemOrdering } from "@/lib/marketplace/queries"
import { createAdminClient } from "@/utils/supabase/admin"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const problems = await getProblemSummaries({ search: url.searchParams.get("q") || undefined, category: url.searchParams.get("category") || undefined })
  return NextResponse.json({ problems })
}

export async function POST(request: Request) {
  if (!mutationAllowed(request)) return jsonError("Invalid request origin.", 403)
  if (isKnownBot(request)) return jsonError("Automated submissions are not accepted.", 403)
  const user = await getAuthenticatedUser(request)
  if (!user) return jsonError("Sign in with your email before posting a problem.", 401)
  const ip = getRequestIp(request)
  const limit = await checkMarketplaceRateLimit(`problem:${ip}`, 5)
  if (!limit.allowed) return jsonError("You have submitted several problems. Try again later.", 429)
  const userLimit = await checkMarketplaceRateLimit(`problem-user:${user.id}`, 3)
  if (!userLimit.allowed) return jsonError("You have submitted several problems. Try again later.", 429)
  const submitterKey = await tryGetVisitorKey()
  if (submitterKey) {
    const perVisitor = await checkMarketplaceRateLimit(`problem-visitor:${submitterKey}`, 3)
    if (!perVisitor.allowed) return jsonError("You have submitted several problems. Try again later.", 429)
  }
  const parsed = problemSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return jsonError(firstZodError(parsed.error))
  if (parsed.data.website) return jsonError("This submission could not be accepted.")
  if (!await verifyTurnstile(parsed.data.turnstileToken, ip)) return jsonError("Bot verification failed. Refresh and try again.", 403)

  const normalized = normalizeProblemStatement(parsed.data.statement)
  const supabase = createAdminClient()
  const { data: existingRows } = await supabase.from("problems").select("id,slug,normalized_statement").in("status", ["published", "pending"]).limit(300)
  const duplicate = (existingRows || []).map((item) => ({ ...item, similarity: diceSimilarity(normalized, item.normalized_statement) })).sort((a, b) => b.similarity - a.similarity)[0]
  if (duplicate?.similarity >= 0.72) return NextResponse.json({ duplicate: true, slug: duplicate.slug, problemId: duplicate.id }, { status: 409 })

  // Authentication and bounded input/rate limits are the submission gate.
  // There is no paid model call or automated classifier in this path.
  const status = "published" as const
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const slug = createProblemSlug(parsed.data.statement)
    const { data: problem, error } = await supabase.from("problems").insert({
      slug, statement: parsed.data.statement, normalized_statement: normalized, category: parsed.data.category,
      origin: parsed.data.origin, submitted_by: user.id, status, published_at: new Date().toISOString(),
    }).select("id,slug").single()
    if (!error && problem) {
      if (status === "published" && parsed.data.origin === "user" && submitterKey) {
        // The poster's own support is implicit, but a missing cookie must not
        // discard a problem that was otherwise accepted.
        await supabase.rpc("support_problem", { p_problem_id: problem.id, p_visitor_key: submitterKey, p_detail: null, p_detail_status: "none" })
      }
      if (parsed.data.email) await createProblemSubscription(problem.id, parsed.data.email, new URL(request.url).origin).catch(console.error)
      invalidateProblemOrdering()
      return NextResponse.json({ ...problem, status }, { status: 201 })
    }
    if (error?.code !== "23505") { console.error("Problem insert failed", error); return jsonError("The problem could not be published.", 500) }
  }
  return jsonError("The problem could not be published.", 500)
}
