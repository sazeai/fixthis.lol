import type { Metadata } from "next"
import { DashboardClient } from "@/components/marketplace/dashboard-client"

export const dynamic = "force-dynamic"
export const metadata: Metadata = {
  title: "Your product",
  robots: { index: false, follow: false },
}

/**
 * The "My product" hat.
 *
 * A thin server shell: the session lives in the browser, so everything real
 * happens client-side against /api/me. The emailed /manage/[token] route still
 * works and is still the way in for anyone who has not signed in — this is the
 * version for people who have.
 */
export default function DashboardPage() {
  return <DashboardClient />
}
