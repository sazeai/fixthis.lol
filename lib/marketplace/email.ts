import "server-only"

import { randomBytes } from "crypto"
import { EMAIL_FROM, EMAIL_REPLY_TO, resend } from "@/lib/emails/client"
import { getAppUrl, sha256 } from "@/lib/marketplace/helpers"
import { createAdminClient } from "@/utils/supabase/admin"

/**
 * Send one transactional email.
 *
 * The Resend SDK resolves with `{ data, error }` rather than throwing, so an
 * unverified sending domain comes back as a quiet 403 that looks exactly like
 * success. Every failure is logged with its real reason and rethrown, so a
 * caller can decide whether it matters.
 */
async function send(payload: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) { console.warn(`Email skipped, no RESEND_API_KEY: ${payload.subject}`); return }

  const { data, error } = await resend.emails.send({ from: EMAIL_FROM, replyTo: EMAIL_REPLY_TO, ...payload })
  if (error) {
    console.error("Email send failed", { to: payload.to, subject: payload.subject, from: EMAIL_FROM, error })
    throw new Error(`Resend rejected the message: ${error.message || error.name || "unknown error"}`)
  }
  console.info("Email sent", { id: data?.id, to: payload.to, subject: payload.subject })
  return data
}

export async function createProblemSubscription(problemId: string, email: string, appUrl = getAppUrl()) {
  const token = randomBytes(32).toString("base64url")
  const supabase = createAdminClient()
  const { error } = await supabase.from("problem_subscriptions").upsert({
    problem_id: problemId, email: email.toLowerCase(), verification_token_hash: sha256(token), verified_at: null,
  }, { onConflict: "problem_id,email" })
  if (error) throw error
  await send({
    to: email,
    subject: "Confirm your FIXTHIS.LOL alert",
    html: `<p>Confirm that you want an email when an alternative answers this problem.</p><p><a href="${appUrl}/api/subscriptions/verify?token=${encodeURIComponent(token)}">Confirm alert</a></p><p>If you did not request this, ignore this email.</p>`,
  })
}

export async function sendManagementLink(email: string, token: string, productName: string, appUrl = getAppUrl()) {
  await send({
    to: email,
    subject: `Manage ${productName} on FIXTHIS.LOL`,
    // The token was minted, passed in, and then dropped: this href used to be
    // `${appUrl}/manage/`, so every one of these emails landed the founder on
    // the "lost your link?" page and the console was unreachable by email.
    html: `<p>Use this private link to edit your product or see how your answers are doing.</p><p><a href="${appUrl}/manage/${encodeURIComponent(token)}">Manage ${productName}</a></p><p>This link expires in 30 days. Do not forward it.</p>`,
  })
}

export async function notifyProblemSubscribers(problemId: string, statement: string, productName: string, slug: string, appUrl = getAppUrl()) {
  const supabase = createAdminClient()
  const { data } = await supabase.from("problem_subscriptions").select("id,email").eq("problem_id", problemId).not("verified_at", "is", null).is("notified_at", null)
  for (const subscriber of data || []) {
    try {
      await send({ to: subscriber.email, subject: `${productName} answered a problem you follow`, html: `<p>${productName} says it can fix:</p><blockquote>${statement}</blockquote><p><a href="${appUrl}/problems/${slug}">Read their answer</a></p>` })
      await supabase.from("problem_subscriptions").update({ notified_at: new Date().toISOString() }).eq("id", subscriber.id)
    } catch (error) { console.error("Problem subscriber notification failed", error) }
  }
}
