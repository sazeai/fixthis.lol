import type { Metadata } from "next"

import { LegalPage } from "@/components/marketplace/legal-page"

const description = "What FIXTHIS collects, why it is collected, how long it is kept, and the privacy rights available to you."

export const metadata: Metadata = {
  title: "Privacy Policy",
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: { title: "Privacy Policy", description, url: "/privacy-policy" },
  twitter: { title: "Privacy Policy", description },
}

const CONTACT = "privacy@fixthis.lol"

export default function PrivacyPolicy() {
  return <LegalPage
    eyebrow="LEGAL"
    title="Privacy policy."
    intro="Browsing, voting and reading need no account and no personal details. We measure traffic with a random first-party token rather than a profile, we never sell or share data for advertising, and we never build a picture of you across other websites."
  >
    <section>
      <h2>Who is responsible</h2>
      <p>FIXTHIS (&ldquo;we&rdquo;) operates fixthis.lol and is the data controller for the personal data described here. For anything in this policy, including any request about your data, contact <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. If we ever appoint a representative or data protection officer in your region, we will name them here.</p>
    </section>

    <section>
      <h2>What we collect, why, and on what legal basis</h2>
      <p>We collect the minimum each activity needs. Under the UK and EU GDPR the basis for each is set out below.</p>

      <h3>Everyone who visits</h3>
      <p><strong>A random visitor token.</strong> On your first page view we set one first-party cookie, <code>fixthis_visitor</code>, containing a random value. It is not derived from you, your device or your IP, and it identifies nobody. Before anything is stored we replace it with a keyed one-way hash, so our database never holds the value in your browser and the stored key cannot be reversed.</p>
      <p>It does two jobs: it keeps one person from voting twice on the same problem or inflating a product&rsquo;s click count, and it lets us report honest, aggregate traffic to the products that pay to appear. <em>Basis: legitimate interests</em> — running a marketplace whose public numbers can be trusted, which cannot work if the same browser counts repeatedly.</p>
      <p><strong>Your IP address</strong> is processed in transit to apply rate limits and detect abuse, and is passed to Cloudflare for the bot check on forms. <strong>We do not store your IP address in our database at all</strong>, and it never appears in any public figure. <em>Basis: legitimate interests</em> — keeping the service available and resistant to abuse.</p>

      <h3>If you post a problem</h3>
      <p>Posting requires signing in with an email link. We store your email address and link the problems you post to your account, so that a submission is attributable and abuse can be stopped. <em>Basis: performance of a contract</em> (providing the account) <em>and legitimate interests</em> (accountability for public content).</p>

      <h3>If you say you have a problem too, or add a detail</h3>
      <p>We record the hashed visitor token against that problem so the vote counts once. If you add a one-sentence detail it is stored and, once reviewed, shown publicly without any name attached. <em>Basis: legitimate interests</em> (a demand signal that is not trivially inflated) <em>and consent</em> for the optional detail you choose to write.</p>

      <h3>If you ask for an email alert</h3>
      <p>We store your email address, and a hash of a confirmation token, against that problem. We only send anything after you confirm by clicking the link. <em>Basis: consent</em>, which you can withdraw at any time.</p>

      <h3>If you pay to appear as a solution</h3>
      <p>We store the email you gave at checkout, your product name, tagline and destination URL, the amount bid, and identifiers returned by our payment provider. We also fetch your site&rsquo;s favicon once and store it so we can serve it from our own domain instead of calling a third party on every page view. <strong>We never see or store card details</strong> — those go directly to Dodo Payments. <em>Basis: performance of a contract</em>, and <em>legal obligation</em> for records we must keep for tax and accounting.</p>

      <h3>If you report a problem</h3>
      <p>We store the hashed visitor token, the reason you chose and any note you add, so one person cannot report repeatedly. <em>Basis: legitimate interests</em> — keeping unlawful and abusive content off a public page.</p>
    </section>

    <section>
      <h2>Cookies</h2>
      <p>We use no advertising cookies, no analytics SDK, no pixels, no fingerprinting and no cross-site tracking. There are only these:</p>
      <p><code>fixthis_visitor</code> — the random token above. First-party, HTTP-only, expires after one year.<br />
      <code>fixthis_admin</code> — set only when a site administrator signs in.<br />
      <strong>Sign-in cookies</strong> — set by Supabase only if you sign in to post a problem.<br />
      <strong>Cloudflare Turnstile</strong> may set a short-lived token when you submit a form, to confirm you are not a bot.</p>
      <p>We treat the visitor token as exempt from consent because it is first-party, used only to produce aggregate audience measurement for this one site, never combined with other data, never shared, and never used to follow you elsewhere — the conditions European regulators, including the CNIL, set for measurement that does not require a banner. If you are in a jurisdiction that takes a stricter view and you would rather not be counted, blocking or clearing the cookie leaves the site fully usable; you simply will not be counted, and your votes will not be deduplicated.</p>
    </section>

    <section>
      <h2>What is public</h2>
      <p>Problem statements, categories, demand counts, traffic counts and the paid placements competing on a problem are public. An optional complaint detail becomes public only after review, and never carries a name. Email addresses, visitor tokens, IP addresses, payment identifiers, report contents and moderation notes are never public and are never shown to advertisers.</p>
      <p>Advertisers see aggregate impression and click totals for their own placements. They do not receive anything about the individuals behind those numbers, because we do not hold it.</p>
    </section>

    <section>
      <h2>Who processes data for us</h2>
      <p><strong>Supabase</strong> — database and sign-in. <strong>Vercel</strong> — hosting and operational logs. <strong>Dodo Payments</strong> — payments, as merchant of record; they are a separate controller for the payment itself and have their own privacy notice. <strong>Resend</strong> — transactional email. <strong>Cloudflare</strong> — bot protection on forms. <strong>Upstash</strong> — rate-limit counters, keyed by hashed values.</p>
      <p>Each acts on our instructions under a data processing agreement, except Dodo Payments as noted. We do not sell personal data, and we do not share it for cross-context behavioural advertising.</p>
    </section>

    <section>
      <h2>International transfers</h2>
      <p>Our providers may process data outside your country, including in the United States. Where data leaves the UK, EEA or Switzerland we rely on the European Commission&rsquo;s Standard Contractual Clauses and the UK Addendum, together with the technical measures described here — chiefly that we store a hash rather than your identifier, and never store your IP address. You can ask us for details of the safeguards for any specific provider.</p>
    </section>

    <section>
      <h2>How long we keep things</h2>
      <p>Live-visitor records: up to 24 hours. Individual impression and click records: 90 days, after which only daily totals remain, and those totals identify nobody. The link between a browser and the solution it was shown: 7 days. Unconfirmed email alert requests: 7 days, then deleted. Confirmed alert subscriptions: until you unsubscribe. Accounts and the problems posted from them: until you ask us to delete them. Payment and bid records: as long as tax and accounting law requires, typically six to seven years.</p>
    </section>

    <section>
      <h2>Your rights</h2>
      <p>Wherever you live, you can ask us to give you a copy of your data, correct it, delete it, restrict or object to how we use it, or send it to another provider in a portable form. Where we rely on consent you can withdraw it at any time without affecting what happened before.</p>
      <p>If you are in California, you also have the right to know what we collect and why, to delete it, to correct it, and to opt out of sale or sharing — and there is nothing to opt out of, because <strong>we do not sell or share personal information</strong>, and we have not in the past twelve months. We will never treat you differently for exercising a right.</p>
      <p>Because most activity here is anonymous, we often cannot connect a request to specific votes, impressions or clicks — there is no identifier that would let us, which is the point. For anything tied to an email address we can act on it in full. Write to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>; we reply within 30 days and will not charge you.</p>
      <p>You may also complain to your data protection authority — in the UK the Information Commissioner&rsquo;s Office, or in the EEA the supervisory authority where you live or work. We would rather you told us first so we can put it right.</p>
    </section>

    <section>
      <h2>Automated decisions</h2>
      <p>Submissions pass automatic checks for links, contact details and unreadable text, and a problem is hidden pending review if enough distinct people report it. These are content checks, not decisions about you, and they produce no legal or similarly significant effect. A person reviews anything held back, and you can contest an outcome by writing to us.</p>
    </section>

    <section>
      <h2>Children</h2>
      <p>FIXTHIS is a marketplace for business software and is not directed at children. We do not knowingly collect data from anyone under 16. If you believe a child has given us personal data, contact us and we will delete it.</p>
    </section>

    <section>
      <h2>Security and breaches</h2>
      <p>Data is encrypted in transit. Visitor identifiers are stored only as keyed hashes. Every database table is closed to public access and reachable only through validated server code. Card details never reach us. If a breach occurs that is likely to put your rights at risk, we will notify the relevant authority within 72 hours and tell you directly where the law requires it.</p>
    </section>

    <section>
      <h2>Changes</h2>
      <p>If we change how we use personal data in a way that affects you, we will update the date below and, for material changes, say so on the site before the change takes effect.</p>
    </section>
  </LegalPage>
}
