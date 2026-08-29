"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const DESTRUCTIVE = new Set(["hide", "suspend"])

export function AdminActionButton({ entity, id, action }: { entity: "problem" | "offer" | "complaint"; id: string; action: "hide" | "publish" | "suspend" | "restore" }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const destructive = DESTRUCTIVE.has(action)

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true)
        const response = await fetch("/api/admin/action", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entity, id, action }),
        })
        if (response.ok) router.refresh()
        else setLoading(false)
      }}
      className={`inline-flex h-7 items-center border px-2.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors disabled:opacity-50 ${
        destructive
          ? "border-[rgba(55,50,47,0.12)] bg-white text-[#de422a] hover:border-[#de422a]"
          : "border-[rgba(55,50,47,0.12)] bg-white text-[#111] hover:border-[#777]"
      }`}
    >
      {loading ? "Working…" : action}
    </button>
  )
}
