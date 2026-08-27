export function DetailBlockHeader({ label, aside }: { label: string; aside?: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[rgba(55,50,47,0.12)] bg-[#f4f2f0] px-3 py-2.5 sm:px-5 sm:py-3">
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#d84d37]">{label}</p>
      {aside ? <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#999]">{aside}</p> : null}
    </div>
  )
}
