import type { ReactNode } from "react"
import { Eye, Flame, MousePointerClick, Swords } from "lucide-react"
import type { ProblemDetail } from "@/types/marketplace"

export function ProblemMetrics({ problem }: { problem: ProblemDetail }) {
  return (
    <div className="mt-7 grid grid-cols-2 gap-px border-y border-[rgba(55,50,47,0.12)] bg-[rgba(55,50,47,0.12)] sm:grid-cols-4">
      <Metric icon={<Flame size={12} />} value={problem.support_count} label="have this problem" accent />
      <Metric icon={<Eye size={12} />} value={problem.impression_count} label="solution impressions" />
      <Metric icon={<MousePointerClick size={12} />} value={problem.click_count} label="solution clicks" />
      <Metric icon={<Swords size={12} />} value={problem.competitor_count} label="products competing" />
    </div>
  )
}

function Metric({ icon, value, label, accent = false }: { icon: ReactNode; value: number; label: string; accent?: boolean }) {
  return (
    <div className="group relative overflow-hidden bg-[#fafafa] px-3 py-3.5 transition-colors duration-300 ease-out hover:bg-white sm:px-4 sm:py-4">
      <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 ${accent ? "bg-[#ef654f]" : "bg-[rgba(55,50,47,.18)]"}`} />
      <span className={`block transition-colors duration-300 ${accent ? "text-[#d84d37]" : "text-[#c4c0ba] group-hover:text-[#8a857e]"}`}>{icon}</span>
      <p className={`mt-1.5 font-serif text-[23px] leading-none tracking-[-0.04em] tabular-nums ${accent ? "text-[#db4e38]" : "text-[#111]"}`}>
        {value.toLocaleString("en-US")}
      </p>
      <p className="mt-1.5 font-mono text-[7px] uppercase tracking-[0.12em] text-[#8a857e]">{label}</p>
    </div>
  )
}
