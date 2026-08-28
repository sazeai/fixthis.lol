"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons"

/**
 * Vouch for a founder who cannot prove their domain by email.
 *
 * The note is required and it is the point: this is the record of every claim
 * that was taken on trust rather than proved, and "because I said so" three
 * months later is not an audit trail.
 */
export function ClaimGrantForm() {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle")
  const [error, setError] = useState("")
  const router = useRouter()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("saving")
    setError("")
    const form = event.currentTarget
    const data = new FormData(form)
    const response = await fetch("/api/admin/claim-grants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        email: data.get("email"),
        domain: data.get("domain"),
        note: data.get("note"),
        verified: data.get("verified") === "on",
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState("idle")
      setError(result.error || "Could not issue the grant.")
      return
    }
    form.reset()
    setState("saved")
    router.refresh()
    setTimeout(() => setState("idle"), 2000)
  }

  return (
    <form onSubmit={submit} className="border border-[rgba(55,50,47,0.12)] bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Their sign-in email" hint="The address they will magic-link in with.">
          <input name="email" type="email" required placeholder="founder@gmail.com" className={INPUT} />
        </Field>
        <Field label="Product domain" hint="Bare domain or full URL — either works.">
          <input name="domain" required placeholder="promptwatch.io" className={INPUT} />
        </Field>
      </div>
      <div className="mt-3">
        <Field label="Why (required)" hint="How you confirmed they represent this product.">
          <input name="note" required minLength={3} maxLength={280} placeholder="Spoke on X, listed as founder on the site." className={INPUT} />
        </Field>
      </div>
      <label className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-[#555]">
        <input name="verified" type="checkbox" defaultChecked className="mt-0.5" />
        <span>
          Answers under this grant carry the <strong className="font-medium text-[#111]">Verified</strong> mark.
          Uncheck if you think they probably represent this product but have not actually confirmed it.
        </span>
      </label>
      <div className="mt-4 flex items-center gap-3">
        <button
          disabled={state === "saving"}
          className="inline-flex h-10 items-center gap-2 bg-[#111] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60"
        >
          {state === "saving" ? <HugeiconsIcon icon={Loading03Icon} size={12} className="animate-spin" /> : state === "saved" ? <HugeiconsIcon icon={Tick02Icon} size={12} /> : null}
          {state === "saved" ? "Granted" : "Grant claim"}
        </button>
        {error ? <p className="text-[12px] text-red-700">{error}</p> : null}
      </div>
    </form>
  )
}

export function RevokeGrantButton({ id }: { id: string }) {
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const router = useRouter()

  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!window.confirm("Revoke this claim? The founder will lose product access and answers verified only by this grant will lose their badge.")) return
        setBusy(true)
        setFailed(false)
        const response = await fetch("/api/admin/claim-grants", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "revoke", id }),
        })
        if (response.ok) router.refresh()
        else {
          setBusy(false)
          setFailed(true)
        }
      }}
      className="inline-flex h-7 items-center border border-[rgba(55,50,47,0.12)] bg-white px-2.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#d84d37] transition-colors hover:border-[#d84d37] disabled:opacity-50"
    >
      {busy ? "Working…" : failed ? "Failed — retry" : "revoke"}
    </button>
  )
}

const INPUT = "h-10 w-full border border-[rgba(55,50,47,0.14)] bg-white px-2.5 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a857e]">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[10px] leading-4 text-[#999]">{hint}</span> : null}
    </label>
  )
}
