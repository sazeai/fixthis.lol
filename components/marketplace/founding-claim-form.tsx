"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { LoaderCircle } from "lucide-react"

const field = "h-11 w-full border border-[rgba(55,50,47,0.12)] bg-white px-3 text-[13px] text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#777]"

export function FoundingClaimForm({ problems }: { problems: Array<{ id: string; statement: string }> }) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const response = await fetch("/api/admin/founding-claims", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    })
    const result = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) { setError(result.error || "Could not create claim."); return }
    formRef.current?.reset()
    router.refresh()
  }

  return (
    <form ref={formRef} onSubmit={submit} className="grid gap-3 border border-[rgba(55,50,47,0.12)] bg-white p-5 md:grid-cols-2">
      <select name="problemId" required defaultValue="" className={`${field} md:col-span-2`}>
        <option value="" disabled>Choose a problem…</option>
        {problems.map((problem) => <option key={problem.id} value={problem.id}>{problem.statement}</option>)}
      </select>
      <input name="productName" required maxLength={80} placeholder="Product name" className={field} />
      <input name="email" required type="email" placeholder="Founder email" className={field} />
      <input name="destinationUrl" required type="url" placeholder="https://product.com" className={`${field} md:col-span-2`} />
      <input name="productTagline" required maxLength={180} placeholder="One-sentence problem fit" className={`${field} md:col-span-2`} />
      {error ? <p className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700 md:col-span-2">{error}</p> : null}
      <button disabled={loading} className="flex h-11 items-center justify-center gap-2 bg-[#111] text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60 md:col-span-2">
        {loading ? <><LoaderCircle size={13} className="animate-spin" /> Creating…</> : "Create $0 founding claim"}
      </button>
      <p className="text-[11px] leading-5 text-[#999] md:col-span-2">
        Labelled publicly as a founding claim with a $0 bid. Any settled $5+ bid displaces it.
      </p>
    </form>
  )
}
