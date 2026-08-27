import "server-only"

import { createClient, type User } from "@supabase/supabase-js"

function getAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  return createClient(url, key, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  })
}

/** Verify the access token sent by the browser; never trust client-supplied identity fields. */
export async function getAuthenticatedUser(request: Request): Promise<User | null> {
  const authorization = request.headers.get("authorization") || ""
  const match = authorization.match(/^Bearer\s+(\S+)$/i)
  if (!match) return null

  const client = getAuthClient()
  if (!client) {
    console.error("Supabase authentication is not configured")
    return null
  }

  try {
    const { data, error } = await client.auth.getUser(match[1])
    return error || !data.user?.email ? null : data.user
  } catch (error) {
    console.error("Supabase access-token verification failed", error)
    return null
  }
}
