import type { Metadata } from "next"

import { LegalPage } from "@/components/marketplace/legal-page"

const description = "What FIXTHIS collects, why, how long we keep it, and what you can ask us to do about it."

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: "Privacy Policy", description, url: "/privacy-policy" },
  twitter: { title: "Privacy Policy", description },
}

const CONTACT = "support@fixthis.lol"

export default function PrivacyPolicy() {
  return <LegalPage
    eyebrow="LEGAL"
    title="Privacy policy."
    updated="August 28, 2026"
    intro="You can read the board, press ME TOO and browse solutions without an account and without telling us anything about yourself. We count visits with a random number stored in your browser, not a profile of you. We do not sell your data, we do not run ads, and we do not follow you around other websites."
  >
    <section>
      <h2>Who we are</h2>
      <p>FIXTHIS runs fixthis.lol and is responsible for the information described here. For anything at all about your privacy, or to ask us to do something with your data, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>
    </section>

    <section>
      <h2>What we collect and why</h2>

      <h3>Just visiting</h3>
      <p>The first time you arrive we put a random number in your browser, in a cookie called fixthis_visitor. It is not made from your name, your device or where you are. It identifies nobody, and we store it scrambled, in a form that cannot be turned back into the number in your browser.</p>
      <p>It does two things. It stops the same browser voting twice on the same problem, and it lets us count people honestly &mdash; the &ldquo;online&rdquo; and &ldquo;visitors / 24h&rdquo; figures on the homepage, and how many people saw or clicked a paid placement. Without it every number on this site would be guesswork. We rely on our legitimate interest in publishing counts that can be trusted.</p>
      <p>Like every website, we see your IP address while you are using the site. We use it for a moment to limit how often forms can be sent and to run the bot check, and then it is gone. <strong>We never store your IP address.</strong> It never appears in any public number, and it is never given to advertisers.</p>

      <h3>If you post a problem</h3>
      <p>You sign in with an email link, so we keep your email address and connect it to what you post. Anything published on the board needs to be traceable to someone.</p>

      <h3>If you press ME TOO or add a detail</h3>
      <p>We record that your browser voted on that problem, so it counts once and once only. If you write a detail about what specifically annoys you, it appears publicly after we review it, with no name attached.</p>

      <h3>If you ask to hear when a problem is solved</h3>
      <p>We keep your email address against that problem, and we only email you after you click to confirm. You can unsubscribe whenever you like.</p>

      <h3>If you pay to appear as a solution</h3>
      <p>We keep the email you use at checkout, your product name, tagline and link, what you bid, and a reference from our payment provider. We also save a copy of your site icon so we can display it ourselves. <strong>We never see your card details</strong> &mdash; those go straight to Dodo Payments.</p>

      <h3>If you report a problem</h3>
      <p>We record that your browser reported it, along with the reason and any note you add, so the same person cannot report the same thing over and over.</p>
    </section>

    <section>
      <h2>Cookies</h2>
      <p>No advertising cookies. No analytics service. No tracking pixels. No fingerprinting. Nothing that follows you to other sites. There are only these:</p>
      <p>fixthis_visitor &mdash; the random number above, which lasts a year.<br />
      A sign-in cookie, only if you sign in to post a problem.<br />
      A short-lived Cloudflare cookie when you submit a form, to check you are not a bot.<br />
      An admin cookie, only ever for us.</p>
      <p>We do not put a cookie banner in front of you for the visitor cookie, because it measures this one site, is never combined with anything else, and never leaves us. If you would still rather not be counted, block or delete it. The site works exactly the same &mdash; you simply will not be counted, and your votes will not be recognised as yours.</p>
    </section>

    <section>
      <h2>What other people can see</h2>
      <p>Public: problem statements, their category, how many people pressed ME TOO, the visitor counts, and which products are competing on a problem. A detail you add becomes public after review, without your name.</p>
      <p>Never public: your email address, payment details, IP address, anything you report to us, and our moderation notes. Advertisers see totals for their own placements and nothing about the people behind them.</p>
    </section>

    <section>
      <h2>Who else handles your data</h2>
      <p>Supabase stores our data and runs sign-in. Vercel hosts the site. Dodo Payments takes payments. Resend sends our emails. Cloudflare runs the bot check. Upstash helps us limit how often forms can be sent.</p>
      <p>They work for us under contract and cannot use your information for their own purposes. Dodo Payments is separately responsible for the payment itself and has its own privacy notice. <strong>We do not sell your data, and never have.</strong></p>
    </section>

    <section>
      <h2>Where your data goes</h2>
      <p>Our providers may handle data outside your country, including in the United States. Where information leaves the UK, EEA or Switzerland we use the standard contracts European law provides for exactly this. Ask us if you want the details for a particular provider.</p>
    </section>

    <section>
      <h2>How long we keep things</h2>
      <p>Who is online right now: less than a day.<br />
      Individual records of a placement being seen or clicked: 90 days, after which only daily totals remain, and those identify nobody.<br />
      Which solution your browser was shown: a week.<br />
      An email alert you never confirmed: a week, then it is deleted.<br />
      Your account and the problems you posted: until you ask us to delete them.<br />
      Payment records: six to seven years, because tax law requires it.</p>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>You can ask us for a copy of your data, to correct it, to delete it, to stop using it a certain way, or to send it somewhere else. Where we asked for your consent, you can take it back at any time.</p>
      <p>If you are in California you can also ask what we collect and have it deleted. There is no &ldquo;do not sell my information&rdquo; link to use here, because we do not sell or share it. We will never treat you worse for asking us anything.</p>
      <p>One honest limit. Almost everything here is anonymous. If you ask us to delete &ldquo;my votes&rdquo;, we usually cannot find them, because nothing links them to you &mdash; which is rather the point. Anything attached to your email address we can deal with in full.</p>
      <p>Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. We reply within 30 days and never charge you. If we get it wrong you can complain to your data protection regulator &mdash; the ICO in the UK, or your national authority in the EEA &mdash; though we would much rather you told us first.</p>
    </section>

    <section>
      <h2>Automatic checks</h2>
      <p>We check submissions automatically for links, contact details and unreadable text, and a problem is hidden for review if enough different people report it. These are checks on the words, not judgements about you. A person looks at anything held back, and you can challenge the outcome by emailing us.</p>
    </section>

    <section>
      <h2>Children</h2>
      <p>FIXTHIS is for people who buy business software and is not meant for children. We do not knowingly collect anything from anyone under 16. If you think a child has given us their details, tell us and we will delete them.</p>
    </section>

    <section>
      <h2>Security</h2>
      <p>Your connection to the site is encrypted, your visitor number is stored scrambled, and card details never reach us at all. If something goes wrong in a way that puts you at risk, we will tell the regulator within 72 hours and tell you directly where the law requires it.</p>
    </section>

    <section>
      <h2>Changes</h2>
      <p>If we change how we use your information we will update the date below, and say so on the site before anything significant takes effect.</p>
    </section>
  </LegalPage>
}
