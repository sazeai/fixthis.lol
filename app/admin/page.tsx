import type { ReactNode } from "react"
import { AdminActionButton } from "@/components/marketplace/admin-action-button"
import { ClaimGrantForm, RevokeGrantButton } from "@/components/marketplace/claim-grant-form"
import { loginAdmin } from "@/app/admin/actions"
import { isAdminAuthenticated } from "@/lib/marketplace/admin-auth"
import { getAdminComplaints, getAdminMarketplaceData, getClaimGrants } from "@/lib/marketplace/queries"

export const dynamic = "force-dynamic"
export const metadata = { title: "Admin", robots: { index: false, follow: false } }

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const query = await searchParams

  if (!await isAdminAuthenticated()) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fafafa] p-5 font-sans text-[#111]">
        <form action={loginAdmin} className="w-full max-w-sm border border-[rgba(55,50,47,0.12)] bg-white p-7">
          <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#de422a]">Restricted</p>
          <h1 className="mt-3 font-serif text-[28px] leading-none tracking-[-0.04em] text-[#111]">FIXTHIS admin</h1>
          <input
            name="password"
            type="password"
            required
            autoFocus
            placeholder="Admin password"
            className="mt-6 h-11 w-full border border-[rgba(55,50,47,0.12)] bg-[#fafafa] px-3 text-[14px] text-[#111] outline-none transition placeholder:text-[#bbb] focus:border-[#777]"
          />
          {query.error ? <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">Wrong password.</p> : null}
          <button className="mt-4 h-11 w-full bg-[#111] text-[10px] font-bold uppercase tracking-[0.1em] text-white transition-colors duration-200 ease-out hover:bg-[#ef4e37] active:scale-[0.99]">
            Enter
          </button>
        </form>
      </main>
    )
  }

  const [{ problems, offers }, complaints, grants] = await Promise.all([getAdminMarketplaceData(), getAdminComplaints(), getClaimGrants()])
  const pendingComplaints = complaints.filter((complaint) => complaint.detail_status === "pending")
  const published = problems.filter((problem) => problem.status === "published")
  const pending = problems.filter((problem) => problem.status === "pending")
  const activeOffers = offers.filter((offer) => offer.status === "active")
  const totalDemand = problems.reduce((total, problem) => total + problem.support_count, 0)

  return (
    <main className="min-h-screen bg-[#fafafa] px-5 py-10 font-sans text-[#111] sm:px-8">
      <div className="mx-auto max-w-[1240px]">

        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[rgba(55,50,47,0.12)] pb-7">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#de422a]">Market operations</p>
            <h1 className="mt-3 font-serif text-[36px] leading-none tracking-[-0.04em] text-[#111] sm:text-[44px]">Control room.</h1>
            <p className="mt-3 text-[13px] text-[#777]">Moderation, answers, and honest counts.</p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-[rgba(55,50,47,.1)] sm:grid-cols-5">
            <HeadStat value={published.length} label="Published" />
            <HeadStat value={pending.length} label="Pending" middle accent={pending.length > 0} />
            <HeadStat value={activeOffers.length} label="Live answers" middle />
            <HeadStat value={pendingComplaints.length} label="Complaints to review" middle accent={pendingComplaints.length > 0} />
            <HeadStat value={totalDemand} label="Total demand" last />
          </div>
        </header>

        <Section title={`Problems · ${problems.length}`} blurb="Pending rows are not public and may be legacy submissions or items held for administrator review.">
          <div className="overflow-x-auto border border-[rgba(55,50,47,0.12)] bg-white">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
                  {["Problem", "Origin", "Demand", "Clicks", "Status", ""].map((label) => (
                    <th key={label} className="px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id} className="border-b border-[rgba(55,50,47,0.08)] transition-colors duration-200 last:border-0 hover:bg-[#fafafa]">
                    <td className="max-w-md px-4 py-3 text-[12px] font-medium text-[#111]">{problem.statement}</td>
                    <td className="px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#999]">{problem.origin}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#555]">{problem.support_count.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-[#555]">{problem.click_count.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3"><StatusPill status={problem.status} /></td>
                    <td className="px-4 py-3">
                      {problem.status === "published"
                        ? <AdminActionButton entity="problem" id={problem.id} action="hide" />
                        : <AdminActionButton entity="problem" id={problem.id} action="publish" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title={`Complaint details · ${complaints.length}`} blurb="One moderated sentence per supporter. Pending details are not public until approved.">
          {complaints.length ? (
            <div className="border border-[rgba(55,50,47,0.12)] bg-white">
              {complaints.map((complaint) => (
                <div key={complaint.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-[rgba(55,50,47,0.08)] p-4 transition-colors duration-200 last:border-0 hover:bg-[#fafafa]">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] leading-6 text-[#333]">“{complaint.detail}”</p>
                    <p className="mt-1.5 truncate font-mono text-[8px] uppercase tracking-[0.1em] text-[#aaa]">on “{complaint.problem_statement}”</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={complaint.detail_status} />
                    {complaint.detail_status === "published"
                      ? <AdminActionButton entity="complaint" id={complaint.id} action="hide" />
                      : <AdminActionButton entity="complaint" id={complaint.id} action="publish" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-6 py-12 text-center text-[13px] text-[#888]">
              No one has added a complaint detail yet.
            </p>
          )}
        </Section>

        <Section
          title="Verify a founder by hand"
          blurb="Normally a founder proves their product by signing in from an address at its domain. This is for the ones who cannot — gmail, an agency address, a domain they do not run mail on. Once redeemed, the grant owns the product until you revoke it. Revocation removes access and any badge that depended on the manual check; it does not delete their answers."
        >
          <ClaimGrantForm />

          {grants.length ? (
            <div className="mt-4 overflow-x-auto border border-[rgba(55,50,47,0.12)] bg-white">
              <table className="w-full min-w-[880px] text-left">
                <thead>
                  <tr className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
                    {["Email", "Domain", "Why", "Badge", "State", ""].map((label) => (
                      <th key={label} className="px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {grants.map((grant) => (
                    <tr key={grant.id} className={`border-b border-[rgba(55,50,47,0.08)] transition-colors duration-200 last:border-0 hover:bg-[#fafafa] ${grant.revoked_at ? "opacity-50" : ""}`}>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#555]">{grant.email}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#111]">{grant.registrable_domain}</td>
                      <td className="max-w-sm px-4 py-3 text-[12px] text-[#666]">{grant.note}</td>
                      <td className="px-4 py-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[#888]">
                        {grant.verified ? "verified" : "unmarked"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusPill status={grant.revoked_at ? "revoked" : grant.redeemed_at ? "redeemed" : "unused"} />
                      </td>
                      <td className="px-4 py-3">
                        {grant.revoked_at ? null : <RevokeGrantButton id={grant.id} />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Section>

        <Section title={`Answers · ${offers.length}`} blurb="What products have said they can fix. Hiding an answer removes it from the problem page immediately.">
          {offers.length ? (
            <div className="overflow-x-auto border border-[rgba(55,50,47,0.12)] bg-white">
              <table className="w-full min-w-[1040px] text-left">
                <thead>
                  <tr className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
                    {["Product", "Problem", "How they solve it", "Clicks", "Contact", "Status", ""].map((label) => (
                      <th key={label} className="px-4 py-2.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer.offer_id} className="border-b border-[rgba(55,50,47,0.08)] transition-colors duration-200 last:border-0 hover:bg-[#fafafa]">
                      <td className="px-4 py-3 text-[12px] font-semibold text-[#111]">
                        {offer.name}
                        {offer.verified ? <span className="ml-1.5 font-mono text-[8px] uppercase tracking-[0.1em] text-[#de422a]">verified</span> : null}
                      </td>
                      <td className="max-w-xs px-4 py-3 text-[12px] text-[#666]">{offer.problem_statement}</td>
                      <td className="max-w-sm px-4 py-3 text-[12px] text-[#666]">{offer.solves_text}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-[#555]">{offer.click_count.toLocaleString("en-US")}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-[#888]">{offer.owner_email || "—"}</td>
                      <td className="px-4 py-3"><StatusPill status={offer.status} /></td>
                      <td className="px-4 py-3">
                        {offer.status === "active"
                          ? <AdminActionButton entity="offer" id={offer.offer_id} action="suspend" />
                          : <AdminActionButton entity="offer" id={offer.offer_id} action="restore" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-6 py-12 text-center text-[13px] text-[#888]">
              No product has answered a problem yet.
            </p>
          )}
        </Section>

      </div>
    </main>
  )
}

function Section({ title, blurb, children }: { title: string; blurb: string; children: ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-[22px] tracking-[-0.02em] text-[#111]">{title}</h2>
      <p className="mt-1.5 text-[12px] text-[#888]">{blurb}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function HeadStat({ value, label, middle = false, last = false, accent = false }: { value: number; label: string; middle?: boolean; last?: boolean; accent?: boolean }) {
  return (
    <p className={middle ? "px-4" : last ? "pl-4" : "pr-4"}>
      <span className={`block font-serif text-[22px] leading-none tracking-[-0.03em] ${accent ? "text-[#db4e38]" : "text-[#111]"}`}>
        {value.toLocaleString("en-US")}
      </span>
      <span className="mt-1.5 block font-mono text-[7px] uppercase tracking-[0.12em] text-[#999]">{label}</span>
    </p>
  )
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "published" || status === "active" || status === "redeemed"
    ? "bg-[#eef7f0] text-[#2f7d4f]"
    : status === "pending" || status === "unused"
      ? "bg-[#fff0eb] text-[#de422a]"
      : "bg-[rgba(55,50,47,.06)] text-[#888]"
  return <span className={`inline-flex items-center px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] ${tone}`}>{status}</span>
}
