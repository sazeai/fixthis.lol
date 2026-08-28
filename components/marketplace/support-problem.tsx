"use client"

import { useState, type ReactNode } from "react"
import { Check, Flame, LoaderCircle, Lock } from "lucide-react"
import { MagicLinkAuth } from "@/components/marketplace/magic-link-auth"
import { useSupportStatus } from "@/components/marketplace/use-support-status"
import { useAccessToken, useSession } from "@/components/marketplace/use-session"

type Step = "none" | "candidate" | "detail"

/**
 * ME TOO, and the two follow-ups.
 *
 * These used to be one blob of three inputs that appeared after the vote. They
 * are not one thing, and pretending otherwise is why it read as a form to fill
 * in rather than two small favours to do:
 *
 *   1. The tap itself      — anonymous, one click, nothing else asked.
 *   2. What you'd switch to — anonymous, one field, no account. Aggregated and
 *                             never attributed, so there is little to gain by
 *                             spamming it and real value in it staying frictionless.
 *   3. What specifically sucks — published prose next to a named company. This
 *                             is the surface worth spamming and the one that
 *                             makes moderation work, so it needs an account.
 *
 * They are presented in that order, and each is skippable.
 */
export function SupportProblem({
  problemId,
  initialCount,
  compact = false,
  initialSupported = false,
  children,
}: {
  problemId: string
  initialCount: number
  compact?: boolean
  /** Server-derived: true renders the counted state on first paint, no flash. */
  initialSupported?: boolean
  /** Sibling actions rendered in the same row. */
  children?: ReactNode
}) {
  const [count, setCount] = useState(initialCount)
  // Whether this visitor already supported this problem is answered by the
  // server, batched with every other card on the page. Until it answers the
  // button stays idle; pressing it then is harmless, because a duplicate is
  // refused by the unique constraint and reported as alreadySupported.
  const [alreadySupported, setAlreadySupported] = useSupportStatus(problemId, initialSupported)
  const [state, setState] = useState<"idle" | "loading" | "supported">("idle")
  const [step, setStep] = useState<Step>("none")
  const [savedCandidate, setSavedCandidate] = useState(false)
  const [savedDetail, setSavedDetail] = useState(false)
  const [message, setMessage] = useState("")
  const [bumped, setBumped] = useState(false)
  const session = useSession()
  const getToken = useAccessToken()

  async function send(body: Record<string, unknown> = {}, authenticated = false) {
    setState("loading")
    setMessage("")
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (authenticated) {
      const token = await getToken()
      if (!token) {
        setState("idle")
        setMessage("Your sign-in expired. Request a new link.")
        return false
      }
      headers.Authorization = `Bearer ${token}`
    }
    const response = await fetch(`/api/problems/${problemId}/support`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState(alreadySupported ? "supported" : "idle")
      setMessage(result.error || "Could not record this.")
      return false
    }
    if (result.inserted) {
      setCount(result.support_count)
      setBumped(true)
      setTimeout(() => setBumped(false), 420)
    } else if (typeof result.support_count === "number" && result.support_count > 0) {
      // Already counted from an earlier visit. Adopt the true figure, but do not
      // bump it: nothing new happened.
      setCount(result.support_count)
    }
    setAlreadySupported(true)
    setState("supported")
    return true
  }

  const supported = state === "supported" || alreadySupported
  const busy = state === "loading"

  const button = (
    <button
      type="button"
      disabled={busy || supported}
      onClick={() => { if (!supported) void send().then((ok) => { if (ok) setStep("candidate") }) }}
      aria-label={supported ? "You have this problem too" : "I have this problem too"}
      className={`inline-flex items-center rounded-full font-bold transition-colors duration-200 ease-out active:scale-[0.97] disabled:cursor-default ${
        compact
          ? "h-8 gap-1.5 whitespace-nowrap px-3 text-[10px]"
          : "h-10 shrink-0 gap-1 whitespace-nowrap px-2 text-[10px] uppercase tracking-[0.04em] sm:h-11 sm:gap-2 sm:px-5 sm:text-[11px] sm:tracking-[0.08em]"
      } ${
        supported
          ? "bg-[#eef7f0] text-[#2f7d4f] ring-1 ring-inset ring-[rgba(47,125,79,.22)]"
          : "bg-white text-[#d84d37] ring-1 ring-inset ring-[rgba(216,77,55,.22)] hover:bg-[#fff0eb] hover:ring-[rgba(216,77,55,.4)]"
      }`}
    >
      <span className={`grid shrink-0 place-items-center ${compact ? "size-3" : "size-3 sm:size-3.5"}`}>
        {busy ? <LoaderCircle size={compact ? 11 : 12} className="animate-spin" />
          : supported ? <Check size={compact ? 11 : 12} />
          : <Flame size={compact ? 11 : 12} />}
      </span>
      {/* The count leads: it is the social proof, and the words are just the
          verb attached to it. */}
      <span className={`shrink-0 font-semibold tabular-nums transition-transform duration-300 ease-out ${bumped ? "scale-[1.35]" : "scale-100"}`}>
        {count.toLocaleString("en-US")}
      </span>
      <span className="whitespace-nowrap">{supported ? "Counted" : "Me too"}</span>
    </button>
  )

  // On a board card the vote is the whole interaction — never offer a follow-up.
  if (compact) {
    return (
      <div className="relative min-w-0">
        {button}
        {message ? <p className="mt-1.5 text-[10px] text-red-700">{message}</p> : null}
      </div>
    )
  }

  const redirectTo = typeof window !== "undefined" ? window.location.href : "/"

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {button}
        {children}
        {supported && step === "none" ? (
          <button
            type="button"
            onClick={() => setStep(savedCandidate ? "detail" : "candidate")}
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#a8a39c] underline underline-offset-4 transition-colors hover:text-[#d84d37]"
          >
            Add more
          </button>
        ) : null}
      </div>

      {/* Step 2 — anonymous, one field, no account. */}
      {supported && step === "candidate" ? (
        <form
          className="max-w-md border border-[rgba(55,50,47,0.12)] bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            if (await send({ switchCandidate: form.get("switchCandidate") })) {
              setSavedCandidate(true)
              setStep("detail")
            }
          }}
        >
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">Anonymous · no account</p>
          <h3 className="mt-1.5 font-serif text-[19px] tracking-[-0.02em] text-[#111]">What are you looking at instead?</h3>
          <p className="mt-1 text-[11px] leading-4 text-[#888]">
            Just a product name. Shown as a count next to everyone else&rsquo;s, never linked to you.
          </p>
          <input
            name="switchCandidate"
            maxLength={60}
            autoFocus
            className="mt-3 h-10 w-full border border-[rgba(55,50,47,0.14)] bg-white px-2.5 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
            placeholder="Promptwatch"
          />
          <div className="mt-3 flex items-center gap-3">
            <button disabled={busy} className="inline-flex h-9 items-center bg-[#111] px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60">
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" onClick={() => setStep("detail")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
              Skip
            </button>
          </div>
        </form>
      ) : null}

      {/* Step 3 — published prose, so it needs an account. */}
      {supported && step === "detail" && !savedDetail ? (
        <div className="max-w-md border border-[rgba(55,50,47,0.12)] bg-white">
          {session.checked && !session.email ? (
            <>
              <div className="flex items-center gap-2 border-b border-[rgba(55,50,47,0.12)] bg-[#faf9f8] px-4 py-2.5">
                <Lock size={11} className="text-[#8a857e]" />
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a857e]">Sign in to write a detail</p>
              </div>
              <MagicLinkAuth
                compact
                redirectTo={redirectTo}
                titleId="support-detail-auth"
                title="One quick sign-in."
                blurb="Your ME TOO is already counted and stays anonymous. Written details are signed in, because they get published next to a named company."
                returnHint="finish your detail"
              />
              <div className="border-t border-[rgba(55,50,47,0.12)] px-4 py-2.5 text-center">
                <button type="button" onClick={() => setStep("none")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
                  No thanks
                </button>
              </div>
            </>
          ) : (
            <form
              className="p-4"
              onSubmit={async (event) => {
                event.preventDefault()
                const form = new FormData(event.currentTarget)
                if (await send({ detail: form.get("detail"), email: form.get("email") }, true)) {
                  setSavedDetail(true)
                  setStep("none")
                }
              }}
            >
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">Published without your name</p>
              <h3 className="mt-1.5 font-serif text-[19px] tracking-[-0.02em] text-[#111]">What specifically sucks?</h3>
              <textarea
                name="detail"
                minLength={3}
                maxLength={280}
                rows={2}
                autoFocus
                className="mt-3 w-full resize-none border border-[rgba(55,50,47,0.14)] bg-white p-2.5 text-[13px] leading-5 text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
                placeholder="One sentence."
              />
              <input
                name="email"
                type="email"
                className="mt-2 h-9 w-full border border-[rgba(55,50,47,0.14)] bg-white px-2.5 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
                placeholder="Email me when an alternative answers (optional)"
              />
              <div className="mt-3 flex items-center gap-3">
                <button disabled={busy} className="inline-flex h-9 items-center bg-[#111] px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60">
                  {busy ? "Saving…" : "Save"}
                </button>
                <button type="button" onClick={() => setStep("none")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : null}

      {savedCandidate || savedDetail ? (
        <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#2f7d4f]">
          {savedDetail ? "Detail saved" : "Saved"}
        </p>
      ) : null}

      {message ? <p className="text-[11px] text-red-700">{message}</p> : null}
    </div>
  )
}
