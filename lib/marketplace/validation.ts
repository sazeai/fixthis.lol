import { z } from "zod"
import { PROBLEM_CATEGORIES } from "@/lib/marketplace/helpers"

const email = z.string().trim().email("Enter a valid email address.").max(254)
const honeypot = z.string().max(0).optional().default("")

export const problemSchema = z.object({
  /** The software being complained about, e.g. "Intercom". */
  targetProductName: z.string().trim().min(1, "Name the software this is about.").max(60),
  statement: z.string().trim().min(20, "Say a bit more about what is wrong.").max(280),
  /** What would win them over. Optional, and the closest thing to a brief for advertisers. */
  switchCondition: z.string().trim().max(160).optional().default("")
    .refine((value) => !value || value.length >= 3, "Add a little more detail."),
  // Category is no longer asked for: it is inferred server-side and can be
  // corrected in admin. One less field between a person and their complaint.
  category: z.enum(PROBLEM_CATEGORIES).optional(),
  origin: z.enum(["user", "founder"]).default("user"),
  email: z.union([email, z.literal("")]).optional().default(""),
  turnstileToken: z.string().optional().default(""),
  website: honeypot,
})

export const supportSchema = z.object({
  detail: z.string().trim().max(280).optional().default("").refine((value) => !value || value.length >= 3, "Add a little more detail."),
  email: z.union([email, z.literal("")]).optional().default(""),
  turnstileToken: z.string().optional().default(""),
  website: honeypot,
})

export const bidSchema = z.object({
  problemId: z.string().uuid(),
  productName: z.string().trim().min(1).max(80),
  productTagline: z.string().trim().min(3).max(180),
  destinationUrl: z.string().trim().url().max(2048),
  /**
   * Short competitive hook, fired as a floating event rather than printed on
   * the card. Kept apart from the tagline so it cannot become permanent
   * coupon text sitting over the placement.
   */
  eventText: z.string().trim().max(60).optional().default("")
    .refine((value) => !value || value.length >= 3, "Make it a few characters longer."),
  email,
  amountCents: z.coerce.number().int().min(500).max(10_000_000),
  turnstileToken: z.string().optional().default(""),
  website: honeypot,
})

export const productEditSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().min(3).max(180),
  destinationUrl: z.string().trim().url().max(2048),
})

export function firstZodError(error: z.ZodError) { return error.issues[0]?.message || "Check the form and try again." }

const CONTACT = /https?:\/\/|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|\+?\d[\d\s().-]{8,}\d/i
const MARKUP = /<[a-z][^>]*>|\{\{|\}\}/i
// Word-bounded on purpose: an unbounded /rape/ also matches "grape" and "therapy".
const ABUSE = /\b(kill yourself|kys|rape|die in a fire)\b/i
// Backreference, not a quantifier: the SAME character eight or more times.
// Without the \1 this would match any run of characters and reject everything.
const CHARACTER_RUN = /(.)\1{7,}/i

/**
 * Content rules for a submitted problem statement.
 *
 * Authentication is the real gate — this is only the free, deterministic pass
 * that catches what a regex genuinely can: contact details, markup, explicit
 * abuse, and keyboard mash. No model call, no cost, no queue. Anything subtler
 * than this is left to reporting and the admin table.
 *
 * Returns an error message, or null when the statement is acceptable.
 */
export function checkProblemStatement(statement: string): string | null {
  if (CONTACT.test(statement)) return "Links, emails and phone numbers are not allowed in a problem."
  if (MARKUP.test(statement)) return "Remove markup and template syntax from your problem."
  if (ABUSE.test(statement)) return "This wording is not acceptable here."

  const letters = statement.replace(/[^a-z]/gi, "")
  if (letters.length >= 12) {
    // Real prose runs about a third vowels; keyboard mash sits far below.
    const vowels = (letters.match(/[aeiou]/gi) || []).length
    if (vowels / letters.length < 0.18) return "Write the problem as a real sentence."
    if (CHARACTER_RUN.test(statement)) return "Write the problem as a real sentence."
    // A few words repeated to pad out the length.
    const words = statement.toLowerCase().split(/\s+/).filter(Boolean)
    if (words.length >= 8 && new Set(words).size / words.length < 0.35) {
      return "Write the problem as a real sentence."
    }
  }
  return null
}

/** Quick screen for the optional one-sentence complaint detail. */
export function assessUserContent(value: string) {
  if (/https?:\/\/|www\.|\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(value)) return { safe: false, reason: "Links and contact details are not allowed." }
  const promotional = /\b(best|number one|#1|leading|buy now|sign up|use my|my product|guaranteed)\b/i.test(value)
  const dangerous = /\b(kill yourself|kys|rape|terrorist threat)\b/i.test(value)
  if (dangerous) return { safe: false, reason: "This content requires moderation." }
  return { safe: !promotional, reason: promotional ? "Promotional language requires moderation." : null }
}
