"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BadgeCheck, Check, LoaderCircle } from "lucide-react"
import { FormField, TextArea, TextInput } from "@/components/marketplace/form-field"
import { FramedSection, MarketplaceFrame } from "@/components/marketplace/frame"
import { Header } from "@/components/marketplace/header"
import { useAccessToken } from "@/components/marketplace/use-session"
import type { AdminOffer } from "@/types/marketplace"

/**
 * The founder's private view.
 *
 * Click counts live here and nowhere else. On a problem page they were noise a
 * buyer had to read past; to the person who wrote the answer they are the one
 * number worth coming back for. There is no rank, no bid and no CTR, because
 * there is no longer anything to be ranked against.
 */
export function FounderDashboard({
  product,
  offers,
  token,
}: {
  product: Record<string, any>
  offers: AdminOffer[]
  /**
   * An emailed management link. Omitted on the signed-in dashboard, which
   * authenticates with the session instead — both resolve to the same product
   * on the server, so this component does not need to care which it is.
   */
  token?: string
}) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle")
  const [error, setError] = useState("")
  const getToken = useAccessToken()

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState("saving")
    setError("")
    const form = new FormData(event.currentTarget)
    const payload = {
      productId: product.id,
      name: String(form.get("name")),
      tagline: String(form.get("tagline")),
      destinationUrl: String(form.get("url")),
    }
    const bearer = token || await getToken()
    if (!bearer) {
      setState("idle")
      setError("Your sign-in expired. Request a new link.")
      return
    }
    const response = await fetch("/api/manage/product", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${bearer}` },
      body: JSON.stringify(payload),
    })
    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      setState("idle")
      setError(result.error || "Could not save.")
      return
    }
    setState("saved")
    setTimeout(() => setState("idle"), 2000)
  }

  const totalClicks = offers.reduce((total, item) => total + item.click_count, 0)

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#fafafa] font-sans text-[#111]">
      <div className="flex min-h-screen flex-col items-center">
        <MarketplaceFrame wide>
          <Header />
          <main className="relative z-10 mt-28 flex w-full flex-col items-center">

            <FramedSection contentClassName="px-5 py-9 sm:px-8 sm:py-12">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Private management</p>
                  <h1 className="mt-3 font-serif text-[32px] leading-[1.05] tracking-[-0.04em] text-[#111] sm:text-[40px]">{product.name}</h1>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#999]">{product.registrable_domain}</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[rgba(55,50,47,.1)]">
                  <HeadStat value={offers.length} label="Answers" />
                  <HeadStat value={totalClicks} label="Clicks · lifetime" last />
                </div>
              </div>
            </FramedSection>

            <FramedSection contentClassName="py-0">
              <div className="grid gap-px bg-[rgba(55,50,47,0.12)] lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)]">

                <section className="bg-[#fafafa] px-5 py-6 sm:px-6">
                  <h2 className="font-serif text-[21px] tracking-[-0.02em] text-[#111]">Your product</h2>
                  <p className="mt-1.5 text-[11px] leading-4 text-[#888]">
                    The domain is fixed. Everything else appears on every answer you have written.
                  </p>
                  <form className="mt-4 space-y-3.5" onSubmit={save}>
                    <FormField label="Name">
                      <TextInput name="name" defaultValue={product.name} required maxLength={80} />
                    </FormField>
                    <FormField label="One line about the product">
                      <TextArea name="tagline" defaultValue={product.tagline} required minLength={3} maxLength={180} rows={2} />
                    </FormField>
                    <FormField label="Where the link goes">
                      <TextInput name="url" type="url" defaultValue={product.destination_url} required maxLength={2048} />
                    </FormField>
                    <div className="flex items-center gap-3">
                      <button
                        disabled={state === "saving"}
                        className="inline-flex h-10 items-center gap-2 bg-[#111] px-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#ef4e37] disabled:opacity-60"
                      >
                        {state === "saving" ? <LoaderCircle size={12} className="animate-spin" /> : state === "saved" ? <Check size={12} /> : null}
                        {state === "saved" ? "Saved" : "Save"}
                      </button>
                      {error ? <p className="text-[11px] text-red-700">{error}</p> : null}
                    </div>
                  </form>
                </section>

                <section className="bg-[#fafafa] px-5 py-6 sm:px-6">
                  <h2 className="font-serif text-[21px] tracking-[-0.02em] text-[#111]">Problems you have answered</h2>
                  {offers.length ? (
                    <div className="mt-4 grid gap-px border border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)]">
                      {offers.map((offer) => (
                        <article key={offer.offer_id} className="bg-white px-4 py-3.5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <Link
                              href={`/problems/${offer.problem_slug}`}
                              className="max-w-lg text-[13px] font-medium leading-5 text-[#111] underline-offset-2 hover:underline"
                            >
                              {offer.problem_statement}
                            </Link>
                            {offer.verified ? (
                              <span className="inline-flex shrink-0 items-center gap-1 bg-[#fff0eb] px-1.5 py-0.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#d84d37]">
                                <BadgeCheck size={9} /> Verified
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 text-[12px] leading-5 text-[#666]">{offer.solves_text}</p>
                          {offer.switch_incentive ? (
                            <p className="mt-1.5 text-[11px] leading-4 text-[#8a857e]">Switch offer: {offer.switch_incentive}</p>
                          ) : null}
                          <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.1em] text-[#aaa]">
                            {offer.status === "active" ? "Live" : offer.status}
                            <span className="text-[#ddd]"> · </span>
                            {offer.click_count.toLocaleString("en-US")} {offer.click_count === 1 ? "click" : "clicks"}
                          </p>
                        </article>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-5 py-8 text-center">
                      <p className="font-serif text-[19px] tracking-[-0.02em] text-[#111]">You have not answered anything yet.</p>
                      <Link href="/#problems" className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#d84d37] underline underline-offset-4">
                        Find a problem you solve <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  )}
                </section>
              </div>
            </FramedSection>
          </main>
        </MarketplaceFrame>
      </div>
    </div>
  )
}

function HeadStat({ value, label, last = false }: { value: number; label: string; last?: boolean }) {
  return (
    <p className={last ? "pl-4" : "pr-4"}>
      <span className="block font-serif text-[26px] leading-none tabular-nums text-[#111]">{value.toLocaleString("en-US")}</span>
      <span className="mt-1.5 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#999]">{label}</span>
    </p>
  )
}
