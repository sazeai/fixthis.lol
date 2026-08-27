"use client"

import { useState } from "react"
import { ArrowRight, Check, LoaderCircle, Mail } from "lucide-react"
import { getSupabaseBrowserClient } from "@/utils/supabase/client"

export function MagicLinkAuth({ redirectTo }: { redirectTo: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { error: signInError } = await getSupabaseBrowserClient().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      })
      if (signInError) throw signInError
      setSent(true)
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : "The sign-in link could not be sent.")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="px-6 pb-10 pt-9 sm:px-10">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#fff0eb] text-[#d84d37]"><Check size={21} /></span>
        <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-[#2f7d4f]">Link sent</p>
        <h2 id="post-problem-title" className="mt-3 text-center font-serif text-[29px] leading-[1.04] tracking-[-0.04em] text-[#111]">Check your email.</h2>
        <p className="mx-auto mt-4 max-w-sm text-center text-[13px] leading-6 text-[#666]">
          We sent a sign-in link to <strong className="font-medium text-[#111]">{email}</strong>. Open it, then return here to add your problem.
        </p>
        <button type="button" onClick={() => setSent(false)} className="mx-auto mt-7 block font-mono text-[10px] uppercase tracking-[0.1em] text-[#999] underline underline-offset-2 transition-colors hover:text-[#111]">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="px-6 pb-9 pt-9 sm:px-10 sm:pb-10">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-[#f4f2f0] text-[#111]"><Mail size={21} /></span>
      <p className="mt-6 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Sign in to continue</p>
      <h2 id="post-problem-title" className="mt-3 text-center font-serif text-[29px] leading-[1.04] tracking-[-0.04em] text-[#111]">Post a real problem.</h2>
      <p className="mx-auto mt-4 max-w-sm text-center text-[13px] leading-6 text-[#666]">Enter your email and we’ll send you a secure sign-in link. No password to remember.</p>
      <form onSubmit={submit} className="mx-auto mt-8 max-w-sm space-y-3">
        <label className="block">
          <span className="mb-2 block font-mono text-[8px] uppercase tracking-[0.14em] text-[#8a857e]">Your email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@company.com"
            className="h-11 w-full border border-[rgba(55,50,47,0.14)] bg-white px-3 text-[13px] text-[#111] outline-none transition-colors placeholder:text-[#bbb6ae] focus:border-[#111]"
          />
        </label>
        {error ? <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}
        <button disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#111] text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60 disabled:hover:bg-[#111]">
          {loading ? <><LoaderCircle className="animate-spin" size={15} /> Sending…</> : <>Email me a magic link <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></>}
        </button>
      </form>
      <p className="mt-5 text-center font-mono text-[8px] uppercase tracking-[0.12em] text-[#aaa]">One-time link · no password</p>
    </div>
  )
}
