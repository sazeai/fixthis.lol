## My take while talking to CHatGPT

"Now where does the fight goes, how would the saas offer their saas... As u removed the claim button..??? 

Now I am thinking it in deep. The hype is over, I am done, nobody came . Now make it a long term game 
Fuck the impressions, cliks and all. 

Now it becomes user > problems > saas offers with their products to switch from their existing software they arre using.

What u say, no vanity matrices answer from you... I want facts based on my actual codebase and market facts. "

## CHatGPT's answer after research and analysis of codebsae and market

"Yes. **I would pivot FIXTHIS in exactly that direction.** The launch-hype version was trying to manufacture excitement around bidding. The long-term version should be about **switching intent**.

I checked the current repo before saying that. The good news is: **you already built half of the right product underneath the game layer.**

### What FIXTHIS should become

The core object is no longer:

**Problem → advertisers bid for visibility**

It becomes:

**User is using X → X pisses them off because Y → they would switch if Z → alternatives make concrete offers**

That is a much stronger marketplace.

And the "fight" does **not disappear** when I remove `CLAIM $5` from the homepage.

The fight moves **inside the problem page**, where it actually makes sense.

A homepage card should basically be:

> **PROFOUND**
> Profound's $99 plan only tracks ChatGPT. To track 3 AI engines I have to jump to $399/mo.
>
> 🔥 7 ME TOO
> **3 alternatives responded →**

That's it.

No bid. No `#1`. No claim price. No visibility percentage. A normal buyer doesn't care about any of that.

Then they open the problem.

---

## The problem page becomes the marketplace

At the top:

> **The problem**
> Profound's $99 plan only tracks ChatGPT...
>
> **What would make me switch**
> Let me track the major AI engines without jumping to $399/mo.
>
> `7 people have this problem`

Then:

### Alternatives offering a fix

**Promptwatch**

> Tracks ChatGPT, Claude, Gemini and Perplexity on our $95 plan.

**Switch offer**
14-day free trial + we'll import your tracked prompts.

`TRY PROMPTWATCH →`

---

**AnotherProduct**

> Track 6 AI engines with no per-engine upgrade.

**Switch offer**
First month free for people switching from Profound.

`SEE OFFER →`

---

And under them:

> **Does your product solve this problem?**
> `MAKE AN OFFER →`

**That is where SaaS enters.**

The products are still fighting — except now they're fighting by making a **better answer to the user's problem**, rather than by paying you $5 more than the previous founder.

That is a healthier mechanic.

---

### Your own code is already screaming for this pivot

Your `problems` table already has `target_product_name` **and** `switch_condition`. The migration literally describes `switch_condition` as *"What would make you switch?"* and calls it the closest thing to a brief an advertiser reads before bidding.

Your post form already asks:

> Software / product
> What's pissing you off?
> What would make you switch?

And the current helper text explicitly says the switch condition is what an alternative reads before deciding to compete.

So **the demand side is already designed for the product I'm describing.**

The crap is mostly on the supply side.

Right now your `BidModal` makes a SaaS founder enter a perfectly useful set of information:

product name, one-sentence fit, URL, email, and `Your move`.

Then you ruin the clean marketplace concept by asking them for a bid and explaining:

> #1 gets 60%
> #2 gets 25%
> #3–5 share 15%

And the problem page currently turns that into an advertising dashboard: rank, views, clicks, CTR, bid amount and visibility percentage.

**That's the part I'd kill.**

Not because metrics are inherently bad. Because they are solving the wrong problem.

---

## And the market supports this direction

G2 already proves that **"I'm using X, show me alternatives"** is established buyer behavior. Their current comparison product literally asks buyers to select their current product and then shows alternatives. ([G2][1])

So you should **not** become another AlternativeTo/G2 clone.

Your unique data is:

> I'm using **X**
> I hate **this exact thing about X**
> I would switch if someone solved **Z**

That is far more useful than:

> "Looking for a Profound alternative."

And there is real commercial value in that signal. G2 itself now sells **Buyer Intent** to software vendors. Importantly, G2 says generic clicks and anonymous traffic aren't the valuable thing; vendors want to know who is actively researching their category or **their competitors**. ([Sell G2][2])

FIXTHIS could eventually produce an even sharper signal:

> **17 people specifically dislike your competitor's pricing structure and 8 said what would make them switch.**

That's not an impression.

That's a market.

There is another current buyer-behavior fact that matters here: Gartner reported this year that **67% of B2B buyers prefer a sales-rep-free experience and 70% prefer a completely digital self-service experience**. ([Gartner][3])

That argues strongly for **offer cards**, not "request demo from 6 vendors."

Let buyers inspect the answers themselves.

---

## Then how does FIXTHIS make money?

**Not now by charging someone $5 to appear.**

At the beginning, I would let SaaS companies make offers **free**.

You desperately need supply. Putting checkout before the founder can even respond to a complaint is exactly backwards when the marketplace is small.

Long term, the valuable thing you can charge for is **intent**, not position.

The loop I'd build is:

**User posts problem → ME TOO accumulates → relevant SaaS gets alerted → SaaS makes an offer → user chooses an offer → optionally says "I'm interested in switching."**

Later you can charge SaaS for things like competitor-problem alerts, unlimited responses, verified company profiles, or access to users who **explicitly opt in** to talk about switching.

That model grows with usefulness rather than pageviews.

And this matters: don't automatically hand vendors the email addresses of everyone pressing ME TOO. Your existing anonymous/support model is good. Only create a lead when somebody deliberately presses something like **"I'm interested in this offer."**

---

### I would also change the word **offer**

This should not just mean coupons.

An offer consists of:

**How we solve this exact complaint**

> “You can track four engines on our $95 plan.”

and optionally:

**Switching incentive**

> “We'll import your Prompt/keyword setup free.”

That means even a company with no discount can participate.

Your current code already has `product_tagline` and even an `offer` field on the featured placement model.

So conceptually, again, you're **very close**.

---

## What I'd remove

I would not delete the old auction database tomorrow. Leave it there while you transition.

But from the product UI I would remove:

`CLAIM $5`
`TAKE #1`
bid amounts
60/25/15 rotation explanation
CTR
impressions
visibility %
`LIVE FIGHT` injections
"unclaimed" as a primary browsing category

And probably eventually "battlefield."

Replace the supply-side language with:

**3 alternatives responded**

and:

**Make an offer**

That's considerably easier to understand.

---

The key change is philosophical:

**Old FIXTHIS:**
*"People complain, and founders buy the attention around those complaints."*

**Long-term FIXTHIS:**
*"People tell the market why they're ready to leave software. Competing products show them why they should switch."*

I would build the second company.

It is less gimmicky. It is also much closer to what your existing user-side schema already models, and much closer to where actual software-marketplaces make serious money: **high-intent buyers evaluating competitors**, not a funny auction for impressions. ([Sell G2][4])

And I'd keep **FIXTHIS.LOL**. The name actually makes *more* sense for this version.

[1]: https://www.g2.com/compare?utm_source=chatgpt.com "G2 | Compare Software and Services"
[2]: https://sell.g2.com/data?utm_source=chatgpt.com "Buyer Intent Data | Sell G2"
[3]: https://www.gartner.com/en/newsroom/press-releases/2026-05-20-gartner-survey-finds-sixty-nine-percent-of-b-two-b-buyers-turn-to-sales-reps-to-validate-ai-generated-insights?utm_source=chatgpt.com "Gartner Survey Finds 69% of B2B Buyers Turn to Sales Reps to Validate AI-Generated Insights"
[4]: https://sell.g2.com/quick-start-guides/leverage-insights/learn-about-buyer-intent-signals?utm_source=chatgpt.com "Learn about Buyer Intent signals | G2 Quick Start Guide"
"


## My counter take while talking for teh above plan

"User posts problem → ME TOO accumulates → relevant SaaS gets alerted → SaaS makes an offer → user chooses an offer → optionally says "I'm interested in switching."

This thing can be better too.. i.e user posts problem, me too accumulates, the system reads the problem and matches it with the relevant saas.... But may be it will require ai and all exactly determine what problem belongs to which saas, then only it makes sense for the alert. And one thing to notice... When there is no saas for the problem, the notification system is dead...it will work only for the already listed products . And as I guess it will require embedding of problems and saas solutions description to match them. Its hard.

"And this matters: don't automatically hand vendors the email addresses of everyone pressing ME TOO. Your existing anonymous/support model is good. Only create a lead when somebody deliberately presses something like "I'm interested in this offer."" And this model isn't there yet, u cant send emails to the users pressing me too... It will work only when u force login for pressing me too. So some of your ideas are good some are gated behind the future pivots"


## CHatGPT's answer after research and analysis of codebsae and market

"Exactly. You’re separating **what sounds good conceptually** from **what the current product can actually support**. That matters here.

I would simplify the long-term model again so it does **not depend on AI matching or logged-in ME TOO users**.

### The version I’d build now

**User posts problem → ME TOO accumulates → SaaS discovers the problem → SaaS makes an offer → users compare offers → click out to SaaS.**

That’s enough.

Your current product already has the two most valuable pieces of structured demand:

* `target_product_name` — what software they’re unhappy with.
* `switch_condition` — what would make them leave.

So don't make matching an AI problem yet.

If someone posts:

> Software: Profound
> Problem: $99 only tracks ChatGPT...
> Would switch for: multi-engine tracking under $100

You already know quite a lot.

A founder of Promptwatch doesn't need an embedding model to understand that.

---

### The alert system should NOT start as “FIXTHIS magically finds the right SaaS”

That creates exactly the problem you identified.

If Promptwatch isn't already known to FIXTHIS, there is nobody to alert.

And building a database of every SaaS + descriptions + embeddings + continuous matching is a whole separate company before you have proven anyone wants the alert.

Instead, make alerts **pull/subscription based** later.

A SaaS founder joins FIXTHIS and says:

> My product: Promptwatch
> Watch competitors: Profound, Peec, Otterly
> Categories: AEO / AI search monitoring

Now when someone complains about **Profound**, the match is deterministic.

No LLM.

No embeddings.

No hallucinated match.

Just:

`target_product_name = Profound`
→ notify vendors watching `Profound`.

You can later add:

> also notify me about any “AI search monitoring” problems

using your existing categories.

Only once you have hundreds/thousands of products and messy free-text demand does semantic matching become worth adding.

---

### And yes — I was ahead of the product with the ME TOO email idea

Current ME TOO is anonymous browser identity. You do **not** know who those people are.

So this:

> “7 people hit ME TOO → email them when Promptwatch responds”

**cannot happen today.**

And I would absolutely **not require login for ME TOO just to enable it.** That would damage your easiest demand signal.

For now:

**ME TOO = anonymous signal.**

Nothing more.

If later you want notifications, make that a completely separate opt-in:

> 🔥 12 people have this problem
> **Notify me when an alternative responds**

Then ask for email.

ME TOO stays one tap.

Email is optional.

But that's a later feature. **Don't make the business depend on it.**

---

## So where does the current marketplace end?

Today it can simply end here:

> **PROFOUND**
>
> “$99 only tracks ChatGPT. Three engines costs $399.”
>
> 🔥 12 ME TOO
>
> **Alternatives**
>
> **Promptwatch**
> “Track 4 major AI models from $95/mo.”
> `VISIT PROMPTWATCH →`
>
> **Peec**
> “Track multiple AI engines…”
> `VISIT PEEC →`
>
> ---
>
> Does your product solve this?
> **MAKE AN OFFER →**

That's already useful.

You don't need to know whether the visitor ultimately switches.

You don't need their email.

You don't need embeddings.

You don't need an AI agent.

And you don't even need automated SaaS alerts initially.

You can personally do exactly what you were doing with Promptwatch:

**Find real complaint → post it → tag the obvious competitor on X → “this looks like your customer.”**

If founders start responding, **then automate that behavior.**

---

And one more thing: I'd stop thinking of the SaaS database as something FIXTHIS must possess before this works.

The marketplace itself can build the database.

When Promptwatch clicks **MAKE AN OFFER**, you already collect product name, URL, tagline and email in your existing bid flow.

That becomes Promptwatch's product record.

Then later:

> “Want alerts when someone complains about Profound?”

✅ Yes.

Now you've organically acquired both:

**the SaaS** + **the competitor relationship**.

That is much cleaner than trying to embed the entire SaaS universe on day one.

So I'd define the product right now as:

**FIXTHIS collects switching problems. SaaS companies respond to the ones they can solve.**

Everything else — matching, notifications, lead capture, intent feeds — is an enhancement **after that behavior exists**, not a prerequisite."





## My counter take while talking for teh above plan
"But with current models how do the saas founder discover it.. that's the main thing... Currently its dependent on when u r going to founders and bringing them in like tweets or reddit.. there is no other way. But there should be, I don't know what?? What Ur data says from the research??"

## CHatGPT's answer after research and analysis of codebsae and market

"Yes. I dug into this because **this is now the real marketplace problem**:

> If a user posts “I hate Profound because X,” how does Promptwatch ever learn that demand exists without you personally tagging them?

There is no magic channel that eliminates initial distribution. **Every marketplace has to acquire its first suppliers.** But you can build FIXTHIS so that after a founder discovers it once, you never have to manually drag them to individual problems again.

And I would **not use embeddings for this yet.**

## The missing product is: **WATCH COMPETITORS**

The founder side of FIXTHIS should become:

> **Find people unhappy with your competitors.**

Founder enters:

**Your product:** Promptwatch
**Who do you replace?**

* Profound
* Peec AI
* Otterly
* Scrunch

That's it.

Now the matching is stupidly deterministic:

```text
new problem.target_product_name = "Profound"

→ everyone watching Profound gets alerted.
```

No LLM.

No embeddings.

No trying to understand whether some random complaint semantically matches Promptwatch.

Your database already stores `target_product_name`, specifically the software being complained about.

So exploit that.

---

## But you caught the chicken-and-egg problem

> What about Promptwatch before Promptwatch exists in FIXTHIS?

Correct.

**They won't get an alert.**

And there is no technical trick that changes that.

The solution is to separate:

**discovery of FIXTHIS**
from
**discovery of every future opportunity on FIXTHIS.**

You only need to acquire Promptwatch **once**.

After that, FIXTHIS does the work.

That is exactly how serious intent products operate.

G2's entire vendor proposition today is essentially:

> tell us which competitors/categories matter to you and we'll surface buyers researching them.

Their "Competitor Intent" specifically detects people researching competitors so vendors can intercept that demand. They then push signals into Salesforce, HubSpot, Slack, etc. ([Sell G2][1])

And G2 is explicitly selling the idea that **competitor research is a stronger commercial signal than anonymous traffic.** ([Sell G2][2])

Your version could be much simpler:

> Someone isn't merely researching Profound.
> **They're publicly saying why they want to leave Profound.**

That's potentially a stronger signal.

---

# So how do founders discover FIXTHIS the first time?

I found three mechanisms that actually make sense.

### 1. Google / AI discovers the complaint for them

This is more important than it initially sounds.

Founders actively monitor:

> competitor name
> competitor reviews
> competitor pricing
> competitor complaints
> "[competitor] alternatives"

In current founder discussions, people describe using Google Alerts, F5Bot, Reddit searches, X searches and competitor-monitoring tools specifically to catch mentions and complaints about competitors. ([Reddit][3])

So your problem URLs need to become things like:

**Title**

> Profound is too expensive for multi-engine tracking — alternatives

Rather than SEO metadata saying:

> 3 products are bidding to win these users

Your current problem metadata literally still describes the page in auction language: `"alternatives bidding to win them over"` and `"paid featured placement"`.

I'd change that.

If FIXTHIS eventually ranks/can be cited for:

> Profound complaints
> Profound alternatives
> Profound pricing complaints
> alternatives to Profound for multi-engine tracking

then **Promptwatch's founder/marketing people can discover the demand through the exact competitive research they're already doing.**

And this isn't only Google anymore. G2's March 2026 research found **51% of B2B software buyers now start research with AI chat more often than Google, and 71% use AI chat somewhere in the process.** ([G2 Learn Hub][4])

Unique, structured, first-hand complaint pages are exactly the kind of source you'd want search/AI systems eventually picking up.

This takes time. It isn't tomorrow's acquisition channel.

---

### 2. A dedicated **Founder Demand Feed**

This one I'd build much sooner.

Small link in nav/footer:

**For SaaS →**

Landing page:

> ## Steal customers from software that's letting them down.
>
> See problems people have with your competitors.
> Make an offer when you can solve one.

Then:

**Search competitor**
`[ Intercom________________ ]`

Results:

> **23 problems about Intercom**
> 184 people agree with them

And:

**🔔 Watch Intercom**

Email required.

Notice something important:

**They don't even need to list their SaaS yet.**

You can store:

```text
email
watched_product = Intercom
```

Then:

> New Intercom problem:
> “Pricing explodes when our support team grows.”
> 8 people agree.
>
> **Can you solve this? →**

Only when they press that do you ask:

> What's your SaaS?
> How do you solve it?
> What's your offer?

That makes onboarding dramatically easier.

---

### 3. Let the marketplace recruit its own suppliers

This is the piece I'd add to problem pages.

Under an unanswered problem:

> **Know a product that fixes this?**
> `INVITE THEM →`

Then give the user two options:

`Copy problem link`

or a prepared X post:

> 12 people on FIXTHIS are pissed about Profound's multi-engine pricing.
> @promptwatch looks like your territory 👀

Now **users can recruit supply**.

You were manually doing exactly this today with Promptwatch.

Turn your manual growth hack into a product feature.

That's marketplace behavior.

---

# There is another solution I like even more long term

### FIXTHIS should have products **before founders claim them.**

This is how established software marketplaces avoid requiring every vendor to create the entity themselves.

G2 allows a product page to exist and then the vendor **claims the profile** to manage it. ([G2][5])

Your current database unfortunately treats `products` as essentially advertiser accounts: product requires a domain, name, tagline, URL **and owner email**.

I'd eventually separate:

**Product entity**

```text
Promptwatch
promptwatch.com
AI search monitoring
```

from:

**claimed owner**

```text
founder@promptwatch.com
verified_at
```

Then FIXTHIS can know:

> Promptwatch exists

without pretending:

> Promptwatch has joined FIXTHIS.

Founder later clicks:

**Claim Promptwatch**

That's a mature marketplace data model.

Capterra/G2's supply model is also built around getting products listed/claimed free, then monetizing the vendor relationship later. ([capterra.com][6])

---

# And NO, I wouldn't solve this with embeddings yet

Suppose someone writes:

> “Notion becomes unusable when our knowledge base gets huge.”

An embedding could suggest:

Slite
Confluence
Obsidian
Coda
Guru
ClickUp
Document360

But which of those companies actually **wants Notion-switchers with this particular problem?**

AI doesn't know.

The founders know.

So let the SaaS declare:

> **We compete with Notion.**

That's vastly cleaner data.

Later you can augment it:

> FIXTHIS thinks you may also want to watch Coda. Add it?

Fine.

But embeddings should **improve your competitor graph**, not constitute the marketplace.

---

# Here's the loop I now believe in

This is different from the one I gave you before:

**USER**

`posts complaint about X`

↓

`ME TOO accumulates`

↓

**FIXTHIS**

`X is an explicit structured field`

↓

**FOUNDERS WATCHING X**

receive:

> “11 people are unhappy with X because of this.”

↓

Founder presses:

**I CAN FIX THIS**

↓

adds:

> My product
> How we solve this exact complaint
> Switch offer (optional)

↓

Problem shows:

### 3 products say they can fix this

↓

Users evaluate them.

That's the whole product.

---

And here's the uncomfortable fact from the research:

**You still have to get the first founders.**

G2 has hundreds of millions of buyer visits across its network now, so vendors voluntarily come because the demand already exists. ([Sell G2][2])

FIXTHIS doesn't have that yet.

There is no feature that lets a marketplace skip that phase.

For your first 50–100 SaaS founders, I would absolutely continue doing what you did with Promptwatch:

> Find a complaint about their competitor → tag founder → show them *their specific opportunity.*

But instead of doing that forever, every founder you acquire gets asked:

> **Which 3–10 competitors should FIXTHIS watch for you?**

Then you've turned one manual acquisition into a **permanent supply node**.

That, to me, is the first long-term feature worth building.

Not impressions.

Not another ranking algorithm.

Not embeddings.

**Competitor watchlists + opportunity alerts.**

And funny enough, you already have a `problem_subscriptions` table in the database for verified email subscriptions to individual problems.  So email-subscription infrastructure isn't completely foreign to your existing architecture either; you'd be adding a founder/competitor-watch concept beside it rather than reinventing the whole system.

[1]: https://sell.g2.com/quick-start-guides/leverage-insights/learn-about-buyer-intent-signals?utm_source=chatgpt.com "Learn about Buyer Intent signals | G2 Quick Start Guide"
[2]: https://sell.g2.com/data?utm_source=chatgpt.com "Buyer Intent Data | Sell G2"
[3]: https://www.reddit.com/r/SaaS/comments/1rp2prw/saas_founders_how_do_you_monitor_your_brand/?utm_source=chatgpt.com "SaaS founders: how do you monitor your brand reputation online?"
[4]: https://learn.g2.com/g2-2026-ai-search-insight-report?utm_source=chatgpt.com "The Answer Economy: G2's 2026 AI Search Insight Report"
[5]: https://documentation.g2.com/help/docs/finding-or-listing-a-product-on-g2?utm_source=chatgpt.com "Finding or listing a product on G2"
[6]: https://www.capterra.com/vendors/?utm_source=chatgpt.com "Capterra - For Vendors"
"


