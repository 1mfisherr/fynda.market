/**
 * SAMPLE DATA — not real listings, not for publication.
 *
 * The default data source when FYNDA_DATA_SOURCE is unset, so CI and a plain
 * `npm run verify` need no database. These rows exist so the templates can be
 * built and reviewed against realistic shapes: a confirmed market, an unverified one, a cancelled
 * one with a reason, and one with no times known.
 *
 * They are shaped exactly like what `publishable_markets` will return, so
 * replacing this module with a Supabase query changes no template.
 *
 * Nothing here may be deployed. getMarkets() in markets.ts refuses to use
 * fixtures when FYNDA_DATA_SOURCE=supabase, and the build prints a warning
 * every time it falls back to them.
 */

import type { Market } from './types';
import { thisWeekend, parseDate, toIso } from './format.ts';

/** Dates are generated relative to the build date so the page is never empty. */
function weekendDates() {
  const { start, end } = thisWeekend();
  const nextSaturday = new Date(parseDate(start));
  nextSaturday.setDate(nextSaturday.getDate() + 7);
  const inFourWeeks = new Date(parseDate(start));
  inFourWeeks.setDate(inFourWeeks.getDate() + 28);
  return { saturday: start, sunday: end, nextSaturday: toIso(nextSaturday), later: toIso(inFourWeeks) };
}

export function sampleMarkets(): Market[] {
  const { saturday, sunday, nextSaturday, later } = weekendDates();

  return [
    {
      id: '00000000-0000-4000-8000-000000000001',

      slug: 'flohmarkt-kanzlei-zuerich',
      recurrenceText: 'Jeden Samstag, ganzjährig',
      name: 'Flohmarkt Kanzlei',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zurich',
      region: 'Zürich',
      regionSlug: 'zurich',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Kanzleiareal',
      addressLine: 'Kanzleistrasse 56',
      postalCode: '8004',
      lat: 47.376,
      lng: 8.523,
      next: { date: saturday, startTime: '08:00', endTime: '16:00', status: 'confirmed', confirmedAt: '2026-08-26' },
      upcoming: [
        { date: nextSaturday, startTime: '08:00', endTime: '16:00', status: 'confirmed' },
      ],
      stallCount: 120,
      sellerMix: 'private',
      entryFee: 0,
      setting: 'outdoor',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',

      slug: 'flohmarkt-buerkliplatz-zuerich',
      recurrenceText: 'Jeden Samstag, Mai–Oktober',
      name: 'Flohmarkt Bürkliplatz',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zurich',
      region: 'Zürich',
      regionSlug: 'zurich',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Bürkliplatz',
      addressLine: 'Bürkliplatz 1',
      postalCode: '8001',
      lat: 47.3667,
      lng: 8.5417,
      next: { date: saturday, startTime: '06:00', endTime: '17:00', status: 'confirmed', confirmedAt: '2026-08-24' },
      upcoming: [{ date: nextSaturday, startTime: '06:00', endTime: '17:00', status: 'confirmed' }],
      stallCount: 250,
      sellerMix: 'private',
      entryFee: 0,
      setting: 'outdoor',
      rainPolicy: 'runs',
      gettingThere: 'Nicht mit dem Auto. Keine Besucherparkplätze am Platz. Tram 2, 8, 9 und 11 halten direkt davor.',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',

      slug: 'flohmarkt-am-see-wollishofen',
      recurrenceText: 'Jeden 1. Sonntag des Monats von April bis Oktober',
      name: 'Flohmarkt am See, Wollishofen',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zurich',
      region: 'Zürich',
      regionSlug: 'zurich',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Seeufer Wollishofen',
      addressLine: 'Mythenquai 95',
      postalCode: '8038',
      lat: 47.3453,
      lng: 8.5361,
      // Between editions: no date, the months it runs, when it last ran.
      upcoming: [],
      lastDate: '2026-10-04',
      earlier: [
        { date: '2026-10-04', status: 'confirmed', seen: true },
        { date: '2026-09-06', status: 'confirmed' },
        { date: '2026-08-09', status: 'cancelled' },
      ],
      seasonFrom: 4,
      seasonTo: 10,
      sellerMix: 'private',
      setting: 'outdoor',
    },
    {
      id: '00000000-0000-4000-8000-000000000004',

      slug: 'nachtflohmarkt-markthalle-basel',
      recurrenceText: 'Mehrmals jährlich',
      name: 'Nachtflohmarkt Markthalle',
      kind: 'nachtflohmarkt',
      city: 'Basel',
      citySlug: 'basel',
      region: 'Basel-Stadt',
      regionSlug: 'basel-stadt',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Markthalle Basel',
      addressLine: 'Steinentorberg 20',
      postalCode: '4051',
      lat: 47.5476,
      lng: 7.5834,
      next: { date: saturday, startTime: '18:00', endTime: '23:00', status: 'unverified' },
      upcoming: [],
    },
    {
      id: '00000000-0000-4000-8000-000000000005',

      slug: 'flohmarkt-rathausplatz-wettingen',
      recurrenceText: 'Erster Samstag des Monats, März–November',
      name: 'Flohmarkt Rathausplatz',
      kind: 'flohmarkt',
      city: 'Wettingen',
      citySlug: 'wettingen',
      region: 'Aargau',
      regionSlug: 'aargau',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Rathausplatz',
      addressLine: 'Rathausplatz 1',
      postalCode: '5430',
      lat: 47.4667,
      lng: 8.3167,
      next: {
        date: sunday,
        startTime: '09:00',
        endTime: '16:00',
        status: 'cancelled',
        cancellationNote: 'Wetter',
        confirmedAt: '2026-08-28',
      },
      upcoming: [{ date: later, startTime: '09:00', endTime: '16:00', status: 'tentative' }],
    },
    {
      id: '00000000-0000-4000-8000-000000000006',

      slug: 'hallenflohmarkt-winterthur',
      recurrenceText: 'Zweimal jährlich, im Frühling und Herbst',
      name: 'Hallenflohmarkt Winterthur',
      kind: 'hallenflohmarkt',
      city: 'Winterthur',
      citySlug: 'winterthur',
      region: 'Zürich',
      regionSlug: 'zurich',
      countrySlug: 'schweiz', countryCode: 'CH',
      timezone: 'Europe/Zurich',
      venueName: 'Eulachhallen',
      addressLine: 'Wartstrasse 73',
      postalCode: '8400',
      lat: 47.5056,
      lng: 8.7241,
      // Times genuinely unknown. The card shows the date and says nothing else,
      // rather than inventing "ganztags".
      next: { date: nextSaturday, status: 'unverified' },
      upcoming: [],
    },
  ];
}
