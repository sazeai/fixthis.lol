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
  ('sentry-s-free-tier-is-gone-by-wednesday-and-7415', 'Sentry''s free tier is gone by Wednesday and the next plan up costs more than the server I''m monitoring.', 'sentry s free tier is gone by wednesday and the next plan up costs more than the server i m monitoring', 'Developer tools', 'curated', 'published', 'Sentry', 'Error tracking that isn''t priced per event.', now()),
  ('algolia-charges-me-more-the-more-my-users-search-c421', 'Algolia charges me more the more my users search, which is the one thing I actually want them to do.', 'algolia charges me more the more my users search which is the one thing i actually want them to do', 'Developer tools', 'curated', 'published', 'Algolia', 'Search priced on records, not on queries.', now()),
  ('auth0-was-free-right-up-until-i-had-real-9bc6', 'Auth0 was free right up until I had real users, and then the quote arrived.', 'auth0 was free right up until i had real users and then the quote arrived', 'Developer tools', 'curated', 'published', 'Auth0', 'Auth with a flat price and no per-user cliff.', now()),
  ('everything-about-firebase-is-easy-until-the-day-i-3830', 'Everything about Firebase is easy until the day I want my data somewhere else.', 'everything about firebase is easy until the day i want my data somewhere else', 'Developer tools', 'curated', 'published', 'Firebase', 'The same speed without locking my data in.', now()),
  ('my-side-project-got-one-good-day-of-traffic-3199', 'My side project got one good day of traffic and Vercel turned it into a bill I didn''t budget for.', 'my side project got one good day of traffic and vercel turned it into a bill i didn t budget for', 'Developer tools', 'curated', 'published', 'Vercel', 'Hosting that caps instead of charging.', now()),
  ('datadog-costs-more-every-month-than-the-infrastructure-it-a166', 'Datadog costs more every month than the infrastructure it''s supposed to be watching.', 'datadog costs more every month than the infrastructure it s supposed to be watching', 'Developer tools', 'curated', 'published', 'Datadog', 'Monitoring priced for one small product.', now()),
  ('postman-turned-an-api-client-into-an-account-i-0cdd', 'Postman turned an API client into an account I have to log into and a workspace I have to sync.', 'postman turned an api client into an account i have to log into and a workspace i have to sync', 'Developer tools', 'curated', 'published', 'Postman', 'An API client that opens instantly and stays on my machine.', now()),
  ('calendly-charges-me-per-seat-for-three-people-who-f40e', 'Calendly charges me per seat for three people who take two calls a week between them.', 'calendly charges me per seat for three people who take two calls a week between them', 'Communication', 'curated', 'published', 'Calendly', 'Scheduling priced per team, not per head.', now()),
  ('airtable-counts-people-who-only-ever-look-at-the-67c5', 'Airtable counts people who only ever look at the table as billable seats.', 'airtable counts people who only ever look at the table as billable seats', 'Productivity', 'curated', 'published', 'Airtable', 'A database where only the editors cost money.', now()),
  ('jira-needs-a-project-manager-just-to-file-a-2fd7', 'Jira needs a project manager just to file a bug, and we don''t have a project manager.', 'jira needs a project manager just to file a bug and we don t have a project manager', 'Productivity', 'curated', 'published', 'Jira', 'Issue tracking a developer can use without training.', now()),
  ('notion-is-where-our-documentation-goes-to-become-unfindable-9880', 'Notion is where our documentation goes to become unfindable.', 'notion is where our documentation goes to become unfindable', 'Knowledge', 'curated', 'published', 'Notion', 'Docs with a search that returns the page I''m thinking of.', now()),
  ('i-open-figma-about-twice-a-month-and-pay-58f7', 'I open Figma about twice a month and pay for it twelve times a year.', 'i open figma about twice a month and pay for it twelve times a year', 'Design', 'curated', 'published', 'Figma', 'Opening a design file without holding a seat.', now()),
  ('slack-hides-our-own-conversations-from-us-and-charges-4ae9', 'Slack hides our own conversations from us and charges to give them back.', 'slack hides our own conversations from us and charges to give them back', 'Communication', 'curated', 'published', 'Slack', 'Team chat that keeps what we said.', now()),
  ('monday-sold-me-a-workflow-and-delivered-a-wall-51fd', 'Monday sold me a workflow and delivered a wall of coloured rectangles nobody updates.', 'monday sold me a workflow and delivered a wall of coloured rectangles nobody updates', 'Productivity', 'curated', 'published', 'Monday.com', 'A board that just shows what to do next.', now()),
  ('stripe-left-me-as-the-merchant-of-record-so-3ffe', 'Stripe left me as the merchant of record, so I now owe sales tax in countries I have never visited.', 'stripe left me as the merchant of record so i now owe sales tax in countries i have never visited', 'Finance', 'curated', 'published', 'Stripe', 'Someone else being responsible for the VAT.', now()),
  ('gumroad-takes-ten-percent-of-every-sale-for-hosting-e46e', 'Gumroad takes ten percent of every sale for hosting a checkout page.', 'gumroad takes ten percent of every sale for hosting a checkout page', 'Developer tools', 'curated', 'published', 'Gumroad', 'A flat fee instead of a permanent cut.', now()),
  ('freshbooks-starts-charging-by-how-many-clients-i-have-2471', 'FreshBooks starts charging by how many clients I have, so it bills me more for doing well.', 'freshbooks starts charging by how many clients i have so it bills me more for doing well', 'Finance', 'curated', 'published', 'FreshBooks', 'Invoicing at one flat price.', now()),
  ('paypal-s-fees-and-surprise-holds-make-small-payouts-5c24', 'PayPal''s fees and surprise holds make small payouts barely worth collecting.', 'paypal s fees and surprise holds make small payouts barely worth collecting', 'Finance', 'curated', 'published', 'PayPal', 'Getting paid without wondering when.', now()),
  ('chargebee-is-billing-software-that-needs-its-own-onboarding-282b', 'Chargebee is billing software that needs its own onboarding call before it will bill anyone.', 'chargebee is billing software that needs its own onboarding call before it will bill anyone', 'Finance', 'curated', 'published', 'Chargebee', 'Subscriptions I can set up myself in an afternoon.', now()),
  ('firstpromoter-wants-enterprise-money-before-i-have-a-single-9dd8', 'FirstPromoter wants enterprise money before I have a single affiliate to pay.', 'firstpromoter wants enterprise money before i have a single affiliate to pay', 'Marketing', 'curated', 'published', 'FirstPromoter', 'An affiliate program that starts small and grows with me.', now()),
  ('zendesk-is-built-for-a-support-department-there-are-837d', 'Zendesk is built for a support department. There are two of us and one of us is me.', 'zendesk is built for a support department there are two of us and one of us is me', 'Support', 'curated', 'published', 'Zendesk', 'A shared inbox without a whole department around it.', now()),
  ('canny-costs-more-per-month-than-my-product-earns-e1de', 'Canny costs more per month than my product earns, purely to collect feature requests.', 'canny costs more per month than my product earns purely to collect feature requests', 'Product', 'curated', 'published', 'Canny', 'A public roadmap priced for something small.', now()),
  ('atlassian-wants-twenty-nine-dollars-a-month-for-a-bb67', 'Atlassian wants twenty-nine dollars a month for a page that mostly says everything is fine.', 'atlassian wants twenty nine dollars a month for a page that mostly says everything is fine', 'Developer tools', 'curated', 'published', 'Statuspage', 'A status page that costs less than the thing it watches.', now()),
  ('pingdom-prices-uptime-checks-like-i-m-a-bank-6ba8', 'Pingdom prices uptime checks like I''m a bank rather than one person with one server.', 'pingdom prices uptime checks like i m a bank rather than one person with one server', 'Developer tools', 'curated', 'published', 'Pingdom', 'Uptime monitoring for a single small product.', now()),
  ('typeform-wants-ninety-nine-dollars-a-month-before-it-edd2', 'Typeform wants ninety-nine dollars a month before it will take its own logo off my three-question form.', 'typeform wants ninety nine dollars a month before it will take its own logo off my three question form', 'Marketing', 'curated', 'published', 'Typeform', 'A form that looks like mine on the free plan.', now()),
  ('google-forms-makes-my-product-look-like-a-2011-a7d8', 'Google Forms makes my product look like a 2011 school survey.', 'google forms makes my product look like a 2011 school survey', 'Product', 'curated', 'published', 'Google Forms', 'Something that looks designed without hiring a designer.', now()),
  ('chasing-customers-for-testimonials-over-email-means-i-have-83ae', 'Chasing customers for testimonials over email means I have four, and they''re all from last year.', 'chasing customers for testimonials over email means i have four and they re all from last year', 'Marketing', 'curated', 'published', 'Email', 'Collecting proof without asking twice.', now()),
  ('mailchimp-keeps-billing-me-for-people-who-unsubscribed-months-2e0f', 'Mailchimp keeps billing me for people who unsubscribed months ago.', 'mailchimp keeps billing me for people who unsubscribed months ago', 'Marketing', 'curated', 'published', 'Mailchimp', 'Paying only for subscribers who still want the email.', now()),
  ('substack-takes-ten-percent-of-a-business-i-built-38ba', 'Substack takes ten percent of a business I built myself, forever.', 'substack takes ten percent of a business i built myself forever', 'Marketing', 'curated', 'published', 'Substack', 'Owning the list and keeping the revenue.', now()),
  ('sendgrid-s-dashboard-is-a-maze-and-my-transactional-7866', 'SendGrid''s dashboard is a maze and my transactional email still landed in spam.', 'sendgrid s dashboard is a maze and my transactional email still landed in spam', 'Analytics', 'curated', 'published', 'SendGrid', 'An email API I can understand in ten minutes.', now()),
  ('i-write-everything-in-markdown-and-mailchimp-insists-i-554e', 'I write everything in Markdown and Mailchimp insists I use a drag-and-drop editor instead.', 'i write everything in markdown and mailchimp insists i use a drag and drop editor instead', 'Marketing', 'curated', 'published', 'Mailchimp', 'A newsletter tool with a real API and plain text.', now()),
  ('every-email-tool-prices-by-list-size-so-my-ceab', 'Every email tool prices by list size, so my dead subscribers cost exactly as much as my customers.', 'every email tool prices by list size so my dead subscribers cost exactly as much as my customers', 'Marketing', 'curated', 'published', 'Kit', 'Paying for what I send, not what I store.', now()),
  ('hootsuite-charges-agency-money-to-schedule-ten-posts-a-be76', 'Hootsuite charges agency money to schedule ten posts a week.', 'hootsuite charges agency money to schedule ten posts a week', 'Marketing', 'curated', 'published', 'Hootsuite', 'Scheduling that costs less than the coffee I write them over.', now()),
  ('writing-a-thread-in-the-x-composer-means-losing-2517', 'Writing a thread in the X composer means losing the whole thing when the tab reloads.', 'writing a thread in the x composer means losing the whole thing when the tab reloads', 'Marketing', 'curated', 'published', 'X', 'Drafting threads somewhere that actually saves.', now()),
  ('linktree-puts-its-own-brand-on-my-link-page-1ed4', 'Linktree puts its own brand on my link page and charges me to take it off.', 'linktree puts its own brand on my link page and charges me to take it off', 'Marketing', 'curated', 'published', 'Linktree', 'One page that looks like mine, not like Linktree''s.', now()),
  ('loom-cuts-my-free-recordings-off-at-five-minutes-4d7b', 'Loom cuts my free recordings off at five minutes and the walkthrough I need is six.', 'loom cuts my free recordings off at five minutes and the walkthrough i need is six', 'Communication', 'curated', 'published', 'Loom', 'Recording a full demo without a subscription.', now()),
  ('since-atlassian-bought-loom-the-free-plan-has-quietly-c719', 'Since Atlassian bought Loom the free plan has quietly got worse twice.', 'since atlassian bought loom the free plan has quietly got worse twice', 'Communication', 'curated', 'published', 'Loom', 'A recorder that won''t be acquired out from under me.', now()),
  ('canva-put-the-template-i-ve-been-using-for-275d', 'Canva put the template I''ve been using for a year behind Pro without warning.', 'canva put the template i ve been using for a year behind pro without warning', 'Design', 'curated', 'published', 'Canva', 'Graphics that stay where I left them.', now()),
  ('ga4-takes-twenty-clicks-to-tell-me-how-many-8368', 'GA4 takes twenty clicks to tell me how many people visited yesterday, and I still don''t believe the number.', 'ga4 takes twenty clicks to tell me how many people visited yesterday and i still don t believe the number', 'Analytics', 'curated', 'published', 'Google Analytics', 'One page showing visitors and where they came from.', now()),
  ('i-had-to-put-a-cookie-banner-on-my-fc7d', 'I had to put a cookie banner on my landing page because of an analytics tool I barely even look at.', 'i had to put a cookie banner on my landing page because of an analytics tool i barely even look at', 'Analytics', 'curated', 'published', 'Google Analytics', 'Counting visitors without a consent popup.', now()),
  ('hotjar-s-free-plan-records-so-few-sessions-it-e1be', 'Hotjar''s free plan records so few sessions it never once caught the bug I was chasing.', 'hotjar s free plan records so few sessions it never once caught the bug i was chasing', 'Analytics', 'curated', 'published', 'Hotjar', 'Session replay I can afford to leave switched on.', now()),
  ('amplitude-wants-a-sales-call-before-it-will-tell-8253', 'Amplitude wants a sales call before it will tell me what it costs.', 'amplitude wants a sales call before it will tell me what it costs', 'Analytics', 'curated', 'published', 'Amplitude', 'Product analytics with the price on the website.', now()),
  ('zapier-charges-by-the-task-so-the-busier-my-d0ce', 'Zapier charges by the task, so the busier my business gets the more the automation costs me.', 'zapier charges by the task so the busier my business gets the more the automation costs me', 'Automation', 'curated', 'published', 'Zapier', 'Automation priced per workflow, not per run.', now()),
  ('webflow-is-a-design-tool-i-had-to-learn-017d', 'Webflow is a design tool I had to learn like a programming language, and I already know how to code.', 'webflow is a design tool i had to learn like a programming language and i already know how to code', 'Design', 'curated', 'published', 'Webflow', 'A site I can change without relearning it each time.', now()),
  ('my-wordpress-site-is-nine-plugins-holding-hands-and-09a8', 'My WordPress site is nine plugins holding hands and one of them breaks every month.', 'my wordpress site is nine plugins holding hands and one of them breaks every month', 'Developer tools', 'curated', 'published', 'WordPress', 'A site that stays up without maintenance Sundays.', now()),
  ('gitbook-started-charging-me-for-the-documentation-i-had-7481', 'GitBook started charging me for the documentation I had already written.', 'gitbook started charging me for the documentation i had already written', 'Knowledge', 'curated', 'published', 'GitBook', 'Docs that live in my repo and deploy with it.', now()),
  ('searching-confluence-tells-me-the-page-exists-but-never-060a', 'Searching Confluence tells me the page exists but never where it is.', 'searching confluence tells me the page exists but never where it is', 'Knowledge', 'curated', 'published', 'Confluence', 'A wiki where search actually works.', now()),
  ('a-hundred-and-twenty-nine-dollars-a-month-to-6830', 'A hundred and twenty-nine dollars a month to check where I rank for about eight keywords.', 'a hundred and twenty nine dollars a month to check where i rank for about eight keywords', 'Marketing', 'curated', 'published', 'Ahrefs', 'Rank tracking priced for one small site.', now()),
  ('preview-deployments-are-lovely-right-up-until-the-invoice-7017', 'Preview deployments are lovely right up until the invoice explains what they cost.', 'preview deployments are lovely right up until the invoice explains what they cost', 'Developer tools', 'curated', 'published', 'Vercel', 'Previews I can run on my own box.', now()),
  ('i-built-our-whole-roadmap-in-notion-and-now-c17a', 'I built our whole roadmap in Notion and now nobody outside the team can see it without an account.', 'i built our whole roadmap in notion and now nobody outside the team can see it without an account', 'Knowledge', 'curated', 'published', 'Notion', 'A public roadmap that doesn''t need a login.', now()),
  ('every-contract-i-send-starts-as-a-google-doc-f7da', 'Every contract I send starts as a Google Doc and ends as a screenshot someone signed in Preview.', 'every contract i send starts as a google doc and ends as a screenshot someone signed in preview', 'Product', 'curated', 'published', 'Google Docs', 'Signatures without a per-document fee.', now()),
  ('our-entire-pricing-model-is-one-spreadsheet-that-only-60de', 'Our entire pricing model is one spreadsheet that only one person is allowed to touch.', 'our entire pricing model is one spreadsheet that only one person is allowed to touch', 'Productivity', 'curated', 'published', 'Excel', 'Turning a spreadsheet into something a team can use.', now())
on conflict (normalized_statement) do nothing;

commit;

-- What landed, by category:
--   select category, count(*) from public.problems where origin = 'curated' group by category order by 2 desc;
--
-- To undo this seed entirely (only removes rows with these exact slugs):
--   delete from public.problems where slug in (
--     'sentry-s-free-tier-is-gone-by-wednesday-and-7415',
--     'algolia-charges-me-more-the-more-my-users-search-c421',
--     'auth0-was-free-right-up-until-i-had-real-9bc6',
--     'everything-about-firebase-is-easy-until-the-day-i-3830',
--     'my-side-project-got-one-good-day-of-traffic-3199',
--     'datadog-costs-more-every-month-than-the-infrastructure-it-a166',
--     'postman-turned-an-api-client-into-an-account-i-0cdd',
--     'calendly-charges-me-per-seat-for-three-people-who-f40e',
--     'airtable-counts-people-who-only-ever-look-at-the-67c5',
--     'jira-needs-a-project-manager-just-to-file-a-2fd7',
--     'notion-is-where-our-documentation-goes-to-become-unfindable-9880',
--     'i-open-figma-about-twice-a-month-and-pay-58f7',
--     'slack-hides-our-own-conversations-from-us-and-charges-4ae9',
--     'monday-sold-me-a-workflow-and-delivered-a-wall-51fd',
--     'stripe-left-me-as-the-merchant-of-record-so-3ffe',
--     'gumroad-takes-ten-percent-of-every-sale-for-hosting-e46e',
--     'freshbooks-starts-charging-by-how-many-clients-i-have-2471',
--     'paypal-s-fees-and-surprise-holds-make-small-payouts-5c24',
--     'chargebee-is-billing-software-that-needs-its-own-onboarding-282b',
--     'firstpromoter-wants-enterprise-money-before-i-have-a-single-9dd8',
--     'zendesk-is-built-for-a-support-department-there-are-837d',
--     'canny-costs-more-per-month-than-my-product-earns-e1de',
--     'atlassian-wants-twenty-nine-dollars-a-month-for-a-bb67',
--     'pingdom-prices-uptime-checks-like-i-m-a-bank-6ba8',
--     'typeform-wants-ninety-nine-dollars-a-month-before-it-edd2',
--     'google-forms-makes-my-product-look-like-a-2011-a7d8',
--     'chasing-customers-for-testimonials-over-email-means-i-have-83ae',
--     'mailchimp-keeps-billing-me-for-people-who-unsubscribed-months-2e0f',
--     'substack-takes-ten-percent-of-a-business-i-built-38ba',
--     'sendgrid-s-dashboard-is-a-maze-and-my-transactional-7866',
--     'i-write-everything-in-markdown-and-mailchimp-insists-i-554e',
--     'every-email-tool-prices-by-list-size-so-my-ceab',
--     'hootsuite-charges-agency-money-to-schedule-ten-posts-a-be76',
--     'writing-a-thread-in-the-x-composer-means-losing-2517',
--     'linktree-puts-its-own-brand-on-my-link-page-1ed4',
--     'loom-cuts-my-free-recordings-off-at-five-minutes-4d7b',
--     'since-atlassian-bought-loom-the-free-plan-has-quietly-c719',
--     'canva-put-the-template-i-ve-been-using-for-275d',
--     'ga4-takes-twenty-clicks-to-tell-me-how-many-8368',
--     'i-had-to-put-a-cookie-banner-on-my-fc7d',
--     'hotjar-s-free-plan-records-so-few-sessions-it-e1be',
--     'amplitude-wants-a-sales-call-before-it-will-tell-8253',
--     'zapier-charges-by-the-task-so-the-busier-my-d0ce',
--     'webflow-is-a-design-tool-i-had-to-learn-017d',
--     'my-wordpress-site-is-nine-plugins-holding-hands-and-09a8',
--     'gitbook-started-charging-me-for-the-documentation-i-had-7481',
--     'searching-confluence-tells-me-the-page-exists-but-never-060a',
--     'a-hundred-and-twenty-nine-dollars-a-month-to-6830',
--     'preview-deployments-are-lovely-right-up-until-the-invoice-7017',
--     'i-built-our-whole-roadmap-in-notion-and-now-c17a',
--     'every-contract-i-send-starts-as-a-google-doc-f7da',
--     'our-entire-pricing-model-is-one-spreadsheet-that-only-60de'
--   );
