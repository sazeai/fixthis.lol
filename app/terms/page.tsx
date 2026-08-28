import type { Metadata } from "next"

import { LegalPage } from "@/components/marketplace/legal-page"

const description = "The terms for posting problems, agreeing with them, and answering them on FIXTHIS."

export const metadata: Metadata = {
  title: "Terms of Service",
  description,
  alternates: { canonical: "/terms" },
  openGraph: { title: "Terms of Service", description, url: "/terms" },
  twitter: { title: "Terms of Service", description },
}

export default function TermsPage() {
  return <LegalPage eyebrow="LEGAL" title="Terms of use." intro="FIXTHIS publishes what people say is wrong with the software they use, and lets competing products answer. It does not sell placement, customers, leads, endorsements, or results.">
    <section><h2>What the service is</h2><p>Anyone can publish a problem with the software they use, and anyone can signal that they share it. Any product can answer a problem by saying how it solves that specific complaint. FIXTHIS does not broker, verify, or take commission on anything that happens after a visitor leaves this site.</p></section>
    <section><h2>Answering is free, and position is not for sale</h2><p>There is no charge to answer a problem and no way to pay for a higher position. Answers are ordered by verified identity, whether a switching offer was made, and recency. Answering a problem does not change where that problem appears on the board.</p></section>
    <section><h2>An answer is not a recommendation</h2><p>Answers are written by the products themselves. They are claims, not reviews, rankings, endorsements, or statements that a product is the best option. We do not evaluate them and we do not verify that they are accurate.</p></section>
    <section><h2>&ldquo;Verified&rdquo; means one thing only</h2><p>A verified badge means we confirmed the answer comes from the product it names &mdash; normally because it was written from an email address at that product&apos;s own domain, occasionally because we checked by hand and recorded why. It is a check on <em>who is speaking</em>, never on whether what they said is true, and never a judgement about the product.</p></section>
    <section><h2>Your submissions</h2><p>Problems must describe your own experience, not pitch a product. Do not submit links, contact details, credentials, confidential information, impersonation, harassment, or anything unlawful or infringing. Naming a product you use is expected; making false factual claims about a company is not. You grant FIXTHIS permission to display your submitted public fields to operate the site.</p></section>
    <section><h2>If your product is named</h2><p>Complaints are the opinions of the people who wrote them. Any product named on this site may answer any problem about it, free, and that answer appears alongside the complaint. If something about your product is factually wrong rather than merely unflattering, report it and we will review it.</p></section>
    <section><h2>Answering obligations</h2><p>You must own or be authorised to represent the destination domain you answer with, and you must not seek verification for a product you do not represent. Product names, descriptions, destinations, and switching offers must be accurate and honourable. An answer is tied to its registrable domain, one product may answer a given problem once, and a management link cannot move a product to a different domain.</p></section>
    <section><h2>Manipulation</h2><p>Do not attempt to inflate or suppress demand by automation, repeat identities, or coordinated activity. Do not post complaints about a competitor while presenting yourself as their customer. We exclude suspicious activity from public counters and may hide problems or answers involved in it.</p></section>
    <section><h2>Moderation</h2><p>We may hide, edit for clarity, merge, or refuse any problem, complaint detail, or answer that is misleading, promotional, unsafe, unlawful, or inconsistent with these terms.</p></section>
    <section><h2>Liability</h2><p>The site is provided as available. To the extent permitted by law, FIXTHIS is not liable for business outcomes, third-party products, indirect loss, or anything that happens after a visitor leaves this site.</p></section>
  </LegalPage>
}
