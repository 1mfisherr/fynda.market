# Fynda's organiser side — what to build before Germany

Research note, 2026-09-16. Sources read: `docs/PRODUCT.md`, `docs/PLAN.md`, and the analogues listed at the end.

---

## 1. The job, and the three moments

**The organiser's job:** get enough of the right people to turn up on the day — and nobody to turn up on a day it isn't happening — with as little admin as possible.

A church bazaar committee or a club treasurer does not want a dashboard; they want Saturday to work.

The three moments in an organiser's year where a directory is actually useful:

1. **Dates are fixed** (once a year, winter or spring for the outdoor season). The only time the organiser is *looking for* places to publish: own site, Facebook, local paper, the directories they already know. A directory not in their head at this moment gets no data until next year.
2. **The week before each market.** Checking the weather, reminding sellers, answering "is it on?" calls. The facts are fresh and there are ten seconds to spare. This is when a one-button question gets answered.
3. **The cancellation morning.** Rain at 06:00, a decision at 06:30, then a scramble to tell everyone through five channels. High stakes, one to three times a year for an outdoor market, never for an indoor one.

Moment 1 is where competitors fight (submission forms). Moment 2 is where nobody is. Moment 3 is where PRODUCT.md wants to be — but it is rare, and a tool has to already be in the organiser's hand at 06:30 to be used.

## 2. Three product shapes, smallest to largest

### (a) No login. A timed e-mail with three buttons, and a magic link for edits

Seven days before a market's next date, the organiser gets a mail: *"Fynda lists [market] on Saturday 26 September, 08:00–16:00 at [place]. Is that right?"* Three buttons: **Yes, it's on** · **It's cancelled** · **Something has changed**. The third opens a page (signed link, no password) with exactly four fields: next dates, number of stalls, indoor/outdoor, a photo. Every answer writes a row, pings Telegram, and the market page shows **"Confirmed by the organiser on 19 Sept"** — or a cancellation banner. Once a year (before the season) the same mail asks for the season's dates instead.

- **Organiser gets:** nothing to learn, nothing to log in to. A visible "confirmed by the organiser" mark on a page Google already sends people to. If they cancel, the page says so within the hour.
- **Fynda gets:** the confirmed-on date from the one source that counts; cancellations before visitors travel; the two tier-1 facts (size, indoor/outdoor) from anyone who clicks the third button; a photo now and then; and a clean measure of whether organisers will engage at all.
- **Build:** 3–5 days. Token-signed links per organiser, one Resend template in four languages, one Function for the three answers, the edit page with four fields, a moderation view (`organiser_claims` can hold it), and — the part people forget — **an on-demand rebuild or a tiny dynamic banner**, because a cancellation answered Saturday 06:30 is useless if the site rebuilds at 03:00 Sunday. Budget a day for that.
- **Failure mode:** silence. Club mailboxes go unread; "some contact" is often a website, not an address; the treasurer changed. Mitigation is cheap: Delfim's watch agent checks the source URL for non-responders, and the page falls back to "Checked by Fynda on 19 Sept". Second failure: anyone holding the link can edit. At 107 organisers, moderate every text edit before publish; auto-publish only the yes/no.
- **Analogue:** Google Business Profile's "confirm your hours for the upcoming holiday" mails. Google cannot get most owners to post updates (34–40% never post once), but a timed, one-click confirmation of a fact they already know gets answered — because it costs seconds and arrives when the fact is on their mind. It is the same mechanism as Bandsintown's model in miniature: the supply side maintains one fact in one place, everyone else pulls.

### (b) A lightweight owner page

Claim by e-mail, then a persistent "your market" editor: description, dates, opening times, fee, photos, size, indoor/outdoor, contact, a cancel button. Still no password — the magic link is the login.

- **Organiser gets:** control of how their market looks on a site that ranks. Fix the wrong postcode, upload the poster, correct the fee.
- **Fynda gets:** richer pages, real photos (the decided route for photos), fewer errors — *if* the pages get maintained.
- **Build:** 8–12 days for a small team. Editing UI in four locales, image upload and resizing, per-field moderation, rebuild triggers, abuse handling, plus the mail from (a) because without a prompt nobody comes back.
- **Failure mode:** the claimed-and-abandoned page. Claiming is a one-time act, maintaining is not, and an "owner-managed" page showing last year's dates is *worse* for the freshness thesis than an unclaimed one. The German analogue is already live: **Flohmap.de** gives organisers a full free dashboard — edit events, manage stalls on a map, message vendors, cash ledger. Volunteer-run, years old, and it has not made German data fresher or dented meine-flohmarkt-termine. A dashboard is not the bottleneck.
- **Analogue that worked:** Yelp, Google Business Profile and Nextdoor claims — all launched onto an audience that was already enormous. With 0 claims in 12 days at 10–25 visitors a day, Fynda is not there.

### (c) The broadcast tool: cancel once, tell everyone

The organiser presses one button and the cancellation reaches the Fynda page, the newsletter subscribers within 25 km, the `.ics` feeds, their Google Business Profile, and their Facebook page.

- **Organiser gets:** the best thing anyone could offer them at 06:30 on a wet Saturday.
- **Fynda gets:** the position PRODUCT.md names — whoever the organiser tells first owns the truth. Delegated access to their Google listing is a real switching cost.
- **Build, honestly:** 15–30 days, plus weeks of waiting you do not control. Google Business Profile API access needs an application and approval; posting to a Facebook page needs a Meta app review; both need the organiser to *have* a verified listing or page and to grant OAuth — which means storing tokens, which means accounts, which Fynda has ruled out. Most Swiss club markets have neither a Google listing nor a managed page. The organiser's own website cannot be reached at all.
- **Failure mode:** two. Frequency: an outdoor organiser cancels one to three times a year, an indoor one never; a tool used once a year is forgotten by the time it is needed. And dependence on platforms' permissions: **Songkick built Tourbox** for artists to publish dates across platforms, had 100,000 artists on it — and Spotify still ended the 13-year partnership in 2024 and switched to Bandsintown. Distribution built on other people's APIs is rented.
- **Analogue that worked:** Bandsintown — but it became the place artists *keep* their dates, and Spotify chose to pull from it after a decade. OpenTable is the tool-first success PRODUCT.md cites, but it replaced a paper book used every single night. Flea-market organising has no nightly pain to replace.

## 3. Recommendation

**Build (a), only (a), and treat it as an experiment with a kill criterion.**

Reasoning:

- Every analogue that got supply-side adoption had one of two things: an audience the supplier wanted (Yelp, Google, Nextdoor, Eventbrite) or a high-frequency chore it replaced (OpenTable, Untappd's chalkboard menu). Fynda has neither yet. The only lever left is **cost to the organiser** — and (a) drives it to ten seconds, timed to the moment they already have the answer.
- It tests the whole thesis. "Give organisers something they need and the data arrives" is unproven in this category. If an organiser will not press one of three buttons about their own market next week, they will not fill in a dashboard or connect a Google account. Better to learn that for 4 days of work than 25.
- The visitor product needs it anyway. "Bestätigt am … durch den Veranstalter" is the differentiator, the quotable claim for AI answers, and the trust signal for Google. Today every confirmed-on date comes from Fynda's own checking; this is the cheapest way to make some come from the organiser.
- It is the intake tool for Germany (section 5), so the code is not throwaway.

Concrete scope: the 23 markets that already qualify (about 35 dates in the window), then the annual "what are your dates this season" mail to all 107 organisers before the Swiss spring season. Three buttons, four fields, moderation via the existing Telegram ping and `open_organiser_claims`, on-demand rebuild on a cancellation.

**The one metric: the answer rate — the share of confirmation mails that get any button pressed within seven days.**

Read it after four weeks (two mail rounds). Rough thresholds: above 25%, the thesis is alive — extend the mail to every organiser and plan (b) after Germany. Between 10 and 25%, keep it running as a cheap data feed but build nothing more for organisers. Below 10%, stop building for organisers entirely: the watch agent and visitor reports become the truth loop, and "confirmed" means "checked by Fynda". Any of these outcomes is fine. What is not fine is spending the pre-Germany week on (b) or (c) without knowing which world you are in.

Secondary things to read but not steer by: how many of the "something changed" answers deliver size and indoor/outdoor; how many cancellations arrive before the day.

## 4. What NOT to build before Germany

- **An owner dashboard (b).** The claim button has been on 157 pages for 12 days with 0 claims. The button is not the problem; the audience is. Germany is how the audience arrives. A dashboard now is a room with no one in it, and it needs maintenance in four locales.
- **Broadcast to Google and Facebook (c).** Platform reviews alone take longer than the ten weeks left, it requires storing organiser credentials (accounts, which are settled as "no"), and most Swiss organisers have nothing to broadcast to. Revisit in 2027 if the answer rate says organisers engage.
- **A richer claim flow, organiser analytics, photo galleries.** None changes the number of people who want to claim. "Your page had 40 visitors" becomes a reason to claim at 4,000.
- **Anything vendor-facing, stall booking, payments.** Scope; Flohmap.de already does it for free in Germany and it has not moved the market.

One week of build capacity, one real question — will organisers engage at all? Spend the week answering it, not decorating a hypothesis.

## 5. How (a) scales to Germany

Thousands of markets, no organiser contacts at first, and the whole thing has to run without Delfim reading every row.

- **The confirmation mail becomes the intake tool.** Every German market that arrives with an e-mail address gets one mail: *"Fynda lists your market like this. Is it right?"* Same three buttons. A "yes" is a confirmed-on date and a verified contact on day one. Cost per market is a fraction of a cent. No claim form is needed; the first mail *is* the claim.
- **Auto-publish the buttons, moderate the text.** Yes/no/cancelled goes live without review. Field edits and photos queue for approval — at German volume that queue is what the daily Metabase alert is for, and the watch agent can auto-approve edits that match the source URL.
- **One organiser, one link, many markets.** Germany's supply side is lopsided: commercial operators (melan.de is one, running markets and publishing dates) run dozens of markets each, while a church runs one. The token belongs to the organiser, not the market, so an operator gets one mail listing all next week's dates with one "all correct" button. Twenty operators may cover a third of German dates — those get a personal e-mail from Delfim, in English is fine, offering a feed.
- **Accept a feed, don't build a broadcaster.** This is the Bandsintown lesson turned the right way round. Operators already maintain their dates in one place (their site, a Google Calendar, an Excel). Let them hand Fynda a URL or `.ics` and have the watch agent read it weekly. Fynda becomes a *puller* — cheap, needs no platform permission, and it is exactly the engine already planned as the German intake tool. Large operators get freshness for free; Fynda gets the confirmed-on date from the source.
- **Silence has a meaning.** No organiser answer and a source URL that stopped changing means "Last checked by Fynda on …", then no future dates and no date pages — the page-exists-because-there-is-content rule doing its job. Unanswered mails generate nothing.
- **Watch the answer rate by organiser type.** If commercial operators answer and clubs do not, the German outreach plan writes itself.

The honest summary: build almost nothing *for* organisers yet. Build one very cheap way to *ask* them, measure whether they answer, and let that decide what comes after Germany.

---

### Sources

- Google Business Profile posting rates: [The Media Captain](https://www.themediacaptain.com/25-google-business-profile-stats/), [Searchlab](https://searchlab.nl/en/statistics/google-business-profile-statistics-2026); holiday-hours confirmation: [Google support](https://support.google.com/business/answer/6303076?hl=en), [Search Engine Journal](https://www.searchenginejournal.com/now-you-can-pre-set-holiday-hours-on-your-google-my-business-page/144470/)
- Unclaimed GBP share (~11%): [Starfish](https://starfish.reviews/google-business-profile-statistics/)
- Yelp claiming and free tools: [Yelp for Business](https://business.yelp.com/resources/articles/ultimate-guide-to-claiming-your-yelp-page/?domain=local-business)
- Nextdoor business pages: [Nextdoor](https://business.nextdoor.com/en-us/blog/guide-to-claiming-your-nextdoor-business-page)
- OpenTable's tool-first onboarding: [Harvard D3](https://d3.harvard.edu/platform-digit/?p=11405)
- Untappd for Business (replacing the chalkboard): [Untappd Lounge](https://lounge.untappd.com/what-is-untappd-for-business-a-complete-guide/)
- Songkick Tourbox (100,000 artists): [PR Newswire](https://www.prnewswire.com/news-releases/songkick-introduces-tourbox-for-artists-get-more-fans-to-your-shows-155701985.html); Spotify switching to Bandsintown after 13 years: [Music Business Worldwide](https://www.musicbusinessworldwide.com/spotify-integrates-bandsintown-listings-as-its-songkick-partnership-comes-to-an-end2/)
- Bandsintown Manager (2014): [Wikipedia](https://en.wikipedia.org/wiki/Bandsintown)
- Eventbrite distribution partners: [Eventbrite](https://www.eventbrite.co.uk/blog/academy/eventbrites-distribution-partners-fds00/)
- Meetup organiser backlash: [Forbes](https://www.forbes.com/sites/rachelsandler/2019/10/15/meetup-users-revolt-against-2-event-feeand-blame-wework/)
- Flohmap.de organiser dashboard: [flohmap.de/hilfe](https://flohmap.de/hilfe)
- Organiser view of rain cancellations: [Flohmarkt Altefeld](https://flohmarkt-altefeld.de/wetter-laune-und-flohmarkt/)
