"use client"

import { useEffect, useId, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

type CategoryFilterProps = {
  categories: string[]
  value: string
  onChange: (category: string) => void
}

export function CategoryFilter({ categories, value, onChange }: CategoryFilterProps) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => Math.max(categories.indexOf(value), 0))
  const rootRef = useRef<HTMLDivElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const listboxId = useId()

  const selectedIndex = Math.max(categories.indexOf(value), 0)

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("pointerdown", closeOnOutsideClick)
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    optionRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  function openMenu(index = selectedIndex) {
    setActiveIndex(index)
    setOpen(true)
  }

  function choose(category: string) {
    onChange(category)
    rootRef.current?.querySelector<HTMLButtonElement>("#problem-category")?.focus()
    setOpen(false)
  }

  function moveActive(amount: number) {
    setActiveIndex((current) => (current + amount + categories.length) % categories.length)
  }

  return (
    <div ref={rootRef} className="relative h-full">
      <button
        id="problem-category"
        type="button"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault()
            openMenu(Math.min(selectedIndex + 1, categories.length - 1))
          }
          if (event.key === "ArrowUp") {
            event.preventDefault()
            openMenu(Math.max(selectedIndex - 1, 0))
          }
        }}
        className="group flex h-12 w-full min-w-0 items-center justify-between gap-8 bg-transparent pl-5 pr-5 text-left font-mono text-[10px] uppercase tracking-[0.1em] text-[#77726a] outline-none transition-colors hover:bg-[#fdfcfb] hover:text-[#111] focus-visible:bg-[#fdfcfb] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#ef4e37] sm:min-w-[220px] sm:pl-7 sm:pr-6"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          size={13}
          aria-hidden="true"
          className={`shrink-0 text-[#c4c0ba] transition-transform duration-200 group-hover:text-[#77726a] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-40 border border-t-0 border-[rgba(55,50,47,0.22)] bg-[#fdfcfb] shadow-[0_10px_24px_rgba(45,40,36,0.1)]">
          <div id={listboxId} role="listbox" aria-label="Filter by category" className="max-h-[min(390px,65vh)] overflow-y-auto overscroll-contain py-1">
            {categories.map((category, index) => {
              const selected = category === value
              const active = index === activeIndex

              return (
                <button
                  key={category}
                  ref={(node) => { optionRefs.current[index] = node }}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={active ? 0 : -1}
                  onPointerMove={() => setActiveIndex(index)}
                  onClick={() => choose(category)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowDown") {
                      event.preventDefault()
                      moveActive(1)
                    } else if (event.key === "ArrowUp") {
                      event.preventDefault()
                      moveActive(-1)
                    } else if (event.key === "Home") {
                      event.preventDefault()
                      setActiveIndex(0)
                    } else if (event.key === "End") {
                      event.preventDefault()
                      setActiveIndex(categories.length - 1)
                    } else if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      choose(category)
                    } else if (event.key === "Escape") {
                      event.preventDefault()
                      setOpen(false)
                      rootRef.current?.querySelector<HTMLButtonElement>("#problem-category")?.focus()
                    } else if (event.key === "Tab") {
                      setOpen(false)
                    }
                  }}
                  className={`group/option flex w-full items-center border-l-2 px-4 py-[7px] text-left outline-none transition-colors sm:px-5 ${
                    selected
                      ? "border-[#ef4e37] bg-[#fff3ef]"
                      : active
                        ? "border-[#c4c0ba] bg-[#f4f2f0]"
                        : "border-transparent hover:border-[#c4c0ba] hover:bg-[#f7f5f3]"
                  }`}
                >
                  <span className={`flex-1 font-mono text-[9px] uppercase tracking-[0.11em] ${selected ? "text-[#c94331]" : "text-[#5f5a54]"}`}>
                    {category}
                  </span>
                  {selected ? <Check size={11} aria-hidden="true" className="text-[#ef4e37]" /> : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
