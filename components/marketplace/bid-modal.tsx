"use client"

import { useCallback, useState } from "react"
import { ArrowRight, LoaderCircle } from "lucide-react"
import { FormField, TextArea, TextInput } from "@/components/marketplace/form-field"
import { ModalShell } from "@/components/marketplace/modal-shell"
import { TurnstileField } from "@/components/marketplace/turnstile-field"
import { formatMoney } from "@/lib/marketplace/helpers"

export type BidPrefill = { productName?: string; productTagline?: string; destinationUrl?: string; email?: string; eventText?: string }

export function BidModal({
  problemId,
  statement,
  nextBidCents,
  compact = false,
  prefill,
  triggerLabel,
  variant = "solid",
}: {
  problemId: string
  statement: string
  nextBidCents: number
  compact?: boolean
  prefill?: BidPrefill
  triggerLabel?: string
  variant?: "solid" | "outline"
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  // Starts as the board's figure and is corrected by the server when a bid
  // settles between this page rendering and the form being submitted. Telling
  // someone the price moved is only useful alongside the price it moved to.
  const [minimumCents, setMinimumCents] = useState(nextBidCents)
  const close = useCallback(() => !loading && setOpen(false), [loading])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const amountCents = Math.round(Number(form.get("amount")) * 100)
    const response = await fetch("/api/bids/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId,
        productName: form.get("productName"),
        productTagline: form.get("productTagline"),
        eventText: form.get("eventText"),
        destinationUrl: form.get("destinationUrl"),
        email: form.get("email"),
        amountCents,
        turnstileToken: form.get("cf-turnstile-response") || "",
        website: form.get("website"),
      }),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setLoading(false)
      if (Number.isInteger(result.minimumCents)) setMinimumCents(result.minimumCents)
      setError(result.error || "Checkout could not be started.")
      return
    }
    window.location.assign(result.checkoutUrl)
  }

  const label = triggerLabel || (nextBidCents === 500 ? "CLAIM" : "TAKE #1")
  const triggerBase = compact
    ? "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[10px] font-bold"
    : "inline-flex h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full px-2 text-[10px] font-bold uppercase tracking-[0.04em] sm:h-11 sm:gap-2 sm:px-5 sm:text-[11px] sm:tracking-[0.08em]"
  const triggerSkin = variant === "outline"
    ? "border border-[rgba(55,50,47,0.14)] bg-white text-[#111] transition-colors duration-200 ease-out hover:border-[#777] active:scale-[0.97]"
    : "bg-[#111] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.97]"

  return <>
    <button type="button" onClick={() => setOpen(true)} className={`group ${triggerBase} ${triggerSkin}`}>
      {label} · {formatMoney(nextBidCents)}+
      <ArrowRight size={13} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
    </button>

    <ModalShell open={open} onClose={close} labelledBy="bid-title" chromeLabel="CLAIM PLACEMENT">
      <div className="px-5 pb-6 pt-1 sm:px-7">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Paid contextual placement</p>
        <h2 id="bid-title" className="mt-2 font-serif text-[23px] leading-[1.08] tracking-[-0.035em] text-[#111]">Claim this problem.</h2>
        <blockquote className="mt-3 line-clamp-2 border-l-2 border-[#ef654f] pl-3 text-[12px] leading-5 text-[#77726a]">“{statement}”</blockquote>

        <div className="mt-4">
          <p className="mb-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-[#a8a39c]">What each position gets</p>
          <div className="grid grid-cols-3 gap-px border border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)] text-center">
            <Share value="60%" label="#1" lead />
            <Share value="25%" label="#2" />
            <Share value="15%" label="#3–5 share" />
          </div>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Product name">
              <TextInput name="productName" maxLength={80} required defaultValue={prefill?.productName} placeholder="Plausible" />
            </FormField>
            <FormField label="Management email">
              <TextInput name="email" type="email" required defaultValue={prefill?.email} placeholder="founder@company.com" />
            </FormField>
          </div>
          <FormField label="One-sentence fit">
            <TextArea name="productTagline" minLength={3} maxLength={180} required defaultValue={prefill?.productTagline} placeholder="Simple, privacy-friendly analytics without the GA4 learning curve." />
          </FormField>
          <FormField label="Your move" helper="Optional, up to 60 characters. Shown as a brief flash on the board when it changes — not printed on the card.">
            <TextInput name="eventText" maxLength={60} defaultValue={prefill?.eventText} placeholder="FREE MIGRATION" />
          </FormField>
          <FormField label="HTTPS product URL">
            <TextInput name="destinationUrl" type="url" required defaultValue={prefill?.destinationUrl} placeholder="https://plausible.io" />
          </FormField>
          <FormField label={`Bid · minimum ${formatMoney(minimumCents)}`} helper="Your email receives the private stats and editing link.">
            <div className="flex h-10 items-center border border-[rgba(55,50,47,0.14)] bg-white focus-within:border-[#111]">
              <span className="pl-3 font-mono text-[13px] text-[#a8a39c]">$</span>
              {/* Keyed on the minimum so a correction from the server actually
                  reaches this uncontrolled field instead of leaving the old
                  number sitting under a message saying it is too low. */}
              <TextInput key={minimumCents} name="amount" type="number" min={minimumCents / 100} step="1" defaultValue={minimumCents / 100} required className="!h-auto flex-1 !border-0 focus:!border-0" />
            </div>
          </FormField>

          <input name="website" className="hidden" tabIndex={-1} autoComplete="off" />
          <TurnstileField />

          <p className="text-[11px] leading-5 text-[#999]">
            This is a full, one-time, non-refundable advertising purchase. It buys exposure, not leads or endorsement. The quote is held for 15 minutes.
          </p>
          {error ? <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p> : null}

          <button disabled={loading} className="group/cta flex h-11 w-full items-center justify-center gap-2 bg-[#111] text-[11px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.99] disabled:opacity-60 disabled:hover:bg-[#111]">
            {loading ? <><LoaderCircle className="animate-spin" size={15} /> Opening checkout…</> : <>Continue to secure checkout <ArrowRight size={14} className="transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5" /></>}
          </button>
        </form>
      </div>
    </ModalShell>
  </>
}

function Share({ value, label, lead = false }: { value: string; label: string; lead?: boolean }) {
  return (
    <div className="bg-[#fafafa] px-2 py-2.5 transition-colors duration-200 hover:bg-white">
      <p className={`font-serif text-[17px] leading-none tracking-[-0.03em] ${lead ? "text-[#db4e38]" : "text-[#111]"}`}>{value}</p>
      <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-[#999]">{label}</p>
    </div>
  )
}
