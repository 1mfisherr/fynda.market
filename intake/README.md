# Intake

Markets researched by hand or by agent before they enter the database. One JSON file per market in `intake/<country>/<slug>.json` (`de`, `ch`); `node scripts/import-intake.mjs intake/ch --dry-run` shows what would be created, without the flag it creates it as `status = 'unverified'` — not published until someone flips it to `active` (`docs/ARCHITECTURE.md` §Import).

A country is its places file in `scripts/lib/` (`places-de.mjs`, `places.mjs` for Switzerland), which exports `intake`: currency, time zone, the box its coordinates must fall in, its locales and its regions. A new country is a new places file and one line in `PLACES` in the importer — nothing else in it is about any one country.

**Rule:** a directory (marktcom, meine-flohmarkt-termine, flohmarkt.de …) may only tell you a market exists. Every fact — dates, hours, fee, address, organiser — is read from the organiser's own page, and that page is `source_page`. Nothing is copied: no prose, no photos.

## Shape

```json
{
  "slug": "flohmarkt-mauerpark-berlin",
  "name": "Flohmarkt am Mauerpark",
  "kind": "flohmarkt",
  "town": "Berlin",
  "region": "Berlin",
  "venue": { "name": "Mauerpark", "address": "Bernauer Straße 63–64", "postal_code": "10435" },
  "lat": 52.5419, "lng": 13.4022,
  "rhythm": { "de": "Jeden Sonntag", "en": "Every Sunday" },
  "opening": { "start": "10:00", "end": "18:00" },
  "dates": ["2026-09-27", "2026-10-04"],
  "dates_from": "listed | rhythm",
  "fee": 0, "currency": "EUR",
  "website": "https://www.flohmarktimmauerpark.de/",
  "organiser": { "name": "…", "website": "https://…", "email": null },
  "source_page": "https://…/termine",
  "facts": ["~300 stalls", "outdoor", "runs in rain", "second-hand clothes, records, Berlin design", "entry free", "S/U Bahn: …"],
  "checked": "2026-09-22",
  "notes": "anything uncertain, in one line"
}
```

- `slug`: lower-case ASCII, `name-town`, umlauts flattened (`ue`, `oe`, `ae`, `ss`). Names are not translated (`docs/ARCHITECTURE.md` §URLs).
- `kind`: one of `flohmarkt` `hallenflohmarkt` `nachtflohmarkt` `kinderflohmarkt` `troedelmarkt` `antikmarkt` `strassenmarkt`.
- `town`: the postal town on the venue's address. `region`: its code (`BY`, `VD`) — in Germany the Bundesland's name works too (`Bayern`). `rhythm`, and `description` when given, carry every locale of the country (Switzerland: de, fr, it, en). `currency` is the country's (`CHF`, `EUR`); `organiser.locale` the language to write to them in, if not the country's first.
- `dates`: every date from today to 120 days out. `dates_from` says whether the organiser lists them (`listed`) or you derived them from the stated rhythm (`rhythm`) — both are imported as `confirmed` on the day the page was read — an organiser who states a rhythm is trusted (Delfim, 2026-10-10); the ledger marks derived ones `reported`.
- `opening`: 24 h. Omit `end` if the organiser gives none. Where hours differ by day, add `opening_by_weekday` — `{ "wed": { "start": "14:00", "end": "18:00" }, "sun": { … } }`, keys `sun`…`sat` — which wins on the days it names.
- `fee`: visitor entry in EUR, `0` for free, `null` if not stated.
- `facts`: short bullet strings, each true on the source page. No adjectives you did not read there. The description is written from these later, in the site's voice.
- `notes`: whatever a second reader should know — "dates page shows 2025 only", "two organisers, chose the one on the poster".
