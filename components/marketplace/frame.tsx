import type { ReactNode } from "react"

const RAIL_PATTERN = "repeating-linear-gradient(-45deg, transparent 0, transparent 10px, rgba(3,7,18,.07) 10.5px, rgba(3,7,18,.07) 11px)"

export function MarketplaceFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className={`relative flex w-full flex-col items-center px-2 sm:px-6 md:px-8 lg:px-0 ${wide ? "lg:max-w-[1200px] lg:w-[1200px]" : "lg:max-w-[1000px] lg:w-[1000px]"}`}>
      <div className="absolute bottom-0 left-2 top-0 z-0 w-px bg-[rgba(55,50,47,0.12)] shadow-[1px_0_0_white] sm:left-6 md:left-8 lg:left-0" />
      <div className="absolute bottom-0 right-2 top-0 z-0 w-px bg-[rgba(55,50,47,0.12)] shadow-[1px_0_0_white] sm:right-6 md:right-8 lg:right-0" />
      {children}
    </div>
  )
}

function PatternRail({ extendTop = false }: { extendTop?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="relative w-4 shrink-0 self-stretch sm:w-6 md:w-8 lg:w-12"
      style={{ backgroundImage: RAIL_PATTERN }}
    >
      {extendTop ? <span className="absolute -top-[52px] left-0 h-[52px] w-full" style={{ backgroundImage: RAIL_PATTERN }} /> : null}
    </div>
  )
}

export function FramedSection({ children, className = "", contentClassName = "", extendRailTop = false }: { children: ReactNode; className?: string; contentClassName?: string; extendRailTop?: boolean }) {
  return (
    <div className={`relative z-10 -mt-px flex w-full items-stretch justify-center ${className}`}>
      <PatternRail extendTop={extendRailTop} />
      <div className={`min-w-0 flex-1 border-x border-[rgba(55,50,47,0.12)] ${contentClassName}`}>{children}</div>
      <PatternRail extendTop={extendRailTop} />
    </div>
  )
}
