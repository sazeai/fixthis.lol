import Link from "next/link"
import { PostProblemModal } from "@/components/marketplace/post-problem-modal"

function Mark() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="2 2" /><circle cx="12" cy="12" r="2.5" fill="currentColor" /><circle cx="12" cy="4.5" r="1.5" fill="#ef4e37" /><circle cx="12" cy="19.5" r="1.5" fill="currentColor" /><circle cx="4.5" cy="12" r="1.5" fill="currentColor" /><circle cx="19.5" cy="12" r="1.5" fill="currentColor" /><path d="M12 7v2.5M12 14.5V17M7 12h2.5M14.5 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg> }

export function Header() {
  return (
    <nav className="absolute top-8 z-40 flex w-full items-center justify-center px-3">
      <div className="absolute left-0 top-1/2 -z-10 h-px w-full -translate-y-1/2 bg-[rgba(55,50,47,0.12)]" />
      <div className="flex w-full max-w-[calc(100%-16px)] items-center rounded-full border border-black/5 bg-[#efefef]/85 p-1 backdrop-blur-md sm:w-auto sm:max-w-[calc(100%-24px)]">
        <Link href="/" aria-label="FIXTHIS home" className="group flex shrink-0 items-center gap-2 rounded-full px-1.5 py-1 text-[#111] transition-colors hover:bg-white/60">
          <span className="grid size-9 place-items-center rounded-full border border-[rgba(55,50,47,0.08)] bg-[#fafafa] transition-transform group-hover:scale-105"><Mark /></span>
          <span className="text-[12px] font-extrabold tracking-[-0.04em] sm:text-[13px]">FIXTHIS</span>
        </Link>
        <div className="ml-auto flex min-w-0 items-center gap-1.5 text-[12px] font-medium text-[#555] sm:ml-0 sm:gap-3 sm:px-1 md:gap-6 md:px-3">
          <Link href="/#problems" className="rounded-full border border-[rgba(55,50,47,0.08)] bg-white/50 px-3 py-2 transition-colors hover:bg-white hover:text-[#111] sm:border-0 sm:bg-transparent sm:px-0 sm:py-1">Problems</Link>
          <Link href="/#how-it-works" className="hidden transition-colors hover:text-[#111] md:block">How it works</Link>
          <div className="mx-1 hidden h-4 w-px bg-[rgba(55,50,47,0.12)] sm:block" />
          <PostProblemModal compact trigger="POST PROBLEM" />
        </div>
      </div>
    </nav>
  )
}
