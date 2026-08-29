"use client"

import { useCallback, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Loading03Icon } from "@hugeicons/core-free-icons"
import { useRouter } from "next/navigation"
import { FormField, TextArea, TextInput } from "@/components/marketplace/form-field"
import { MagicLinkAuth } from "@/components/marketplace/magic-link-auth"
import { ModalShell } from "@/components/marketplace/modal-shell"
import { TurnstileField } from "@/components/marketplace/turnstile-field"
import { useAccessToken, useSession } from "@/components/marketplace/use-session"

/**
 * How a product answers a problem.
 *
 * The same product details the old bid modal collected, minus the amount and
 * the 60/25/15 share grid, plus the two fields that turn a purchase into an
 * answer: how you solve this exact complaint, and what you will do for someone
 * switching.
 *
 * Free, deliberately. Putting a checkout in front of a founder replying to a
 * complaint is exactly backwards while the marketplace is small.
 *
 * Free is not the same as anonymous. This publishes prose under a company's
 * name, beside a complaint about that company's competitor, so the author has
 * to prove they represent it. Normally the magic link at the product's domain
 * is that proof; an administrator can manually grant the same access when the
 * founder uses a different email. The server derives the badge from that proof
 * and ignores anything the form claims about identity.
 */
export function OfferModal({
  problemId,
  statement,
  targetProductName,
  switchCondition,
  compact = false,
  triggerLabel,
  variant = "solid",
}: {
  problemId: string
  statement: string
  targetProductName?: string | null
  switchCondition?: string | null
  compact?: boolean
  triggerLabel?: string
  variant?: "solid" | "outline"
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)
  const router = useRouter()
  const session = useSession()
  const getToken = useAccessToken()
  const close = useCallback(() => !loading && setOpen(false), [loading])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const token = await getToken()
    if (!token) {
      setLoading(false)
      setError("Your sign-in expired. Request a new link.")
      return
    }
    const response = await fetch("/api/offers", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        problemId,
        productName: form.get("productName"),
        productTagline: form.get("productTagline"),
        solvesText: form.get("solvesText"),
        switchIncentive: form.get("switchIncentive"),
        destinationUrl: form.get("destinationUrl"),
        turnstileToken: form.get("cf-turnstile-response") || "",
        website: form.get("website"),
      }),
    })
    const result = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) {
      setError(result.error || "Your answer could not be posted.")
      return
    }
    setDone(true)
    router.refresh()
  }

  const label = triggerLabel || "MAKE AN OFFER"
  const triggerBase = compact
    ? "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[10px] font-bold"
    : "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[10px] font-bold uppercase tracking-[0.04em] sm:h-11 sm:px-5 sm:text-[11px] sm:tracking-[0.08em]"
  const triggerSkin = variant === "outline"
    ? "border border-[rgba(55,50,47,0.14)] bg-white text-[#111] transition-colors duration-200 ease-out hover:border-[#777] active:scale-[0.97]"
    : "bg-[#111] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.97]"

  return <>
    <button type="button" onClick={() => { setDone(false); setError(""); setOpen(true) }} className={`group ${triggerBase} ${triggerSkin}`}>
      {label}
      <HugeiconsIcon icon={ArrowRight01Icon} size={13} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
    </button>

    <ModalShell open={open} onClose={close} labelledBy="offer-title" chromeLabel="MAKE AN OFFER">
      <div className="px-5 pb-6 pt-1 sm:px-7">
        {done ? (
          <div className="py-6 text-center">
            <h2 id="offer-title" className="font-serif text-[23px] leading-[1.08] tracking-[-0.035em] text-[#111]">Your answer is live.</h2>
            <p className="mx-auto mt-2.5 max-w-sm text-[13px] leading-5 text-[#666]">
              It is live on this problem now. Manage it and see click counts from your dashboard.
            </p>
            <button type="button" onClick={() => setOpen(false)} className="mt-5 inline-flex h-10 items-center bg-[#111] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ef4e37]">
              Close
            </button>
          </div>
        ) : session.checked && !session.email ? (
          <MagicLinkAuth
            redirectTo={typeof window !== "undefined" ? window.location.href : "/"}
            titleId="offer-title"
            title="Sign in from your product's domain."
            blurb="Answering is free. It is not anonymous — you publish under your product's name next to a competitor's complaint, so sign in with an address at your own domain. If you cannot, ask us and we will verify you by hand."
            returnHint="write your answer"
            emailPlaceholder="you@yourproduct.com"
          />
        ) : <>
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#de422a]">Free · signed in as {session.email}</p>
          <h2 id="offer-title" className="mt-2 font-serif text-[23px] leading-[1.08] tracking-[-0.035em] text-[#111]">
            {targetProductName ? `Take this customer from ${targetProductName}.` : "Say how you fix this."}
          </h2>
          <blockquote className="mt-3 line-clamp-2 border-l-2 border-[#ef654f] pl-3 text-[12px] leading-5 text-[#77726a]">“{statement}”</blockquote>

          {/* The brief. It is the whole reason this field was worth surfacing. */}
          {switchCondition ? (
            <div className="mt-3 bg-[#fff6f2] px-3 py-2.5">
              <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#de422a]">They said they would switch for</p>
              <p className="mt-1 text-[12px] leading-5 text-[#444]">{switchCondition}</p>
            </div>
          ) : null}

          <form onSubmit={submit} className="mt-5 space-y-3">
            <FormField label="Product name">
              <TextInput name="productName" maxLength={80} required placeholder="Plausible" />
            </FormField>

            <FormField label="One line about the product">
              <TextInput name="productTagline" minLength={3} maxLength={180} required placeholder="Simple, privacy-friendly analytics." />
            </FormField>

            <FormField label="How you solve THIS problem" helper="20–240 characters. Answer the complaint above specifically — a general pitch will read as an ad and get hidden.">
              <TextArea name="solvesText" minLength={20} maxLength={240} rows={3} required placeholder="We track four AI engines on the $95 plan, with no per-engine upgrade." />
            </FormField>

            <FormField label="Switch offer" helper="Optional. What you will do for someone leaving, e.g. free migration or a first month free.">
              <TextInput name="switchIncentive" maxLength={140} placeholder="14-day trial and we import your existing prompts." />
            </FormField>

            <FormField label="HTTPS product URL" helper={`Must be on the same domain as ${session.email || "your sign-in address"} — that match is the verification.`}>
              <TextInput name="destinationUrl" type="url" required placeholder="https://plausible.io" />
            </FormField>

            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <TurnstileField />

            <p className="text-[11px] leading-5 text-[#999]">
              Free, and position is never for sale. Answers are ordered by verified identity, whether you made a switch offer, and recency — never by payment. One answer per product per problem.
            </p>
            {error ? <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}

            <button disabled={loading} className="group/cta flex h-11 w-full items-center justify-center gap-2 bg-[#111] text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-[#111]">
              {loading ? <><HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={15} /> Posting…</> : <>Post your answer <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5" /></>}
            </button>
          </form>
        </>}
      </div>
    </ModalShell>
  </>
}
