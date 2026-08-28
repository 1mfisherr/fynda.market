# Name — Decided

**The name is `fynda.market`.** Decided 2026-08-27.

---

## The name

**Fynda** — spoken and written short form.
**fynda.market** — the full domain, which is also the tagline.

### Why it works

The domain is the sentence. The dot does the work of "a":

| Audience | Reads as |
|---|---|
| English speakers | **"find a market"** — instantly meaningful, no explanation needed |
| Swedish / Nordic | *fynda* = **to bargain-hunt**, *fynd* = a find. The exact emotional promise |
| German / French / Italian | A neutral, meaningless brand name |

Three readings from one word, and the German-speaking pilot market gets the meaningless one — which was the requirement.

### Against the criteria

- **Not German** ✓ (the hard constraint)
- **Portable** across European languages ✓
- **Not category-locked to flea markets** ✓ — "market" survives a pivot toward organiser infrastructure; "flea" would not. This was FleaFind's mistake
- **Spells itself over email** ✓ — the likely organiser channel
- **Short form exists** — "Fynda" for the app, newsletter, and how people will actually say it, with `.market` explaining on first contact (the Bandsintown pattern)

---

## Decisions taken

**Register `fynda.market` only.** Defensive registrations (`fynda.ch`, `.de`, `.eu`, `fyndamarket.com`) were considered and rejected: there is no brand or traffic to defend yet, the URL structure is `fynda.market/de/deutschland/koeln/` so country domains would sit empty, and a trademark is the real protection. Revisit if there is ever traffic worth protecting.

**`finda.market` not bought — 500 CHF registry premium.** Reasoning:
- Premium pricing is a barrier to everyone, so it will not be sniped. It can be bought later at roughly the same price.
- Typo defence is a scale problem, not a launch problem. At zero traffic there is nothing to leak.
- Discovery channels are visual (search, Instagram, TikTok, newsletter) — people will see the name written before typing it.

**The `y` is deliberate.** `finda.market` would have zero spelling friction but reads as a URL rather than a company, and would be near-impossible to trademark or defend. Flickr, Tumblr, Etsy and Klarna all carry odd spellings without harm. The `y` is the part that is ownable.

---

## Known trade-off, accepted

`fynda.com` is owned by someone else. Some direct-navigation traffic will leak there permanently. Accepted for now; worth approaching the holder if the business reaches real revenue.

---

## Method note (for future domain work)

Three availability-check methods were used in this session and **only one was reliable**:
- ❌ `nslookup -type=NS` — false positives on parked domains
- ❌ Registrar marketing pages — no data
- ✅ **RDAP** — authoritative. `https://rdap.verisign.com/com/v1/domain/NAME.com` for `.com`, `https://rdap.org/domain/NAME.TLD` (follow redirects, `curl -L`) for others. 404 = available, 200 = taken.

Several names were wrongly reported as free before RDAP was used. Always verify at a registrar before committing.

---

owner: Delfim
last_reviewed: 2026-08-27
status: DECIDED
