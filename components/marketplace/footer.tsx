import Image from "next/image"
import Link from "next/link"
import { PostProblemModal } from "@/components/marketplace/post-problem-modal"

export function Footer() {
  return (
    <footer className="w-full font-sans">
      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#111] px-6 py-12 text-center sm:py-12">
        <div className="relative z-10 flex max-w-2xl flex-col items-center">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
            <span className="size-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-medium tracking-wide text-white">Free to post</span>
          </div>
          <h2 className="font-serif text-[42px] leading-[1.02] tracking-[-0.04em] text-white sm:text-[56px] lg:text-[60px]">
            Didn&apos;t find yours?<br />Call it out.
          </h2>
          <p className="mb-9 mt-6 max-w-xl text-[1rem] leading-7 text-white/55">
            Name the software that is failing you and what would make you switch. Others pile on with ME TOO, and alternatives can respond with how they&apos;d fix it.
          </p>
          <PostProblemModal inverted trigger="CALL IT OUT" />
        </div>
      </section>

      {/* As Seen On Badges Section */}
      <section className="border-t border-[rgba(55,50,47,0.12)] bg-[#fafafa]">
        <div className="border-b border-[rgba(55,50,47,0.12)] px-6 py-2.5 sm:px-8">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-[#888] text-center">
            As seen on
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px bg-[rgba(55,50,47,0.12)] sm:grid-cols-3 md:grid-cols-5">
          <a
            href="https://maidensail.com/startup/fixthis"
            target="_blank"
            rel="dofollow"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://maidensail.com/badge/fixthis.svg"
              alt="Featured on Maidensail"
              loading="lazy"
              className="max-h-6 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://findly.tools/fixthis?utm_source=fixthis"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://findly.tools/badges/findly-tools-badge-light.svg"
              alt="Featured on Findly.tools"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://startupscrolls.com/projects/fixthis-lol?utm_source=badge"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://startupscrolls.com/startupscrolls/images/badges/featured-on-light.svg"
              alt="Featured on Startup Scrolls"
              loading="lazy"
              className="max-h-6 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://startupbase.io/products/fixthis?utm_source=startupbase&utm_medium=badge&utm_campaign=featured-badge-neutral"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://statics.startupbase.io/site/badges/featured-on-sb-neutral.svg"
              alt="Featured on StartupBase"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://www.betterlaunch.co/product/fixthis"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.betterlaunch.co/badge-find-light.svg"
              alt="Better Launch"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://nicklaunches.com/products/fixthis/?utm_source=fixthis.lol&utm_medium=badge&utm_campaign=featured"
            target="_blank"
            rel="noopener"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://nicklaunches.com/badges/featured.png"
              alt="FIXTHIS on Nick Launches"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://launchstag.com"
            target="_blank"
            rel="noopener"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://launchstag.com/badge-light.svg"
              alt="Featured on Launchstag"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://www.foundrlist.com/product/fixthis?utm_source=badge&utm_medium=embed"
            target="_blank"
            rel="noopener"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://www.foundrlist.com/api/badge/fixthis"
              alt="Featured on FoundrList"
              loading="lazy"
              className="max-h-6 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <a
            href="https://submithunt.com"
            target="_blank"
            rel="noopener"
            className="group flex h-14 items-center justify-center bg-white p-2.5 transition-colors duration-200 hover:bg-[#fff9f7]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://submithunt.com/badge-light.svg"
              alt="Featured on Submit Hunt"
              loading="lazy"
              className="max-h-7 max-w-[125px] w-auto object-contain transition-transform duration-200 ease-out group-hover:scale-[1.03]"
            />
          </a>

          <div className="flex h-14 items-center justify-center bg-white p-2.5 text-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#aaa]">
            </span>
          </div>
        </div>
      </section>

      <div className="grid border-t border-[rgba(55,50,47,0.12)] bg-[#f9f8f7] md:grid-cols-12">
        <div className="p-8 md:col-span-5 md:border-r md:border-[rgba(55,50,47,0.12)] md:p-12">
          <div className="mb-5 flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-full border border-[rgba(55,50,47,.08)] bg-[#fafafa]">
              <Image src="/fixthis-logo.webp" alt="" width={29} height={29} />
            </div>
            <span className="font-serif text-[1.35rem] text-[#111]">FIXTHIS.LOL</span>
          </div>
          <p className="max-w-xs text-[13px] leading-6 text-[#888]">
            The public board where people call out the software failing them, and alternatives respond with how they&apos;d fix it.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 border-t border-[rgba(55,50,47,0.12)] p-8 md:col-span-7 md:border-t-0 md:p-12">
          <div>
            <h3 className="font-serif text-[14px] text-[#111]">Product</h3>
            <ul className="mt-4 space-y-2 text-[13px] text-[#888]">
              <li>
                <Link href="/#problems" className="hover:text-[#111]">Problem board</Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#111]">How it works</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-[14px] text-[#111]">Legal</h3>
            <ul className="mt-4 space-y-2 text-[13px] text-[#888]">
              <li>
                <Link href="/privacy-policy" className="hover:text-[#111]">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#111]">Terms of Service</Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-[#111]">Refund Policy</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[rgba(55,50,47,0.12)] bg-[#f9f8f7] px-8 py-6 sm:flex-row">
        <p className="font-mono text-[10px] tracking-wide text-[#aaa]">© 2026 FIXTHIS.LOL</p>
        <div className="flex items-center gap-2 rounded-full border border-[rgba(55,50,47,.07)] bg-white px-3 py-1.5">
          <span className="size-1.5 rounded-full bg-[#ef4e37]" />
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#777]">Independent marketplace</span>
        </div>
      </div>
    </footer>
  )
}
