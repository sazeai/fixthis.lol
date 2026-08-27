import { ArrowUpRight } from "lucide-react"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemEvidence({ problem }: { problem: ProblemDetail }) {
  return (
    <div className="grid gap-7 lg:grid-cols-2 lg:gap-8">
      <section>
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">What specifically sucks</p>
        <h2 className="mt-1.5 font-serif text-[21px] tracking-[-0.02em] text-[#111]">Details from people who agree</h2>
        <div className="mt-3 space-y-1.5">
          {problem.complaints.length ? problem.complaints.map((item) => (
            <blockquote key={item.id} className="border-l-2 border-[#ef654f] bg-white px-3 py-2.5 text-[12px] leading-5 text-[#555]">
              “{item.detail}”
            </blockquote>
          )) : (
            <p className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-4 py-7 text-[11px] text-[#888]">
              No one has added a specific detail yet.
            </p>
          )}
        </div>
      </section>

      <section className="lg:border-l lg:border-[rgba(55,50,47,0.12)] lg:pl-8">
        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">Research provenance</p>
        <h2 className="mt-1.5 font-serif text-[21px] tracking-[-0.02em] text-[#111]">This problem has receipts</h2>
        <p className="mt-2.5 text-[11px] leading-5 text-[#888]">
          Curated problems are rewritten from public discussions, never presented as private testimonials.
        </p>
        <div className="mt-3 space-y-1.5">
          {problem.sources.length ? problem.sources.map((source) => (
            <a
              key={source.id}
              href={source.source_url}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="group flex items-center justify-between gap-3 border border-[rgba(55,50,47,0.12)] bg-white px-3 py-2.5 text-[11px] text-[#555] transition-colors duration-200 hover:border-[#777] hover:text-[#111]"
            >
              <span className="truncate">{source.source_label}</span>
              <ArrowUpRight size={12} className="shrink-0 text-[#c4c0ba] transition-all duration-200 ease-out group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-[#ef4e37]" />
            </a>
          )) : (
            <p className="border border-dashed border-[rgba(55,50,47,0.16)] bg-[#fafafa] px-4 py-7 text-[11px] text-[#888]">
              This problem was submitted directly to FIXTHIS.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
