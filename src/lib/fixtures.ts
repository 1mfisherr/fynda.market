/**
 * SAMPLE DATA — not real listings, not for publication.
 *
 * The Supabase project does not exist yet (PLAN.md step 1.4) and the v1 import
 * is step 3.4. These rows exist so the templates can be built and reviewed
 * against realistic shapes: a confirmed market, an unverified one, a cancelled
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
      slug: 'flohmarkt-kanzlei-zuerich',
      name: 'Flohmarkt Kanzlei',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zuerich',
      region: 'Zürich',
      regionSlug: 'zuerich',
      countrySlug: 'schweiz',
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
      covered: 'open',
      groundSurface: 'Asphalt',
    },
    {
      slug: 'flohmarkt-buerkliplatz-zuerich',
      name: 'Flohmarkt Bürkliplatz',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zuerich',
      region: 'Zürich',
      regionSlug: 'zuerich',
      countrySlug: 'schweiz',
      timezone: 'Europe/Zurich',
      venueName: 'Bürkliplatz',
      addressLine: 'Bürkliplatz 1',
      postalCode: '8001',
      lat: 47.3667,
      lng: 8.5417,
      next: { date: saturday, startTime: '06:00', endTime: '17:00', status: 'confirmed', confirmedAt: '2026-08-24' },
      upcoming: [{ date: nextSaturday, startTime: '06:00', endTime: '17:00', status: 'confirmed' }],
      stallCount: 250,
      stallCountBadWeather: 180,
      sellerMix: 'private',
      priceLevel: 'flohmarkt',
      packUpFrom: '15:00',
      entryFee: 0,
      covered: 'open',
      groundSurface: 'Pflaster',
      timing: [
        { from: '06:00', label: 'Aufbau, erste Stände', note: 'Händler und Sammler sind schon da' },
        { from: '07–09', label: 'Die Raritäten', note: 'Wer etwas Bestimmtes sucht, kommt jetzt' },
        { from: '10–12', label: 'Am vollsten', note: 'Mit Kinderwagen mühsam' },
        { from: 'ab 14', label: 'Schnäppchenzeit', note: 'Viele wollen nichts heimtragen' },
        { from: '15:00', label: 'Abbau beginnt', note: 'Offiziell bis 17:00, faktisch früher' },
      ],
      gettingThere: 'Nicht mit dem Auto. Keine Besucherparkplätze am Platz. Tram 2, 8, 9 und 11 halten direkt davor.',
      facilities: { wc: true, dogs: false, strollers: 'breite Gänge', cash: 'mitnehmen' },
    },
    {
      slug: 'flohmarkt-am-see-wollishofen',
      name: 'Flohmarkt am See, Wollishofen',
      kind: 'flohmarkt',
      city: 'Zürich',
      citySlug: 'zuerich',
      region: 'Zürich',
      regionSlug: 'zuerich',
      countrySlug: 'schweiz',
      timezone: 'Europe/Zurich',
      venueName: 'Seeufer Wollishofen',
      addressLine: 'Mythenquai 95',
      postalCode: '8038',
      lat: 47.3453,
      lng: 8.5361,
      next: { date: sunday, startTime: '09:00', endTime: '17:00', status: 'confirmed', confirmedAt: '2026-08-25' },
      upcoming: [],
      sellerMix: 'mixed',
      covered: 'partly',
    },
    {
      slug: 'nachtflohmarkt-markthalle-basel',
      name: 'Nachtflohmarkt Markthalle',
      kind: 'nachtflohmarkt',
      city: 'Basel',
      citySlug: 'basel',
      region: 'Basel-Stadt',
      regionSlug: 'basel-stadt',
      countrySlug: 'schweiz',
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
      slug: 'flohmarkt-rathausplatz-wettingen',
      name: 'Flohmarkt Rathausplatz',
      kind: 'flohmarkt',
      city: 'Wettingen',
      citySlug: 'wettingen',
      region: 'Aargau',
      regionSlug: 'aargau',
      countrySlug: 'schweiz',
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
      slug: 'hallenflohmarkt-winterthur',
      name: 'Hallenflohmarkt Winterthur',
      kind: 'hallenflohmarkt',
      city: 'Winterthur',
      citySlug: 'winterthur',
      region: 'Zürich',
      regionSlug: 'zuerich',
      countrySlug: 'schweiz',
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
