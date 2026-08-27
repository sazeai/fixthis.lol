import type { ProblemDetail } from "@/types/marketplace"

export function ProblemComplaints({ problem }: { problem: ProblemDetail }) {
  return (
    <section className="border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">What specifically sucks</p>
        <h2 className="mt-1.5 font-serif text-[21px] tracking-[-0.02em] text-[#111]">Details from people who agree</h2>
        <div className="mt-3">
          {problem.complaints.length ? (
            <div className="grid gap-px border border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)] sm:grid-cols-2">
              {problem.complaints.map((item) => (
                <blockquote key={item.id} className="border-l-2 border-[#ef654f] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#555]">
                  “{item.detail}”
                </blockquote>
              ))}
            </div>
          ) : (
            <p className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-4 py-5 text-[11px] text-[#888]">
              No one has added a specific detail yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
