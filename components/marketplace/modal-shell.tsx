"use client"

import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

export function ModalShell({ open, onClose, children, labelledBy, chromeLabel }: {
  open: boolean
  onClose: () => void
  children: ReactNode
  labelledBy: string
  chromeLabel?: string
}) {
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#111]/55 p-0 backdrop-blur-[3px] sm:items-center sm:p-6" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="max-h-[100dvh] w-full overflow-y-auto border border-[rgba(55,50,47,0.14)] bg-[#fafafa] text-left shadow-[0_24px_80px_rgba(17,17,17,0.18)] sm:max-h-[92vh] sm:max-w-[540px]">
        <div className="sticky top-0 z-10 flex h-12 items-center justify-between border-b border-[rgba(55,50,47,0.12)] bg-[#fafafa]/95 px-5 backdrop-blur">
          {chromeLabel ? <span className="flex items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[#77726a]"><span className="size-1.5 rounded-full bg-[#ef4e37]" />{chromeLabel}</span> : <span />}
          <button type="button" onClick={onClose} aria-label="Close" className="grid size-8 place-items-center rounded-full text-[#a8a39c] transition-colors hover:bg-[rgba(55,50,47,.06)] hover:text-[#111]">
            <X size={16} />
          </button>
        </div>
        {children}
      </section>
    </div>,
    document.body,
  )
}
