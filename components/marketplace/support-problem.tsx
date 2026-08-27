"use client"

import { useState } from "react"
import { Check, Flame, LoaderCircle } from "lucide-react"

export function SupportProblem({ problemId, initialCount, compact = false }: { problemId: string; initialCount: number; compact?: boolean }) {
  const [count, setCount] = useState(initialCount)
  const [state, setState] = useState<"idle" | "loading" | "supported">("idle")
  const [details, setDetails] = useState(false)
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
      // Brief pop on the number so the vote lands visibly.
      setBumped(true)
      setTimeout(() => setBumped(false), 420)
    }
    setState("supported")
    return true
  }

  // The one-sentence detail form only appears on the problem page. Opening it
  // inside a board card would blow the card's fixed height apart.
  if (details && !compact) {
    return (
      <form
        className="w-full max-w-md space-y-2"
        onSubmit={async (event) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          if (await send({ detail: form.get("detail"), email: form.get("email") })) setDetails(false)
        }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#d84d37]">Counted. Anything specific?</p>
        <textarea
          name="detail"
          maxLength={280}
          className="min-h-20 w-full resize-none border border-[rgba(55,50,47,0.12)] bg-white p-3 text-[13px] text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#777]"
          placeholder="What specifically sucks? (optional, one sentence)"
        />
        <input
          name="email"
          type="email"
          className="h-10 w-full border border-[rgba(55,50,47,0.12)] bg-white px-3 text-[13px] text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#777]"
          placeholder="Email me when claimed (optional)"
        />
        <div className="flex items-center gap-2">
          <button className="inline-flex h-9 items-center bg-[#111] px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37]">
            Save detail
          </button>
          <button type="button" onClick={() => setDetails(false)} className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#999] underline underline-offset-2 transition-colors hover:text-[#111]">
            Skip
          </button>
        </div>
        {message ? <p className="text-[11px] text-red-700">{message}</p> : null}
      </form>
    )
  }

  const supported = state === "supported"
  const busy = state === "loading"

  return (
    <div className="min-w-0">
      <button
        type="button"
        disabled={busy || (compact && supported)}
        onClick={async () => {
          if (supported) { if (!compact) setDetails(true); return }
          const ok = await send()
          if (ok && !compact) setDetails(true)
        }}
        aria-label={supported ? "You have this problem too" : "I have this problem too"}
        className={`inline-flex items-center rounded-full font-bold transition-all duration-200 ease-out active:scale-[0.97] disabled:cursor-default ${
          compact ? "h-8 gap-1.5 px-3.5 text-[10px]" : "h-11 gap-2 px-5 text-[11px] uppercase tracking-[0.08em]"
        } ${
          supported
            ? "bg-[#eef7f0] text-[#2f7d4f] ring-1 ring-inset ring-[rgba(47,125,79,.22)]"
            : "bg-white text-[#d84d37] ring-1 ring-inset ring-[rgba(216,77,55,.22)] hover:bg-[#fff0eb] hover:ring-[rgba(216,77,55,.4)]"
        }`}
      >
        <span className="grid size-3.5 shrink-0 place-items-center">
          {busy ? <LoaderCircle size={compact ? 11 : 13} className="animate-spin" />
            : supported ? <Check size={compact ? 11 : 13} />
            : <Flame size={compact ? 11 : 13} />}
        </span>
        <span className="whitespace-nowrap">{supported ? "Counted" : compact ? "Me too" : "I have this too"}</span>
        <span className="h-3 w-px shrink-0 bg-current opacity-25" />
        <span className={`tabular-nums transition-transform duration-300 ease-out ${bumped ? "scale-125" : "scale-100"}`}>
          {count.toLocaleString("en-US")}
        </span>
      </button>
      {message ? <p className={`mt-1.5 text-red-700 ${compact ? "text-[10px]" : "text-[11px]"}`}>{message}</p> : null}
    </div>
  )
}
