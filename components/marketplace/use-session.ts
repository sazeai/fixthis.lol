"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabaseBrowserClient } from "@/utils/supabase/client"

export type SessionState = {
  /** null once checked and signed out; undefined while still checking. */
  email: string | null
  /** False until the first getSession settles, so nothing flashes a signed-out state. */
  checked: boolean
}

/**
 * One source of truth for who is signed in.
 *
 * This used to live inline in the post-problem modal, which was fine when
 * posting a problem was the only thing that needed an account. Three surfaces
 * need it now — posting, writing a complaint detail, and answering as a product
 * — and each one growing its own copy of the listener is how sign-in states
 * start disagreeing with each other on the same page.
 */
export function useSession(): SessionState {
  const [email, setEmail] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let active = true
    let subscription: { unsubscribe: () => void } | null = null

    try {
      const supabase = getSupabaseBrowserClient()
      supabase.auth.getSession()
        .then(({ data }) => {
          if (!active) return
          setEmail(data.session?.user.email || null)
          setChecked(true)
        })
        .catch(() => { if (active) setChecked(true) })

      subscription = supabase.auth.onAuthStateChange((_event, session) => {
        if (!active) return
        setEmail(session?.user.email || null)
        setChecked(true)
      }).data.subscription
    } catch {
      setChecked(true)
    }

    return () => { active = false; subscription?.unsubscribe() }
  }, [])

  return { email, checked }
}

/**
 * The access token for a request that must be authenticated.
 *
 * Always read fresh rather than held in state: a token cached at mount is a
 * token that has quietly expired by the time someone finishes typing. Returns
 * null when there is no live session, which the caller should surface as "your
 * sign-in expired" rather than as a failure.
 */
export function useAccessToken() {
  return useCallback(async () => {
    try {
      const { data } = await getSupabaseBrowserClient().auth.getSession()
      return data.session?.access_token || null
    } catch {
      return null
    }
  }, [])
}

export async function signOutBrowser() {
  await getSupabaseBrowserClient().auth.signOut()
}
