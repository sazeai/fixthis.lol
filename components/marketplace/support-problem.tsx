"use client"

import { useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { FireIcon, Loading03Icon, LockKeyIcon, Tick02Icon } from "@hugeicons/core-free-icons"
import { MagicLinkAuth } from "@/components/marketplace/magic-link-auth"
import { ModalShell } from "@/components/marketplace/modal-shell"
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
          ? "h-7 sm:h-8 gap-1.5 whitespace-nowrap px-2.5 sm:px-3 text-[10px]"
          : "h-8 shrink-0 gap-1.5 whitespace-nowrap px-3 text-[10px] uppercase tracking-[0.06em]"
      } ${
        supported
          ? "bg-[#eef7f0] text-[#2f7d4f] ring-1 ring-inset ring-[rgba(47,125,79,.22)]"
          : "bg-white text-[#d84d37] ring-1 ring-inset ring-[rgba(216,77,55,.22)] hover:bg-[#fff0eb] hover:ring-[rgba(216,77,55,.4)]"
      }`}
    >
      <span className="grid size-3 place-items-center">
        {busy ? <HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" />
          : supported ? <HugeiconsIcon icon={Tick02Icon} size={11} />
          : <HugeiconsIcon icon={FireIcon} size={11} />}
      </span>
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

  const closeFollowUp = () => { if (!busy) setStep("none") }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {button}
          {children}
          {supported && step === "none" ? (
            <button
              type="button"
              onClick={() => setStep(savedCandidate ? "detail" : "candidate")}
              className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#a8a39c] underline underline-offset-4 transition-colors hover:text-[#d84d37]"
            >
              Add context
            </button>
          ) : null}
          {savedCandidate || savedDetail ? (
            <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#2f7d4f]">
              {savedDetail ? "Detail saved" : "Saved"}
            </span>
          ) : null}
        </div>
        {message ? <p className="text-[11px] text-red-700">{message}</p> : null}
      </div>

      <ModalShell
        open={supported && step !== "none"}
        onClose={closeFollowUp}
        labelledBy="support-followup-title"
        chromeLabel="ADD CONTEXT"
      >
        {/* Step 2 — anonymous, one field, no account. */}
        {step === "candidate" ? (
          <form
            className="px-5 py-6 sm:px-7 sm:py-7"
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
            <h2 id="support-followup-title" className="mt-2 font-serif text-[24px] tracking-[-0.03em] text-[#111]">What are you looking at instead?</h2>
            <p className="mt-2 max-w-md text-[12px] leading-5 text-[#777]">
              Just a product name. It is combined with everyone else&rsquo;s answer and never linked to you.
            </p>
            <label className="mt-5 block">
              <span className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">Product name</span>
              <input
                name="switchCandidate"
                maxLength={60}
                autoFocus
                className="h-11 w-full border border-[rgba(55,50,47,0.14)] bg-white px-3 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
                placeholder="Promptwatch"
              />
            </label>
            <div className="mt-4 flex items-center gap-3">
              <button disabled={busy} className="inline-flex h-10 items-center bg-[#111] px-5 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60">
                {busy ? "Saving…" : "Save and continue"}
              </button>
              <button type="button" onClick={() => setStep("detail")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
                Skip
              </button>
            </div>
          </form>
        ) : null}

        {/* Step 3 — published prose, so it needs an account. */}
        {step === "detail" && !savedDetail ? (
          session.checked && !session.email ? (
            <>
              <div className="flex items-center gap-2 border-b border-[rgba(55,50,47,0.12)] bg-[#f7f5f3] px-5 py-2.5">
                <HugeiconsIcon icon={LockKeyIcon} size={11} className="text-[#8a857e]" />
                <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#8a857e]">Sign in only for published text</p>
              </div>
              <MagicLinkAuth
                compact
                redirectTo={redirectTo}
                titleId="support-followup-title"
                title="One quick sign-in."
                blurb="Your ME TOO stays anonymous. A written detail appears publicly beside a named company, so it needs a signed-in author."
                returnHint="finish your detail"
              />
              <div className="border-t border-[rgba(55,50,47,0.12)] px-4 py-3 text-center">
                <button type="button" onClick={() => setStep("none")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
                  Skip for now
                </button>
              </div>
            </>
          ) : (
            <form
              className="px-5 py-6 sm:px-7 sm:py-7"
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
              <h2 id="support-followup-title" className="mt-2 font-serif text-[24px] tracking-[-0.03em] text-[#111]">What specifically sucks?</h2>
              <textarea
                name="detail"
                minLength={3}
                maxLength={280}
                rows={3}
                autoFocus
                className="mt-5 w-full resize-none border border-[rgba(55,50,47,0.14)] bg-white p-3 text-[13px] leading-5 text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
                placeholder="One specific sentence."
              />
              <input
                name="email"
                type="email"
                className="mt-2 h-10 w-full border border-[rgba(55,50,47,0.14)] bg-white px-3 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
                placeholder="Email me when an alternative answers (optional)"
              />
              <div className="mt-4 flex items-center gap-3">
                <button disabled={busy} className="inline-flex h-10 items-center bg-[#111] px-5 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60">
                  {busy ? "Saving…" : "Publish detail"}
                </button>
                <button type="button" onClick={() => setStep("none")} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]">
                  Skip
                </button>
              </div>
            </form>
          )
        ) : null}
      </ModalShell>
    </>
  )
}
