"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, Check, LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { FormField, SelectInput, TextArea, TextInput } from "@/components/marketplace/form-field"
import { MagicLinkAuth } from "@/components/marketplace/magic-link-auth"
import { ModalShell } from "@/components/marketplace/modal-shell"
import { TurnstileField } from "@/components/marketplace/turnstile-field"
import { PROBLEM_CATEGORIES } from "@/lib/marketplace/helpers"
import { getSupabaseBrowserClient } from "@/utils/supabase/client"

type Mode = "user" | "founder"

export function PostProblemModal({
  compact = false,
  trigger = "POST A PROBLEM",
  inverted = false,
  asLink = false,
  mode = "user",
}: {
  compact?: boolean
  trigger?: string
  inverted?: boolean
  /** Render as inline text rather than a button, for secondary placements. */
  asLink?: boolean
  /**
   * "founder" is the add-and-claim entry point: a product adds the problem it
   * solves, it starts at zero supporters, and we route straight into claiming it.
   */
  mode?: Mode
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState<"published" | "">("")
  const [createdSlug, setCreatedSlug] = useState("")
  const [authChecked, setAuthChecked] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const close = useCallback(() => !loading && setOpen(false), [loading])
  const founder = mode === "founder"

  useEffect(() => {
    let active = true
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = getSupabaseBrowserClient()
      supabase.auth.getSession().then(({ data }) => {
        if (active) {
          setUserEmail(data.session?.user.email || null)
          setAuthChecked(true)
        }
      }).catch(() => { if (active) setAuthChecked(true) })
      const result = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        setUserEmail(session?.user.email || null)
        setAuthChecked(true)
      })
      subscription = result.data.subscription
    } catch {
      setAuthChecked(true)
    }

    return () => {
      active = false
      subscription?.unsubscribe()
    }
  }, [])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      const { data } = await getSupabaseBrowserClient().auth.getSession()
      const token = data.session?.access_token
      if (!token) {
        setUserEmail(null)
        setError("Your sign-in has expired. Request a new magic link to continue.")
        return
      }

      const response = await fetch("/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          statement: form.get("statement"),
          category: form.get("category"),
          origin: mode,
          email: form.get("email"),
          website: form.get("website"),
          turnstileToken: form.get("cf-turnstile-response") || "",
        }),
      })
      const result = await response.json().catch(() => ({}))

      // A near-duplicate is returned as the canonical problem so demand does not fragment.
      if (response.status === 409 && result.slug) {
        router.push(`/problems/${result.slug}?duplicate=1`)
        setOpen(false)
        return
      }
      if (response.status === 401) {
        setUserEmail(null)
        setError(result.error || "Sign in again to post a problem.")
        return
      }
      if (!response.ok) {
        setError(result.error || "The problem could not be published.")
        return
      }

      setCreatedSlug(result.slug || "")
      // Founders go straight to the problem page, where the claim CTA lives.
      if (founder && result.status === "published" && result.slug) {
        router.push(`/problems/${result.slug}`)
        setOpen(false)
        return
      }
      setSuccess(result.status)
      router.refresh()
    } catch {
      setError("The problem could not be published. Check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const triggerClass = asLink
    ? "text-[10px] text-[#999] underline underline-offset-2 transition-colors hover:text-[#d84d37]"
    : inverted
    ? "group inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 text-[13px] font-bold uppercase tracking-[0.08em] text-[#111] transition-colors duration-200 ease-out hover:bg-[#fafafa] active:scale-[0.98]"
    : compact
      ? "group inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full bg-[#111] px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.97]"
      : "group inline-flex min-h-11 items-center gap-2 rounded-full bg-[#111] px-6 text-[12px] font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.98]"

  return <>
    <button type="button" onClick={() => { setOpen(true); setSuccess(""); setError("") }} className={triggerClass}>
      {trigger}{asLink ? null : <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />}
    </button>

    <ModalShell open={open} onClose={close} labelledBy="post-problem-title" chromeLabel={founder ? "ADD / CLAIM" : "POST A PROBLEM"}>
      {!authChecked ? (
        <div className="grid min-h-56 place-items-center px-6 py-10 text-[#999]"><LoaderCircle className="animate-spin" size={20} /></div>
      ) : !userEmail ? (
        <MagicLinkAuth redirectTo={typeof window === "undefined" ? "" : window.location.href} />
      ) : success ? (
        <div className="px-5 pb-8 pt-2 text-center sm:px-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#eef7f0] text-[#2f7d4f]"><Check size={22} /></span>
          <h2 id="post-problem-title" className="mt-4 font-serif text-[24px] leading-[1.08] tracking-[-0.035em] text-[#111]">
            Problem published.
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-6 text-[#666]">
            Your support is already counted. Products can now compete to solve it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
            {success === "published" && createdSlug ? (
              <a href={`/problems/${createdSlug}`} className="inline-flex h-11 items-center bg-[#111] px-5 font-mono text-[10px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37]">
                See the problem
              </a>
            ) : null}
            <button onClick={close} className="inline-flex h-11 items-center border border-[rgba(55,50,47,0.12)] bg-white px-5 font-mono text-[10px] uppercase tracking-[0.1em] text-[#111] transition-colors hover:border-[#777]">
              Done
            </button>
          </div>
        </div>
      ) : (
        <div className="px-5 pb-6 pt-1 sm:px-7">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">
            {founder ? "Add and claim" : "Signed in"}
          </p>
          <h2 id="post-problem-title" className="mt-2 font-serif text-[23px] leading-[1.08] tracking-[-0.035em] text-[#111]">
            {founder ? "Add the problem you solve." : "What is pissing you off?"}
          </h2>
          <p className="mt-2 text-[12px] leading-5 text-[#77726a]">
            {founder
              ? "Write it from the buyer's perspective, not as a pitch. It starts at zero supporters — the market decides if anyone agrees. You can claim it on the next screen."
              : "Write the pain from the buyer's perspective. A verified email is required to keep the board useful."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <FormField label="I need…">
              <TextArea name="statement" minLength={20} maxLength={280} required rows={3} placeholder="I need an analytics tool that makes sense without a training course…" />
            </FormField>
            <FormField label="Category">
              <SelectInput name="category" defaultValue="Productivity">
                {PROBLEM_CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </SelectInput>
            </FormField>
            <FormField
              label="Email (optional)"
              helper={founder ? "Only used to confirm alerts. Your bid email is collected at checkout." : "Confirm by email to hear when the first solution claims this problem."}
            >
              <TextInput name="email" type="email" maxLength={254} defaultValue={userEmail} placeholder="you@company.com" />
            </FormField>

            <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <TurnstileField />

            {error ? <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}

            <button disabled={loading} className="group/cta flex h-11 w-full items-center justify-center gap-2 bg-[#111] text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-[#111]">
              {loading ? <><LoaderCircle className="animate-spin" size={15} /> Publishing…</>
                : <>{founder ? "Add problem & continue" : "Publish problem"} <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5" /></>}
            </button>
          </form>
        </div>
      )}
    </ModalShell>
  </>
}
