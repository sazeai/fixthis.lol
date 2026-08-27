"use client"

import { useState, type ReactNode } from "react"
import { Check, Flame, LoaderCircle } from "lucide-react"

export function SupportProblem({
  problemId,
  initialCount,
  compact = false,
  children,
}: {
  problemId: string
  initialCount: number
  compact?: boolean
  /** Sibling actions rendered in the same row, e.g. the bid CTA. */
  children?: ReactNode
}) {
  const [count, setCount] = useState(initialCount)
  const [state, setState] = useState<"idle" | "loading" | "supported">("idle")
  const [details, setDetails] = useState(false)
  const [saved, setSaved] = useState(false)
  const [message, setMessage] = useState("")
  const [bumped, setBumped] = useState(false)

  async function send(body: Record<string, unknown> = {}) {
    setState("loading")
    setMessage("")
    const response = await fetch(`/api/problems/${problemId}/support`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState("idle")
      setMessage(result.error || "Could not record this.")
      return false
    }
    if (result.inserted) {
      setCount(result.support_count)
      setBumped(true)
      setTimeout(() => setBumped(false), 420)
    }
    setState("supported")
    return true
  }

  const supported = state === "supported"
  const busy = state === "loading"

  const button = (
    <button
      type="button"
      disabled={busy || supported}
      onClick={() => { if (!supported) void send() }}
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
      <span className="whitespace-nowrap">{supported ? "Counted" : compact ? "Me too" : "I have this too"}</span>
      <span className="h-3 w-px shrink-0 bg-current opacity-25" />
      <span className={`tabular-nums transition-transform duration-300 ease-out ${bumped ? "scale-125" : "scale-100"}`}>
        {count.toLocaleString("en-US")}
      </span>
    </button>
  )

  // On a board card the vote is the whole interaction — never offer the detail.
  if (compact) {
    return (
      <div className="min-w-0">
        {button}
        {message ? <p className="mt-1.5 text-[10px] text-red-700">{message}</p> : null}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2.5">
        {button}
        {children}
        {/* The optional detail is offered quietly, after the vote has already
            landed. It never replaces the button or moves anything. */}
        {supported && !details && !saved ? (
          <button
            type="button"
            onClick={() => setDetails(true)}
            className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#a8a39c] underline underline-offset-4 transition-colors hover:text-[#d84d37]"
          >
            Add what specifically sucks
          </button>
        ) : null}
        {saved ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#2f7d4f]">Detail saved</span>
        ) : null}
      </div>

      {details ? (
        <form
          className="max-w-md space-y-2 border border-[rgba(55,50,47,0.12)] bg-white p-4"
          onSubmit={async (event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            if (await send({ detail: form.get("detail"), email: form.get("email") })) {
              setDetails(false)
              setSaved(true)
            }
          }}
        >
          <textarea
            name="detail"
            maxLength={280}
            rows={2}
            autoFocus
            className="w-full resize-none border border-[rgba(55,50,47,0.14)] bg-white p-2.5 text-[13px] leading-5 text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
            placeholder="What specifically sucks? (one sentence)"
          />
          <input
            name="email"
            type="email"
            className="h-9 w-full border border-[rgba(55,50,47,0.14)] bg-white px-2.5 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
            placeholder="Email me when it is claimed (optional)"
          />
          <div className="flex items-center gap-3 pt-0.5">
            <button className="inline-flex h-8 items-center bg-[#111] px-3.5 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37]">
              Save
            </button>
            <button
              type="button"
              onClick={() => setDetails(false)}
              className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {message ? <p className="text-[11px] text-red-700">{message}</p> : null}
    </div>
  )
}
