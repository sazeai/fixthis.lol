"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"
import { signOutBrowser, useAccessToken, useSession } from "@/components/marketplace/use-session"

type OwnedProduct = { id: string; name: string; slug: string | null }

/**
 * One account, two hats.
 *
 * FIXTHIS has two audiences and they kept bleeding into each other — the
 * complaint that started the whole pivot was a reader being handed the
 * advertiser's view. The fix is not two logins: a founder here is also someone
 * who pays for software and complains about it, so making them pick a side at
 * signup would be a lie about who they are.
 *
 * Instead there is one account, and a context switch that only appears once the
 * account has actually claimed a product. Until then there is no second hat to
 * wear and nothing is shown, which keeps the board clean for the people who are
 * only ever going to be readers.
 */
export function AccountSwitch() {
  const session = useSession()
  const getToken = useAccessToken()
  const [products, setProducts] = useState<OwnedProduct[] | null>(null)
  const [busy, setBusy] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    let active = true
    if (!session.checked || !session.email) { setProducts(null); return }
    getToken().then(async (token) => {
      if (!token || !active) return
      try {
        const response = await fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
        const result = await response.json()
        if (active) setProducts(result.products || [])
      } catch { if (active) setProducts([]) }
    })
    return () => { active = false }
  }, [session.checked, session.email, getToken])

  if (!session.checked || !session.email) return null

  const owns = (products?.length ?? 0) > 0
  const inProductMode = pathname.startsWith("/dashboard")

  async function signOut() {
    setBusy(true)
    try {
      await signOutBrowser()
      router.refresh()
    } finally { setBusy(false) }
  }

  return (
    <div className="flex items-center gap-2">
      {owns ? (
        <div className="flex items-center rounded-full bg-[rgba(55,50,47,.07)] p-0.5" role="group" aria-label="Switch view">
          <Hat href="/#problems" active={!inProductMode}>Browse</Hat>
          <Hat href="/dashboard" active={inProductMode}>My product</Hat>
        </div>
      ) : null}

      <button
        type="button"
        onClick={signOut}
        disabled={busy}
        title={session.email}
        className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.1em] text-[#a8a39c] transition-colors hover:text-[#111] disabled:opacity-60"
      >
        {busy ? <HugeiconsIcon icon={Loading03Icon} size={10} className="animate-spin" /> : null}
        Sign out
      </button>
    </div>
  )
}

function Hat({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.1em] transition-colors ${
        active ? "bg-white text-[#111] shadow-[0_1px_2px_rgba(55,50,47,.12)]" : "text-[#8a857e] hover:text-[#111]"
      }`}
    >
      {children}
    </Link>
  )
}
