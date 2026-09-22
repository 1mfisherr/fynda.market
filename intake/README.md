# Intake

Markets researched by hand or by agent before they enter the database. One JSON file per market in `intake/<country>/<slug>.json`; `node scripts/import-intake.mjs intake/de --dry-run` shows what would be created, without the flag it creates it as `status = 'unverified'` — not published until someone flips it to `active` (`docs/GERMANY-SPEC.md` §Data intake).

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
- `town`: the postal town on the venue's address. `region`: the Bundesland, in German (`Bayern`, `Nordrhein-Westfalen`).
- `dates`: every date from today to 120 days out. `dates_from` says whether the organiser lists them (`listed`) or you derived them from the stated rhythm (`rhythm`) — derived dates are imported as `unverified`, listed ones as `confirmed`.
- `opening`: 24 h. Omit `end` if the organiser gives none.
- `fee`: visitor entry in EUR, `0` for free, `null` if not stated.
- `facts`: short bullet strings, each true on the source page. No adjectives you did not read there. The description is written from these later, in the site's voice.
- `notes`: whatever a second reader should know — "dates page shows 2025 only", "two organisers, chose the one on the poster".
