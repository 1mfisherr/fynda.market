/**
 * How a fleafind (v1) row becomes a fynda.market row. Shared by the first
 * import (scripts/import-v1.mjs, destructive, run once) and the additions
 * import (scripts/import-v1-additions.mjs, additive, run whenever fleafind has
 * new markets). One reading of the source, so the two can never disagree on a
 * canton, a kind or a date.
 *
 * docs/ARCHITECTURE.md §Import says what is decided here and why.
 */

import { withClient, V1_URL } from '../db.mjs';
import { slugify } from '../slugify.mjs';

/** German canton names, for the region slug and name. Only what CH needs. */
export const CANTONS = {
  AG: 'Aargau', AI: 'Appenzell Innerrhoden', AR: 'Appenzell Ausserrhoden',
  BE: 'Bern', BL: 'Basel-Landschaft', BS: 'Basel-Stadt', FR: 'Freiburg',
  GE: 'Genf', GL: 'Glarus', GR: 'Graubünden', JU: 'Jura', LU: 'Luzern',
  NE: 'Neuenburg', NW: 'Nidwalden', OW: 'Obwalden', SG: 'St. Gallen',
  SH: 'Schaffhausen', SO: 'Solothurn', SZ: 'Schwyz', TG: 'Thurgau',
  TI: 'Tessin', UR: 'Uri', VD: 'Waadt', VS: 'Wallis', ZG: 'Zug', ZH: 'Zürich',
};

/**
 * Cities v1 filed under the wrong canton, by postal code. Both are real errors
 * in the source, not disagreements about method, so they are corrected here
 * rather than carried across and cleaned later.
 */
export const CANTON_FIXES = {
  Pratteln: 'BL',   // 4133, Basel-Landschaft; v1 has one row saying BS
  Subingen: 'SO',   // 4553, Solothurn; v1 says BE
};

/** v1 type → the new kind vocabulary. The starting point, before the name pass. */
export const KIND_FROM_TYPE = {
  flea_market: 'flohmarkt',
  brocante: 'brocante',
  antique: 'antikmarkt',
};

/**
 * Name patterns that identify a more specific line. Order matters: a
 * Kinderflohmarkt in a hall is a Kinderflohmarkt, because that is what decides
 * whether someone goes.
 */
export const KIND_FROM_NAME = [
  [/\b(kinder|chind|b[ée]b[ée]|puericultura|enfant)/i, 'kinderflohmarkt'],
  [/\bnacht|\bnight|nocturne|notturn/i, 'nachtflohmarkt'],
  [/\bhallen|halle\b|indoor/i, 'hallenflohmarkt'],
  [/\btr(ö|oe)del/i, 'troedelmarkt'],
  [/\bantik|antiqu/i, 'antikmarkt'],
  [/\bbrocante/i, 'brocante'],
  [/\bstrassen|street/i, 'strassenmarkt'],
];

/** v1 date status → occurrences.status. v1 had no 'unverified'. */
export const STATUS_FROM_V1 = {
  confirmed: 'confirmed',
  cancelled: 'cancelled',
  tentative: 'tentative',
};

export const LOCALES = ['de', 'fr', 'it', 'en'];

/* ---------------------------------------------------------------------------
 * read v1
 * ------------------------------------------------------------------------- */

export async function readV1() {
  return withClient(V1_URL, async (c) => {
    const rows = async (sql) => (await c.query(sql)).rows;
    return {
      markets: await rows(`
        select m.*, v.city as venue_city
          from public.markets m
          join public.venues v on v.id = m.venue_id
         order by m.created_at`),
      venues: await rows(`select * from public.venues order by created_at`),
      dates: await rows(`select * from public.market_dates order by market_id, date`),
      locales: await rows(`select * from public.market_locales`),
      private: await rows(`select * from public.market_private`),
    };
  });
}

/* ---------------------------------------------------------------------------
 * shape the rows
 * ------------------------------------------------------------------------- */

export function normaliseCanton(value) {
  const raw = (value ?? '').trim();
  if (CANTONS[raw.toUpperCase()]) return raw.toUpperCase();
  // 'Aargau' and friends: match the German name back to its code.
  const byName = Object.entries(CANTONS).find(([, name]) => name.toLowerCase() === raw.toLowerCase());
  return byName ? byName[0] : null;
}

export function kindFor(market) {
  for (const [pattern, kind] of KIND_FROM_NAME) {
    if (pattern.test(market.name)) return { kind, inferred: true };
  }
  return { kind: KIND_FROM_TYPE[market.type] ?? 'flohmarkt', inferred: false };
}

/**
 * Everything the write step needs, derived and checked before a single row is
 * written. A dry run stops here, which is what makes it worth having.
 */
export function plan(v1) {
  const warnings = [];

  // --- cities, from venues, with the canton of the markets standing on them ---
  const marketsByVenue = new Map();
  for (const m of v1.markets) {
    if (!marketsByVenue.has(m.venue_id)) marketsByVenue.set(m.venue_id, []);
    marketsByVenue.get(m.venue_id).push(m);
  }

  const cities = new Map();   // city name → { name, canton, venues: [], slug }
  for (const venue of v1.venues) {
    const atVenue = marketsByVenue.get(venue.id) ?? [];
    if (atVenue.length === 0) {
      warnings.push(`venue "${venue.venue_name}" (${venue.city}) has no market and is skipped`);
      continue;
    }

    const name = venue.city.trim();
    // Majority canton across the markets here, then the known corrections.
    const votes = {};
    for (const m of atVenue) {
      const code = normaliseCanton(m.canton);
      if (code) votes[code] = (votes[code] ?? 0) + 1;
    }
    let canton = Object.entries(votes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    if (CANTON_FIXES[name] && CANTON_FIXES[name] !== canton) {
      warnings.push(`canton corrected for ${name}: v1 says ${canton ?? 'nothing'}, importing as ${CANTON_FIXES[name]}`);
      canton = CANTON_FIXES[name];
    }
    if (!canton) {
      warnings.push(`no canton could be resolved for ${name}; venue skipped`);
      continue;
    }

    if (!cities.has(name)) cities.set(name, { name, canton, slug: slugify(name), venues: [] });
    const city = cities.get(name);
    if (city.canton !== canton) {
      warnings.push(`${name} appears in both ${city.canton} and ${canton}; keeping ${city.canton}`);
    }
    city.venues.push(venue);
  }

  // A city slug has to be unique within its locale, and two cantons can hold
  // the same name. Nothing collides today; this fails loudly if that changes.
  const bySlug = new Map();
  for (const city of cities.values()) {
    if (bySlug.has(city.slug)) {
      throw new Error(`city slug collision: "${city.name}" and "${bySlug.get(city.slug).name}" both slugify to ${city.slug}. Disambiguate before importing.`);
    }
    bySlug.set(city.slug, city);
  }

  const regions = [...new Set([...cities.values()].map((c) => c.canton))].sort();

  // --- markets ---
  const privateByMarket = new Map(v1.private.map((p) => [p.market_id, p]));
  const localesByMarket = new Map();
  for (const l of v1.locales) {
    if (!localesByMarket.has(l.market_id)) localesByMarket.set(l.market_id, {});
    localesByMarket.get(l.market_id)[l.locale] = l;
  }
  const datesByMarket = new Map();
  for (const d of v1.dates) {
    if (!datesByMarket.has(d.market_id)) datesByMarket.set(d.market_id, []);
    datesByMarket.get(d.market_id).push(d);
  }

  const venueIds = new Set([...cities.values()].flatMap((c) => c.venues.map((v) => v.id)));
  const organisers = new Map();   // name → { name, channel_type, channel_value }
  const markets = [];

  for (const m of v1.markets) {
    if (!venueIds.has(m.venue_id)) {
      warnings.push(`market "${m.slug}" sits on a skipped venue and is not imported`);
      continue;
    }

    const { kind, inferred } = kindFor(m);
    const priv = privateByMarket.get(m.id);

    if (m.organiser_name) {
      const key = m.organiser_name.trim();
      if (!organisers.has(key)) {
        organisers.set(key, {
          name: key,
          channel_type: priv?.organiser_email ? 'email' : m.website_url ? 'website' : 'unknown',
          channel_value: priv?.organiser_email ?? m.website_url ?? null,
        });
      }
    }

    const dates = (datesByMarket.get(m.id) ?? []).map((d) => ({
      // The column is a `date`; pg hands it back as a Date at UTC midnight, and
      // toISOString would shift it a day west of Zurich. Format it by hand.
      date: [d.date.getFullYear(), d.date.getMonth() + 1, d.date.getDate()]
        .map((n, i) => String(n).padStart(i === 0 ? 4 : 2, '0')).join('-'),
      start_time: d.start_time,
      end_time: d.end_time,
      status: STATUS_FROM_V1[d.status] ?? 'unverified',
      cancellation_note: d.cancellation_note,
      confirmed_at: d.verified_at,
    }));

    markets.push({
      v1_id: m.id,
      slug: m.slug,
      venue_id: m.venue_id,
      organiser_name: m.organiser_name?.trim() ?? null,
      status: m.status === 'active' ? 'active' : m.status === 'permanently_closed' ? 'permanently_closed' : 'unverified',
      kind,
      kind_inferred: inferred,
      recurrence_text: m.recurrence_display,
      entry_fee: m.entry_fee,
      currency: m.entry_fee === null ? null : 'CHF',
      website_url: m.website_url,
      hub_key: m.market_group,
      image_url_v1: m.image_url,
      last_verified_at: m.last_verified_at,
      source_url: priv?.source_url ?? null,
      organiser_email: priv?.organiser_email ?? null,
      admin_notes: priv?.admin_notes ?? null,
      names: Object.fromEntries(
        LOCALES.map((l) => [l, localesByMarket.get(m.id)?.[l]?.display_name ?? null]).filter(([, v]) => v)
      ),
      descriptions: Object.fromEntries(
        [['de', m.description], ['fr', m.description_fr], ['it', m.description_it], ['en', m.description_en]]
          .filter(([, v]) => v)
      ),
      dates,
      raw: m,
    });
  }

  // Hubs: v1's market_group, a text key matched by convention. The first member
  // by creation date becomes the hub the others point at.
  const hubs = new Map();
  for (const m of markets) {
    if (!m.hub_key) continue;
    if (!hubs.has(m.hub_key)) hubs.set(m.hub_key, m.slug);
  }

  return { cities: [...cities.values()], regions, organisers: [...organisers.values()], markets, hubs, warnings };
}
