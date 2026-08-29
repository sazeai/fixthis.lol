"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Flag01Icon, Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { TurnstileField } from "@/components/marketplace/turnstile-field"

const REASONS = [
  { value: "advertising", label: "It is an advert or a pitch" },
  { value: "spam", label: "Spam or a duplicate" },
  { value: "abusive", label: "Abusive or offensive" },
  { value: "nonsense", label: "Nonsense or unreadable" },
  { value: "other", label: "Something else" },
] as const

export function ReportProblem({ problemId }: { problemId: string }) {
  const [open, setOpen] = useState(false)
  const [state, setState] = useState<"idle" | "sending" | "done">("idle")
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("sending")
    setError("")
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/problems/${problemId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason: form.get("reason"),
        detail: form.get("detail"),
        turnstileToken: form.get("cf-turnstile-response") || "",
        website: form.get("website"),
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState("idle")
      setError(result.error || "Could not send the report.")
      return
    }
    setState("done")
  }

  if (state === "done") {
    return (
      <p className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#2f7d4f]">
        <HugeiconsIcon icon={Tick02Icon} size={11} /> Reported — thank you
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[#a8a39c] transition-colors hover:text-[#de422a] px-4"
      >
        <HugeiconsIcon icon={Flag01Icon} size={10} /> Report this problem
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm border border-[rgba(55,50,47,0.12)] bg-white p-4">
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#de422a]">Report this problem</p>
      <div className="mt-3 space-y-1.5">
        {REASONS.map((reason, index) => (
          <label key={reason.value} className="flex cursor-pointer items-center gap-2 text-[12px] text-[#55504a]">
            <input type="radio" name="reason" value={reason.value} required defaultChecked={index === 0} className="accent-[#de422a]" />
            {reason.label}
          </label>
        ))}
      </div>
      <input
        name="detail"
        maxLength={280}
        placeholder="Anything else? (optional)"
        className="mt-3 h-9 w-full border border-[rgba(55,50,47,0.14)] bg-white px-2.5 text-[12px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
      />
      <div className="mt-3"><TurnstileField /></div>
      <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
      {error ? <p className="mt-2 text-[11px] text-red-700">{error}</p> : null}
      <div className="mt-3 flex items-center gap-2">
        <button
          disabled={state === "sending"}
          className="inline-flex h-8 items-center gap-1.5 bg-[#111] px-3 font-mono text-[9px] uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60"
        >
          {state === "sending" ? <><HugeiconsIcon icon={Loading03Icon} size={11} className="animate-spin" /> Sending</> : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] underline underline-offset-2 transition-colors hover:text-[#111]"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
