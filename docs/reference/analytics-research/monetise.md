# Data as a future revenue path — research report, 2026-09-17

## 1. Who buys data like this, and in what form

**Event-intelligence aggregators (the most realistic buyer).** PredictHQ sells "verified" event data to retail, hospitality and transport for demand forecasting and dynamic pricing, via API, Snowflake and AWS Data Exchange, on custom enterprise pricing. They aggregate "hundreds of sources", report that at least 30% of raw events have wrong details and that they delete up to 45% of events from public APIs as inaccurate or spam. What they lack is exactly what fynda has: deduplicated, geocoded, date-certain, organiser-confirmed occurrences. They pay for coverage-by-country feeds, not per record; expect low five figures per year for a niche national feed, not more.

**AI licensing.** Reddit gets a reported $60M/yr from Google and ~$70M/yr from OpenAI; Yelp licenses listings and reviews to OpenAI and Apple. Those deals are about scale (hundreds of millions of documents). 160 markets is not an AI deal; a Europe-wide verified events corpus in five years might be a small one.

**Points of interest are now free.** Foursquare open-sourced 100M+ POIs under Apache 2.0 in Nov 2024. "Where is the market" has no price; "when is it, is it confirmed, is it cancelled" does.

**Foot-traffic / location intelligence.** Placer.ai and SafeGraph sell app-SDK location panels; reported prices $12k–$50k+/yr, but no figure traces to a named buyer. They do not buy web analytics from directories, and critics call their model incompatible with GDPR. Not a buyer.

**Tourism.** discover.swiss is a non-profit cooperative data hub with usage-based pricing and tourismdata.ch catalogues sources. DMOs are a distribution channel and a credibility signal, rarely a payer.

**Search-demand series.** Semrush/Similarweb sell subscriptions at $165–$456/month. fynda's search terms are far too thin to be a product.

**Local media.** No established DE/CH market for paid event-listing feeds was found; the norm is embed/swap.

Sources: predicthq.com/pricing and data-quality pages, PredictHQ Snowflake listing, CNBC and Dataconomy on Reddit's AI revenue, Yelp data licensing page, Foursquare open-source places announcement, GrowthFactor on Placer.ai pricing, Ariadne on GDPR, discover.swiss, tourismdata.ch, StartUs on Semrush pricing.

## 2. Which asset is worth more

**The verified dataset, clearly.** It is what aggregators pay for, it is not personal data, and it compounds (2,350 occurrences today, a multi-year history of confirmations and cancellations in three years). Behavioural data at this scale is thin, is personal data, and is the thing that ended Avast and Grindr's business models. Its real value is internal (ranking, "which markets people search for that we lack") and as a **derived enrichment column** on the dataset — an "interest index per market per month", the way PredictHQ sells "predicted attendance". Do not plan to sell behaviour; plan to sell facts enriched by anonymous aggregates.

## 3. What must be true legally

- **Purpose limitation, Switzerland.** Data may only be collected for a purpose recognisable to the person and further processed compatibly (Art. 6(3) FADP). Processing for non-personal purposes such as statistics is a justification if data are anonymised as soon as the purpose permits (Art. 31(2)(e) FADP).
- **Purpose limitation, EU (German visitors, and Germany next).** Statistical further processing is deemed compatible if Art. 89 safeguards apply (Art. 5(1)(b), 6(4) GDPR). The EDPB's draft anonymisation guidelines (7 July 2026) add that anonymisation is itself processing needing a legal basis and that people must be told it will happen. **Plain English: one sentence in the privacy page ("we build anonymous, aggregated statistics from usage and may share or license those statistics with partners") makes tomorrow's aggregate licence compatible; "licensing your data to third parties" would not be needed and would be untrue.** *(Checked the same day: `src/lib/legal/privacy.ts` already says this.)*
- **Is the daily HMAC personal data?** IP addresses are personal data in Switzerland (Federal Supreme Court, Logistep, 1C_285/2009) and in the EU (Breyer). Pseudonymised data stays personal for whoever holds the key (EDPB Guidelines 01/2025); after EDPS v SRB (CJEU C-413/23 P, 4 Sept 2025) it may be non-personal for a recipient who cannot reverse it. **Shape: treat the hash as personal data while the key exists; once the key is destroyed and never logged, the hash is effectively anonymous. Document the key destruction.**
- **Aggregation thresholds.** Practice is a minimum cell of 5, 10 or 11 people; the EDPB test is no singling-out, no linkage, no inference, including from aggregates. Use 10 and suppress smaller cells.
- **Raw events vs aggregates.** Per-visitor rows are personal data, purpose-bound, and re-identifiable even when "de-identified" (Avast's "All Clicks Feed"). Never licensable in practice; aggregates over 10+ people normally are.
- **Consent vs legitimate interest for the persistent id.** Switzerland: no consent needed, but inform and offer opt-out (Art. 45c TCA, FDPIC guidelines). Germany: §25 TDDDG requires consent for any non-essential storage on the device, with no analytics exemption. The current design (cookie only with consent, cookieless edge counting otherwise) is correct for both.
- **Where a lawyer hour is needed:** the privacy-page wording before monetisation, and the first licence contract.

Sources: onlinekommentar.ch on Art. 6(3) FADP, swissrights.ch Art. 31 FADP, Thomas Helbing on GDPR purpose change, Freshfields on the EDPB draft anonymisation guidelines, swissblawg on Logistep, EDPB Guidelines 01/2025, Jones Day on EDPS v SRB, Mithras on small-cell suppression, FTC Avast order, datenrecht.ch on the FDPIC cookie guidelines, Inside Privacy on German cookie guidance.

## 4. What to capture or preserve now

- Append-only raw events with `schema_version`, event time in UTC, `received_at`, and the site version; never rewrite history.
- Per fact: source URL, fetch timestamp, verification date, verifier (human/script), method; keep the facts ledger immutable and versioned.
- Organiser confirmations: who, when, via which token, what they confirmed, plus the text shown.
- Consent records: timestamp, banner version, exact text, choice, locale; store the privacy-page version alongside (buyers ask for a consent audit trail and provenance linked record-by-record).
- Stable ids: an immutable `market_uid` and `occurrence_uid` that survive renames, merges and address changes, with a merge table.
- Geo: store exact coordinates for markets; for behaviour store nothing below canton/city-25km, and never a visitor location.
- A short data-lineage note: what each table is, where it came from, under what terms, when the day-key is destroyed.
- Organiser terms: a line granting fynda a licence to use, aggregate and sublicense submitted data.

## 5. Content ownership

The EU sui generis right (Directive 96/9, Art. 7) protects substantial investment in obtaining, verifying or presenting a database, and CV-Online v Melons (CJEU 2021) makes infringement depend on harm to that investment. But Art. 11 grants it only to EU nationals and EU-established companies; a Swiss company gets it only if an EU entity is the maker. Switzerland has no sui generis right: copyright covers only an original selection or arrangement (a chronological list is not), and Art. 5(c) UWG stops wholesale technical copying without own effort. Inbound risk from re-verifying facts off organiser sites is low (facts are not copyrightable; single organiser pages are not protected databases), but a buyer will ask, so the per-fact source ledger is the evidence. Practical shape: the contract, not IP law, is what protects a licensed dataset; and if Germany becomes material, an EU entity as database maker is worth a lawyer hour.

Sources: Bird & Bird on CV-Online, EUR-Lex consolidated Directive 96/9, Primerus and Lexology on Swiss database protection.

## 6. Cautionary tales

- **Avast/Jumpshot** ($16.5M, FTC 2024): sold "de-identified" browsing data to 100+ buyers while promising to block tracking; the data was re-identifiable.
- **Grindr** (NOK 65M, upheld on appeal Oct 2025): shared location, IP and ad-ID with partners on invalid consent.
- **SafeGraph** (2022): $160 bought a week of visits to Planned Parenthood clinics; Google banned its SDK.
- **Kochava, Gravy, Mobilewalla** (FTC 2024–26): sold sensitive-location rows without verifiable consent.

Common thread: row-level data, a privacy promise contradicted by practice, "de-identified" taken on faith. The opposite of all three keeps fynda safe.

## Ranked recommendations

1. **The privacy-page sentence** about anonymous aggregate statistics that may be shared or used commercially — already present; have a lawyer read it before the first licence.
2. **Treat the dataset as the product.** A lineage note, immutable `market_uid`/`occurrence_uid`, and a facts ledger that is append-only with source URL, fetch time, verifier and method per row.
3. **Record consent and organiser confirmations as evidence**: timestamp, version of banner/terms, text shown, choice, locale.
4. **Add a licence line to organiser terms** granting rights to use, aggregate and sublicense submissions.
5. **Document the daily key destruction** in code and lineage note; never log the key.
6. **Build one aggregate table** (market × week: views, saves, calendar adds, outbound clicks, suppressed under 10) as the only behavioural product that ever leaves the house.
7. **Never sell raw events**; write it into the lineage note so it survives you.
8. **When occurrences pass ~10,000 across two countries**, approach PredictHQ's data-provider side and discover.swiss; before that, the asset is too small to price.
9. **If Germany becomes material**, ask a lawyer whether an EU entity should be the database maker to gain the sui generis right.
