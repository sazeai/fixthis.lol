-- FIXTHIS seed: 52 complaints about software that indie builders already compete with.
--
-- Safe to run more than once. Every row is keyed on normalized_statement, which is
-- unique, so a second run inserts nothing rather than duplicating the board. Slugs
-- are derived from the statement, so regenerating this file produces the same rows.
--
-- Everything lands as origin 'curated' with support_count 0. The counts stay honest:
-- press ME TOO yourself on the ones you genuinely have, and let the rest earn theirs.
-- A board whose numbers are invented is the one thing that would put advertisers off.
--
-- Generated 2026-08-28.

begin;

insert into public.problems
  (slug, statement, normalized_statement, category, origin, status,
   target_product_name, switch_condition, published_at)
values
  ('sentry-s-free-tier-is-gone-days-into-the-12ee', 'Sentry''s free tier is gone days into the month and the next plan costs more than my server. I need error tracking priced flat.', 'sentry s free tier is gone days into the month and the next plan costs more than my server i need error tracking priced flat', 'Analytics', 'curated', 'published', 'Sentry', 'Error tracking with a flat price, not per-event billing.', now()),
  ('algolia-s-bill-grows-the-more-people-search-which-1682', 'Algolia''s bill grows the more people search, which is what I want them doing. I need search priced on records, not usage.', 'algolia s bill grows the more people search which is what i want them doing i need search priced on records not usage', 'Developer tools', 'curated', 'published', 'Algolia', 'Search priced on what I store, not how often it runs.', now()),
  ('auth0-was-free-until-i-had-real-signups-then-086d', 'Auth0 was free until I had real signups, then the price jumped. I need login and signup at a flat price, not per user.', 'auth0 was free until i had real signups then the price jumped i need login and signup at a flat price not per user', 'Developer tools', 'curated', 'published', 'Auth0', 'Authentication at a flat price with no per-user cliff.', now()),
  ('firebase-was-quick-to-build-on-but-my-data-2cae', 'Firebase was quick to build on but my data is trapped and exporting looks like a rewrite. I need a backend I could leave.', 'firebase was quick to build on but my data is trapped and exporting looks like a rewrite i need a backend i could leave', 'Developer tools', 'curated', 'published', 'Firebase', 'The same speed to build with, without locking my data in.', now()),
  ('one-good-traffic-day-turned-my-vercel-bill-into-47c3', 'One good traffic day turned my Vercel bill into a surprise. I need hosting with a spending cap I set myself.', 'one good traffic day turned my vercel bill into a surprise i need hosting with a spending cap i set myself', 'Developer tools', 'curated', 'published', 'Vercel', 'Hosting with a hard spending cap I set myself.', now()),
  ('datadog-costs-more-than-the-servers-it-watches-and-2e8d', 'Datadog costs more than the servers it watches and I use four of its features. I need simple metrics and alerts, cheaply.', 'datadog costs more than the servers it watches and i use four of its features i need simple metrics and alerts cheaply', 'Analytics', 'curated', 'published', 'Datadog', 'Monitoring priced for a handful of small services.', now()),
  ('postman-wants-an-account-and-a-synced-workspace-before-f5c7', 'Postman wants an account and a synced workspace before it will send one request. I need an API client that opens instantly.', 'postman wants an account and a synced workspace before it will send one request i need an api client that opens instantly', 'Developer tools', 'curated', 'published', 'Postman', 'An API client that works offline and stores collections locally.', now()),
  ('calendly-charges-per-seat-for-three-of-us-who-32e2', 'Calendly charges per seat for three of us who take two calls a week each. I need team scheduling priced as one thing.', 'calendly charges per seat for three of us who take two calls a week each i need team scheduling priced as one thing', 'Communication', 'curated', 'published', 'Calendly', 'Scheduling priced per team rather than per seat.', now()),
  ('most-people-only-read-our-airtable-and-never-edit-ba15', 'Most people only read our Airtable and never edit it, yet we pay for them all. I need viewers not to cost the same as editors.', 'most people only read our airtable and never edit it yet we pay for them all i need viewers not to cost the same as editors', 'Productivity', 'curated', 'published', 'Airtable', 'A database where only the people editing it are billable.', now()),
  ('filing-a-bug-in-jira-needs-an-epic-a-adbc', 'Filing a bug in Jira needs an epic, a sprint and four fields, so nobody bothers. I need issue tracking developers will use.', 'filing a bug in jira needs an epic a sprint and four fields so nobody bothers i need issue tracking developers will use', 'Productivity', 'curated', 'published', 'Jira', 'Issue tracking a developer can use without being trained.', now()),
  ('our-docs-are-all-in-notion-and-search-never-7a31', 'Our docs are all in Notion and search never returns the page I wrote. I need team docs where search actually works.', 'our docs are all in notion and search never returns the page i wrote i need team docs where search actually works', 'Knowledge', 'curated', 'published', 'Notion', 'Team docs with search that returns the page I''m looking for.', now()),
  ('i-open-figma-twice-a-month-and-pay-for-f63e', 'I open Figma twice a month and pay for a seat all twelve. I need to edit design files occasionally without a subscription.', 'i open figma twice a month and pay for a seat all twelve i need to edit design files occasionally without a subscription', 'Design', 'curated', 'published', 'Figma', 'Opening and editing design files without a monthly seat.', now()),
  ('free-slack-hides-our-own-history-so-the-decision-c9ac', 'Free Slack hides our own history, so the decision I need to quote is unreadable. I need team chat that keeps what we said.', 'free slack hides our own history so the decision i need to quote is unreadable i need team chat that keeps what we said', 'Communication', 'curated', 'published', 'Slack', 'Team chat that keeps our full message history.', now()),
  ('monday-became-a-wall-of-coloured-boxes-nobody-updates-5af0', 'Monday became a wall of coloured boxes nobody updates. I need a project board the team will actually keep current.', 'monday became a wall of coloured boxes nobody updates i need a project board the team will actually keep current', 'Productivity', 'curated', 'published', 'Monday.com', 'A project board simple enough that people keep it updated.', now()),
  ('stripe-leaves-me-merchant-of-record-so-i-owe-0b8f', 'Stripe leaves me merchant of record, so I owe sales tax in every country I sell to. I need someone else to be the seller.', 'stripe leaves me merchant of record so i owe sales tax in every country i sell to i need someone else to be the seller', 'Finance', 'curated', 'published', 'Stripe', 'A payment provider that acts as merchant of record.', now()),
  ('gumroad-takes-a-cut-of-every-sale-forever-just-3dbd', 'Gumroad takes a cut of every sale forever, just to host a checkout page. I need to sell downloads for a flat fee.', 'gumroad takes a cut of every sale forever just to host a checkout page i need to sell downloads for a flat fee', 'Finance', 'curated', 'published', 'Gumroad', 'Selling digital products for a flat fee, not a revenue share.', now()),
  ('freshbooks-charges-by-client-count-so-every-new-client-ec5b', 'FreshBooks charges by client count, so every new client costs me before they pay. I need invoicing at one flat price.', 'freshbooks charges by client count so every new client costs me before they pay i need invoicing at one flat price', 'Finance', 'curated', 'published', 'FreshBooks', 'Invoicing at a flat price regardless of client count.', now()),
  ('paypal-s-fees-and-week-long-holds-make-overseas-8703', 'PayPal''s fees and week-long holds make overseas payouts unpredictable. I need to know what arrives and when.', 'paypal s fees and week long holds make overseas payouts unpredictable i need to know what arrives and when', 'Finance', 'curated', 'published', 'PayPal', 'Predictable international payouts without surprise holds.', now()),
  ('i-wanted-plans-and-upgrades-on-a-small-saas-724a', 'I wanted plans and upgrades on a small SaaS and Chargebee sent me to a sales call. I need billing I can set up myself.', 'i wanted plans and upgrades on a small saas and chargebee sent me to a sales call i need billing i can set up myself', 'Finance', 'curated', 'published', 'Chargebee', 'Subscription billing I can configure without a sales call.', now()),
  ('affiliate-tools-want-serious-money-before-i-have-a-8076', 'Affiliate tools want serious money before I have a single affiliate. I need referral tracking that''s cheap until it earns.', 'affiliate tools want serious money before i have a single affiliate i need referral tracking that s cheap until it earns', 'Analytics', 'curated', 'published', 'FirstPromoter', 'An affiliate program that costs little until it makes money.', now()),
  ('zendesk-is-built-around-queues-and-agent-roles-our-2288', 'Zendesk is built around queues and agent roles; our support team is two people. I need a shared inbox, nothing more.', 'zendesk is built around queues and agent roles our support team is two people i need a shared inbox nothing more', 'Support', 'curated', 'published', 'Zendesk', 'A shared support inbox for a team of two.', now()),
  ('a-feature-request-board-costs-more-per-month-than-0cc5', 'A feature request board costs more per month than my product earns. I need a public roadmap priced for something small.', 'a feature request board costs more per month than my product earns i need a public roadmap priced for something small', 'Product', 'curated', 'published', 'Canny', 'A public roadmap and feedback board for a small product.', now()),
  ('atlassian-charges-me-monthly-for-a-page-that-says-ed76', 'Atlassian charges me monthly for a page that says everything is fine. I need a status page cheaper than the thing it covers.', 'atlassian charges me monthly for a page that says everything is fine i need a status page cheaper than the thing it covers', 'Developer tools', 'curated', 'published', 'Statuspage', 'A hosted status page for a few dollars a month.', now()),
  ('i-want-to-know-my-site-is-down-before-d748', 'I want to know my site is down before a customer tells me, but monitoring is priced for ops teams. I need alerts for one site.', 'i want to know my site is down before a customer tells me but monitoring is priced for ops teams i need alerts for one site', 'Communication', 'curated', 'published', 'Pingdom', 'Uptime monitoring and alerts for one or two small sites.', now()),
  ('typeform-makes-me-pay-to-take-its-logo-off-b19b', 'Typeform makes me pay to take its logo off my 3-question form. I need an unbranded form I can actually afford.', 'typeform makes me pay to take its logo off my 3 question form i need an unbranded form i can actually afford', 'Marketing', 'curated', 'published', 'Typeform', 'An unbranded form on a plan a small product can afford.', now()),
  ('my-google-form-looks-like-a-school-survey-next-ebeb', 'My Google Form looks like a school survey next to my site, so people abandon it. I need a form that matches my branding.', 'my google form looks like a school survey next to my site so people abandon it i need a form that matches my branding', 'Product', 'curated', 'published', 'Google Forms', 'A form that matches my branding out of the box.', now()),
  ('i-chase-testimonials-by-email-few-reply-and-the-7947', 'I chase testimonials by email, few reply, and the four I have are a year old. I need reviews collected without chasing.', 'i chase testimonials by email few reply and the four i have are a year old i need reviews collected without chasing', 'Product', 'curated', 'published', 'Email', 'Collecting and publishing testimonials without chasing.', now()),
  ('i-m-paying-mailchimp-for-contacts-who-unsubscribed-months-22df', 'I''m paying Mailchimp for contacts who unsubscribed months ago. I need to pay only for people who still want the email.', 'i m paying mailchimp for contacts who unsubscribed months ago i need to pay only for people who still want the email', 'Marketing', 'curated', 'published', 'Mailchimp', 'Paying only for subscribers who are still active.', now()),
  ('substack-takes-a-cut-of-every-subscription-forever-on-1958', 'Substack takes a cut of every subscription forever, on a list I built myself. I need a newsletter where I keep the revenue.', 'substack takes a cut of every subscription forever on a list i built myself i need a newsletter where i keep the revenue', 'Marketing', 'curated', 'published', 'Substack', 'A paid newsletter with a flat fee instead of a revenue cut.', now()),
  ('my-password-reset-emails-land-in-spam-and-sendgrid-c753', 'My password reset emails land in spam and SendGrid''s dashboard won''t tell me why. I need transactional email that arrives.', 'my password reset emails land in spam and sendgrid s dashboard won t tell me why i need transactional email that arrives', 'Analytics', 'curated', 'published', 'SendGrid', 'A transactional email API that''s quick to set up and lands in inboxes.', now()),
  ('i-write-in-markdown-and-mailchimp-forces-a-drag-9c76', 'I write in Markdown and Mailchimp forces a drag-and-drop editor that mangles it. I need to send newsletters as plain text.', 'i write in markdown and mailchimp forces a drag and drop editor that mangles it i need to send newsletters as plain text', 'Marketing', 'curated', 'published', 'Mailchimp', 'Writing newsletters in Markdown and sending via an API.', now()),
  ('email-tools-charge-by-list-size-so-dead-subscribers-1156', 'Email tools charge by list size, so dead subscribers cost as much as customers. I need to pay for sends, not storage.', 'email tools charge by list size so dead subscribers cost as much as customers i need to pay for sends not storage', 'Marketing', 'curated', 'published', 'Kit', 'Email priced per send, not per stored subscriber.', now()),
  ('i-post-to-two-accounts-ten-times-a-week-c2ea', 'I post to two accounts ten times a week and every scheduler is priced for agencies. I need simple scheduling, cheaply.', 'i post to two accounts ten times a week and every scheduler is priced for agencies i need simple scheduling cheaply', 'Marketing', 'curated', 'published', 'Hootsuite', 'Simple post scheduling for one or two accounts.', now()),
  ('i-lose-whole-threads-when-the-x-composer-reloads-ce5f', 'I lose whole threads when the X composer reloads. I need somewhere to write, save and schedule threads before posting.', 'i lose whole threads when the x composer reloads i need somewhere to write save and schedule threads before posting', 'Productivity', 'curated', 'published', 'X', 'Writing and scheduling threads somewhere that saves drafts.', now()),
  ('my-linktree-is-the-first-thing-people-see-and-2ce5', 'My Linktree is the first thing people see and it''s covered in Linktree''s branding. I need a links page that looks like mine.', 'my linktree is the first thing people see and it s covered in linktree s branding i need a links page that looks like mine', 'Marketing', 'curated', 'published', 'Linktree', 'An unbranded links page on a free or cheap plan.', now()),
  ('loom-cuts-my-free-recordings-off-before-the-walkthrough-fa9c', 'Loom cuts my free recordings off before the walkthrough finishes. I need to share a full demo without a subscription.', 'loom cuts my free recordings off before the walkthrough finishes i need to share a full demo without a subscription', 'Communication', 'curated', 'published', 'Loom', 'Recording and sharing longer demos without a subscription.', now()),
  ('loom-keeps-changing-what-the-free-plan-includes-so-93d3', 'Loom keeps changing what the free plan includes, so I can''t rely on it for customer demos. I need a recorder that stays put.', 'loom keeps changing what the free plan includes so i can t rely on it for customer demos i need a recorder that stays put', 'Communication', 'curated', 'published', 'Loom', 'A screen recorder whose free plan and links stay stable.', now()),
  ('the-canva-template-behind-a-year-of-my-posts-31ca', 'The Canva template behind a year of my posts moved to Pro overnight. I need design templates that stay where I built them.', 'the canva template behind a year of my posts moved to pro overnight i need design templates that stay where i built them', 'Design', 'curated', 'published', 'Canva', 'Design templates that don''t move behind a paywall later.', now()),
  ('ga4-takes-twenty-clicks-to-tell-me-who-visited-b797', 'GA4 takes twenty clicks to tell me who visited yesterday and I still doubt it. I need one page of visitors and referrers.', 'ga4 takes twenty clicks to tell me who visited yesterday and i still doubt it i need one page of visitors and referrers', 'Analytics', 'curated', 'published', 'Google Analytics', 'A single readable dashboard of visitors and referrers.', now()),
  ('i-added-a-cookie-banner-purely-for-analytics-i-0ce8', 'I added a cookie banner purely for analytics I check twice a month. I need visitor numbers without a consent popup.', 'i added a cookie banner purely for analytics i check twice a month i need visitor numbers without a consent popup', 'Analytics', 'curated', 'published', 'Google Analytics', 'Cookieless analytics that needs no consent banner.', now()),
  ('hotjar-s-free-plan-records-too-few-sessions-to-78b0', 'Hotjar''s free plan records too few sessions to ever catch my signup drop-off. I need replay I can leave running.', 'hotjar s free plan records too few sessions to ever catch my signup drop off i need replay i can leave running', 'Analytics', 'curated', 'published', 'Hotjar', 'Session replay I can afford to leave running.', now()),
  ('i-couldn-t-find-what-amplitude-would-cost-me-3e7d', 'I couldn''t find what Amplitude would cost me without booking a call. I need product analytics with pricing on the website.', 'i couldn t find what amplitude would cost me without booking a call i need product analytics with pricing on the website', 'Analytics', 'curated', 'published', 'Amplitude', 'Product analytics with public, self-serve pricing.', now()),
  ('zapier-charges-per-task-so-my-automations-cost-more-d1ca', 'Zapier charges per task, so my automations cost more the more useful they get. I need automation priced per workflow.', 'zapier charges per task so my automations cost more the more useful they get i need automation priced per workflow', 'Automation', 'curated', 'published', 'Zapier', 'Automation priced per workflow rather than per run.', now()),
  ('i-had-to-learn-webflow-like-a-language-and-fb3e', 'I had to learn Webflow like a language and forget it between edits. I need a site I can change in ten minutes.', 'i had to learn webflow like a language and forget it between edits i need a site i can change in ten minutes', 'Design', 'curated', 'published', 'Webflow', 'A site I can edit occasionally without relearning it.', now()),
  ('my-site-is-wordpress-plus-nine-plugins-and-one-d26d', 'My site is WordPress plus nine plugins and one breaks the layout every month. I need a site that stays up unattended.', 'my site is wordpress plus nine plugins and one breaks the layout every month i need a site that stays up unattended', 'Developer tools', 'curated', 'published', 'WordPress', 'A site that doesn''t need monthly maintenance.', now()),
  ('keeping-our-gitbook-docs-public-turned-into-a-monthly-5c3d', 'Keeping our GitBook docs public turned into a monthly bill for content I wrote. I need docs that live in my repo.', 'keeping our gitbook docs public turned into a monthly bill for content i wrote i need docs that live in my repo', 'Knowledge', 'curated', 'published', 'GitBook', 'Docs that live in my repo and deploy with the code.', now()),
  ('confluence-search-buries-the-current-page-under-six-old-a18f', 'Confluence search buries the current page under six old copies of itself. I need a wiki that surfaces the right version.', 'confluence search buries the current page under six old copies of itself i need a wiki that surfaces the right version', 'Knowledge', 'curated', 'published', 'Confluence', 'A wiki where search surfaces the current page.', now()),
  ('seo-tools-start-at-agency-prices-for-competitor-data-e3a6', 'SEO tools start at agency prices for competitor data I don''t need. I need rank tracking for eight posts on one small site.', 'seo tools start at agency prices for competitor data i don t need i need rank tracking for eight posts on one small site', 'Analytics', 'curated', 'published', 'Ahrefs', 'Keyword rank tracking for a single small site.', now()),
  ('preview-deploys-per-pull-request-are-great-until-the-080c', 'Preview deploys per pull request are great until the invoice arrives. I need branch previews I can run on my own server.', 'preview deploys per pull request are great until the invoice arrives i need branch previews i can run on my own server', 'Developer tools', 'curated', 'published', 'Vercel', 'Preview environments I can self-host.', now()),
  ('our-roadmap-is-a-notion-page-so-customers-hit-10f1', 'Our roadmap is a Notion page, so customers hit a login wall or a stale copy. I need a public roadmap, no account.', 'our roadmap is a notion page so customers hit a login wall or a stale copy i need a public roadmap no account', 'Knowledge', 'curated', 'published', 'Notion', 'A public roadmap that needs no login to read.', now()),
  ('every-contract-comes-back-as-a-photo-of-a-fac4', 'Every contract comes back as a photo of a printed signature. I need customers to sign online without per-doc fees.', 'every contract comes back as a photo of a printed signature i need customers to sign online without per doc fees', 'Design', 'curated', 'published', 'Google Docs', 'Online signatures without per-document pricing.', now()),
  ('our-pricing-model-is-one-spreadsheet-only-one-person-7bd7', 'Our pricing model is one spreadsheet only one person may touch; everyone else uses screenshots. I need it as a shared tool.', 'our pricing model is one spreadsheet only one person may touch everyone else uses screenshots i need it as a shared tool', 'Productivity', 'curated', 'published', 'Excel', 'Turning a critical spreadsheet into a shared tool.', now())
on conflict (normalized_statement) do nothing;

commit;

-- What landed, by category:
--   select category, count(*) from public.problems where origin = 'curated' group by category order by 2 desc;
--
-- To undo this seed entirely (only removes rows with these exact slugs):
--   delete from public.problems where slug in (
--     'sentry-s-free-tier-is-gone-days-into-the-12ee',
--     'algolia-s-bill-grows-the-more-people-search-which-1682',
--     'auth0-was-free-until-i-had-real-signups-then-086d',
--     'firebase-was-quick-to-build-on-but-my-data-2cae',
--     'one-good-traffic-day-turned-my-vercel-bill-into-47c3',
--     'datadog-costs-more-than-the-servers-it-watches-and-2e8d',
--     'postman-wants-an-account-and-a-synced-workspace-before-f5c7',
--     'calendly-charges-per-seat-for-three-of-us-who-32e2',
--     'most-people-only-read-our-airtable-and-never-edit-ba15',
--     'filing-a-bug-in-jira-needs-an-epic-a-adbc',
--     'our-docs-are-all-in-notion-and-search-never-7a31',
--     'i-open-figma-twice-a-month-and-pay-for-f63e',
--     'free-slack-hides-our-own-history-so-the-decision-c9ac',
--     'monday-became-a-wall-of-coloured-boxes-nobody-updates-5af0',
--     'stripe-leaves-me-merchant-of-record-so-i-owe-0b8f',
--     'gumroad-takes-a-cut-of-every-sale-forever-just-3dbd',
--     'freshbooks-charges-by-client-count-so-every-new-client-ec5b',
--     'paypal-s-fees-and-week-long-holds-make-overseas-8703',
--     'i-wanted-plans-and-upgrades-on-a-small-saas-724a',
--     'affiliate-tools-want-serious-money-before-i-have-a-8076',
--     'zendesk-is-built-around-queues-and-agent-roles-our-2288',
--     'a-feature-request-board-costs-more-per-month-than-0cc5',
--     'atlassian-charges-me-monthly-for-a-page-that-says-ed76',
--     'i-want-to-know-my-site-is-down-before-d748',
--     'typeform-makes-me-pay-to-take-its-logo-off-b19b',
--     'my-google-form-looks-like-a-school-survey-next-ebeb',
--     'i-chase-testimonials-by-email-few-reply-and-the-7947',
--     'i-m-paying-mailchimp-for-contacts-who-unsubscribed-months-22df',
--     'substack-takes-a-cut-of-every-subscription-forever-on-1958',
--     'my-password-reset-emails-land-in-spam-and-sendgrid-c753',
--     'i-write-in-markdown-and-mailchimp-forces-a-drag-9c76',
--     'email-tools-charge-by-list-size-so-dead-subscribers-1156',
--     'i-post-to-two-accounts-ten-times-a-week-c2ea',
--     'i-lose-whole-threads-when-the-x-composer-reloads-ce5f',
--     'my-linktree-is-the-first-thing-people-see-and-2ce5',
--     'loom-cuts-my-free-recordings-off-before-the-walkthrough-fa9c',
--     'loom-keeps-changing-what-the-free-plan-includes-so-93d3',
--     'the-canva-template-behind-a-year-of-my-posts-31ca',
--     'ga4-takes-twenty-clicks-to-tell-me-who-visited-b797',
--     'i-added-a-cookie-banner-purely-for-analytics-i-0ce8',
--     'hotjar-s-free-plan-records-too-few-sessions-to-78b0',
--     'i-couldn-t-find-what-amplitude-would-cost-me-3e7d',
--     'zapier-charges-per-task-so-my-automations-cost-more-d1ca',
--     'i-had-to-learn-webflow-like-a-language-and-fb3e',
--     'my-site-is-wordpress-plus-nine-plugins-and-one-d26d',
--     'keeping-our-gitbook-docs-public-turned-into-a-monthly-5c3d',
--     'confluence-search-buries-the-current-page-under-six-old-a18f',
--     'seo-tools-start-at-agency-prices-for-competitor-data-e3a6',
--     'preview-deploys-per-pull-request-are-great-until-the-080c',
--     'our-roadmap-is-a-notion-page-so-customers-hit-10f1',
--     'every-contract-comes-back-as-a-photo-of-a-fac4',
--     'our-pricing-model-is-one-spreadsheet-only-one-person-7bd7'
--   );
