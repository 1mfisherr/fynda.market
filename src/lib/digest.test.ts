/**
 * The first tests in this repo, and they are here rather than anywhere else on
 * purpose.
 *
 * Ten guardrails already check the site, and that has been enough because a
 * wrong page is visible and can be fixed in the next build. The digest is the
 * first thing here that sends wrong information to real people and cannot be
 * taken back — a mail that says a market is on when it was cancelled is a
 * wasted Saturday for whoever believed it.
 *
 * So: the date window, the canton match, the size of the thing, and the
 * cancellations the copy promises. Not a coverage target.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDigest, isEmpty, type Digest, type DigestRow } from './digest.ts';
import { weekendBounds, iso } from './date-window.ts';
import type { Market, Occurrence } from './types.ts';

/* The window is derived from the real clock, because datedRows clamps to a
   120-day horizon measured from today — dates invented far from now would be
   filtered before the digest ever saw them. */
const now = new Date();
const { start: saturday, end: sunday } = weekendBounds(now);
const monday = (() => {
  const d = new Date(`${sunday}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return iso(d);
})();

/*
 * The lead is lifted out of whichever list it came from, so a test that wants
 * "everything shown for their canton" has to put it back. These two say what
 * the mail renders under each heading.
 */
const inRegion = (d: Digest): DigestRow[] => (d.leadInRegion && d.lead ? [d.lead, ...d.own] : d.own);
const away = (d: Digest): DigestRow[] => (!d.leadInRegion && d.lead ? [d.lead, ...d.elsewhere] : d.elsewhere);
const shown = (d: Digest): DigestRow[] => [...inRegion(d), ...away(d)];

interface Options {
  extra?: Partial<Occurrence>;
  kind?: Market['kind'];
  /** The canton slug. What a canton page subscribes to. */
  region?: string;
  /** Where the venue is, for the radius tests. Defaults to central Zürich. */
  at?: { lat: number; lng: number };
}

function market(name: string, city: string, date: string, options: Options = {}): Market {
  const { extra = {}, kind = 'flohmarkt', region = 'zurich', at = ZURICH } = options;
  const slug = `${name}-${date}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: slug,
    slug,
    name,
    kind,
    city,
    citySlug: city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
    region: region.charAt(0).toUpperCase() + region.slice(1),
    regionSlug: region,
    countrySlug: 'schweiz',
    timezone: 'Europe/Zurich',
    venueName: 'Platz',
    addressLine: 'Platz 1',
    lat: at.lat,
    lng: at.lng,
    imageUrl: `/images/${slug}.webp`,
    next: { date, status: 'confirmed', startTime: '09:00', endTime: '16:00', ...extra },
    upcoming: [],
  };
}

/* Real places, so the distances in the radius tests are real distances. */
const ZURICH = { lat: 47.3769, lng: 8.5417 };
const WINTERTHUR = { lat: 47.5001, lng: 8.7386 };   // ~20 km from Zürich
const BERN = { lat: 46.948, lng: 7.4474 };          // ~95 km from Zürich

/* -------------------------------------------------------------------------- */

test('a canton is matched on its slug, with nothing to fold', () => {
  const markets = [
    market('Bürkliplatz', 'Zürich', saturday),
    market('Winterthur Altstadt', 'Winterthur', sunday),
    market('Plainpalais', 'Genève', saturday, { region: 'geneve' }),
  ];

  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  /* Winterthur is not Zürich the city, but it is Zürich the canton — which is
     the whole reason the subscription is by canton. */
  assert.deepEqual(inRegion(digest).map((r) => r.name), ['Bürkliplatz', 'Winterthur Altstadt']);
  assert.deepEqual(away(digest).map((r) => r.name), ['Plainpalais']);
});

test('a made-up canton is simply not a canton', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday)];
  /* The typed town "Ua" is what this replaces. An unknown slug cannot reach the
     row at all now, and if one ever did it would read as the whole country. */
  const digest = buildDigest(markets, { region: 'ua', locale: 'de', now });
  assert.deepEqual(inRegion(digest), []);
  assert.equal(away(digest).length, 1);
});

test('a market never appears twice', () => {
  const markets = [
    market('Bürkliplatz', 'Zürich', saturday),
    market('Plainpalais', 'Genève', saturday, { region: 'geneve' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const paths = shown(digest).map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
});

test('no canton means the whole country, and nothing is lost', () => {
  const markets = [
    market('Bürkliplatz', 'Zürich', saturday),
    market('Plainpalais', 'Genève', saturday, { region: 'geneve' }),
  ];
  const digest = buildDigest(markets, { region: null, locale: 'de', now });
  assert.deepEqual(digest.own, []);
  assert.equal(digest.leadInRegion, false);
  assert.equal(away(digest).length, 2);
  assert.equal(digest.total, 2);
});

test('a canton with nothing on still gets an issue', () => {
  const markets = [market('Plainpalais', 'Genève', saturday, { region: 'geneve' })];
  const digest = buildDigest(markets, { region: 'aargau', locale: 'de', now });
  assert.deepEqual(inRegion(digest), []);
  assert.equal(away(digest).length, 1);
  assert.equal(isEmpty(digest), false);
});

test('cancellations are carried, because the copy promises them', () => {
  const markets = [
    market('Abgesagt', 'Zürich', saturday, {
      extra: { status: 'cancelled', cancellationNote: 'Wegen Regen' },
    }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const [row] = inRegion(digest);
  assert.equal(row.cancelled, true);
  assert.equal(row.cancellationNote, 'Wegen Regen');
});

test('the window is the weekend and nothing either side of it', () => {
  const markets = [
    market('Samstag', 'Zürich', saturday),
    market('Sonntag', 'Zürich', sunday),
    market('Montag', 'Zürich', monday),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.deepEqual(inRegion(digest).map((r) => r.name).sort(), ['Samstag', 'Sonntag']);
});

test('the mail is capped, and the cap covers the whole of it', () => {
  const markets = [
    ...Array.from({ length: 12 }, (_, i) => market(`Zueri${i}`, `Ort${i}`, saturday)),
    ...['Basel', 'Bern', 'Chur', 'Sion'].map((town) =>
      market(`Weit-${town}`, town, saturday, { region: town.toLowerCase() })
    ),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });

  assert.equal(shown(digest).length, 8);
  // Their own canton has first claim on the budget.
  assert.equal(inRegion(digest).length, 8);
  assert.equal(away(digest).length, 0);
  assert.equal(digest.total, 16);
});

test('a quiet canton leaves the rest of the budget to everywhere else', () => {
  const markets = [
    market('Einer', 'Aarau', saturday, { region: 'aargau' }),
    ...['Basel', 'Bern', 'Chur', 'Sion', 'Thun', 'Zug', 'Lugano', 'Genf'].map((town) =>
      market(`Weit-${town}`, town, saturday, { region: town.toLowerCase() })
    ),
  ];
  const digest = buildDigest(markets, { region: 'aargau', locale: 'de', now });
  assert.equal(inRegion(digest).length, 1);
  assert.equal(away(digest).length, 7);
  assert.equal(shown(digest).length, 8);
});

test('"see all" points at their canton when their canton is what got cut', () => {
  const markets = Array.from({ length: 12 }, (_, i) => market(`Zueri${i}`, `Ort${i}`, saturday));
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.equal(digest.more.count, 12);
  // The phrase a reader sees, prepositions and all.
  assert.equal(digest.more.scope, 'im Kanton Zurich');
  assert.ok(digest.more.href.includes('zurich'), digest.more.href);
});

test('"see all" points at the weekend when nothing of theirs was cut', () => {
  const markets = [
    market('Einer', 'Zürich', saturday),
    market('Weit', 'Basel', saturday, { region: 'basel' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.equal(digest.more.scope, undefined);
  assert.equal(digest.more.count, 2);
  assert.equal(digest.more.href, '/de/');
});

test('the lead comes from their own canton when they have one', () => {
  const markets = [
    market('Zueri', 'Zürich', saturday),
    market('Weit', 'Basel', saturday, { region: 'basel' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.equal(digest.leadInRegion, true);
  assert.equal(digest.lead?.name, 'Zueri');
  // The wide photograph, which only the lead is shown at.
  assert.ok(digest.lead?.hero?.endsWith('.webp'));
  assert.ok(!digest.lead?.hero?.includes('-thumb'));
});

test('with nothing in their canton the lead comes from elsewhere', () => {
  const markets = [market('Weit', 'Basel', saturday, { region: 'basel' })];
  const digest = buildDigest(markets, { region: 'aargau', locale: 'de', now });
  assert.equal(digest.leadInRegion, false);
  assert.equal(digest.lead?.name, 'Weit');
});

test('elsewhere shows at most one market per town per day', () => {
  const markets = [
    market('Eins', 'Basel', saturday, { region: 'basel' }),
    market('Zwei', 'Basel', saturday, { region: 'basel' }),
    market('Drei', 'Basel', sunday, { region: 'basel' }),
    market('Vier', 'Bern', saturday, { region: 'bern' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const seen = away(digest).map((r) => `${r.town}|${r.date}`);
  assert.equal(new Set(seen).size, seen.length);
  // Basel twice is fine — a Saturday market and a Sunday one are different days out.
  assert.equal(away(digest).filter((r) => r.town === 'Basel').length, 2);
  assert.equal(digest.total, 4);
});

test('both days of the weekend get a share of the budget', () => {
  /* Six Saturday markets in towns that all out-rank the Sunday one. Ranked over
     the whole weekend at once, a budget of two returns two Saturdays and the
     Sunday market is never seen. */
  const markets = [
    ...['Basel', 'Bern', 'Luzern', 'Chur', 'Sion', 'Thun'].map((town, i) =>
      market(`Sam${i}`, town, saturday, { region: town.toLowerCase() })
    ),
    market('Sonntagsmarkt', 'Aarau', sunday, { region: 'aargau' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now, limit: 2 });
  assert.equal(away(digest).length, 2);
  assert.deepEqual(
    [...new Set(away(digest).map((r) => r.date))].sort(),
    [saturday, sunday].sort()
  );
});

test('an empty weekend is an empty issue, and is not sent', () => {
  const digest = buildDigest([], { region: 'zurich', locale: 'de', now });
  assert.equal(isEmpty(digest), true);
});

test('rows are in date order, earliest first', () => {
  const markets = [market('Sonntag', 'Zürich', sunday), market('Samstag', 'Zürich', saturday)];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.deepEqual(inRegion(digest).map((r) => r.date), [saturday, sunday].sort());
});

test('the path is in the subscriber own language', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday)];
  const de = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const fr = buildDigest(markets, { region: 'zurich', locale: 'fr', now });
  assert.ok(inRegion(de)[0].path.startsWith('/de/'));
  assert.ok(inRegion(fr)[0].path.startsWith('/fr/'));
  assert.notEqual(inRegion(de)[0].path, inRegion(fr)[0].path);
});

test('only the exceptional market kinds get a badge', () => {
  const markets = [
    market('Gewoehnlich', 'Zürich', saturday),
    market('In der Halle', 'Zürich', saturday, { kind: 'hallenflohmarkt' }),
    market('Fuer Kinder', 'Zürich', saturday, { kind: 'kinderflohmarkt' }),
    market('Antik', 'Zürich', saturday, { kind: 'antikmarkt' }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const badges = Object.fromEntries(inRegion(digest).map((r) => [r.name, r.badge?.label]));

  // Say the exception, never the rule: an ordinary flea market is the rule, and
  // so is an antiques market, which is not in BADGED_KINDS.
  assert.equal(badges['Gewoehnlich'], undefined);
  assert.equal(badges['Antik'], undefined);
  assert.equal(badges['In der Halle'], 'Halle');
  assert.equal(badges['Fuer Kinder'], 'Kinder');

  // And the colour is the site's own line colour for that kind.
  const halle = inRegion(digest).find((r) => r.name === 'In der Halle');
  assert.equal(halle?.badge?.colour, '#3D5AFE');
});

test('a cancelled market loses its type colour', () => {
  const markets = [
    market('Abgesagt', 'Zürich', saturday, {
      extra: { status: 'cancelled' },
      kind: 'nachtflohmarkt',
    }),
  ];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  const [row] = inRegion(digest);
  assert.equal(row.cancelled, true);
  // The strikethrough and the word say it. A badge as well would be noise.
  assert.equal(row.badge, undefined);
});

test('a row carries the square photograph, never the hero', () => {
  const markets = [market('Erster', 'Zürich', saturday), market('Zweiter', 'Zürich', saturday)];
  const digest = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  // The second one is a row rather than the lead: 148px square, not the 1440px
  // hero. A dozen heroes is two megabytes for squares the size of a stamp.
  const row = digest.own[0];
  assert.ok(row.image?.endsWith('-thumb.webp'), String(row.image));
});

test('a market with no photograph simply has none', () => {
  const plain = market('Ohne Bild', 'Zürich', saturday);
  delete (plain as { imageUrl?: string }).imageUrl;
  const digest = buildDigest([plain], { region: 'zurich', locale: 'de', now });
  const [row] = inRegion(digest);
  assert.equal(row.image, undefined);
  assert.equal(row.hero, undefined);
});

/* -------------------------------------------------------------------------- */
/* Radius                                                                     */
/* -------------------------------------------------------------------------- */

test('a radius takes what is inside it and nothing beyond', () => {
  const markets = [
    market('Bürkliplatz', 'Zürich', saturday, { at: ZURICH }),
    market('Altstadt', 'Winterthur', saturday, { at: WINTERTHUR }),
    market('Bundesplatz', 'Bern', saturday, { at: BERN, region: 'bern' }),
  ];

  /* Ten kilometres reaches nothing but the city itself. */
  const near = buildDigest(markets, {
    near: { lat: ZURICH.lat, lng: ZURICH.lng, km: 10, city: 'Zürich' }, locale: 'de', now,
  });
  assert.deepEqual(inRegion(near).map((r) => r.name), ['Bürkliplatz']);

  /* Thirty reaches Winterthur, which is the whole point — a canton
     subscription would have caught it too, but a Zug one would not have
     caught Zürich. */
  const wider = buildDigest(markets, {
    near: { lat: ZURICH.lat, lng: ZURICH.lng, km: 30, city: 'Zürich' }, locale: 'de', now,
  });
  assert.deepEqual(inRegion(wider).map((r) => r.name).sort(), ['Altstadt', 'Bürkliplatz']);

  /* Bern is ninety-five kilometres away and stays outside all of them. */
  assert.ok(!inRegion(wider).some((r) => r.name === 'Bundesplatz'));
});

test('a radius crosses a canton border, which is the reason it exists', () => {
  const markets = [
    market('Zueri', 'Zürich', saturday, { at: ZURICH }),
    /* Physically 20 km away but in a different canton. A canton subscription
       misses it; a radius does not. */
    market('Nachbar', 'Baden', saturday, { at: WINTERTHUR, region: 'aargau' }),
  ];

  const byCanton = buildDigest(markets, { region: 'zurich', locale: 'de', now });
  assert.deepEqual(inRegion(byCanton).map((r) => r.name), ['Zueri']);

  const byRadius = buildDigest(markets, {
    near: { lat: ZURICH.lat, lng: ZURICH.lng, km: 30, city: 'Zürich' }, locale: 'de', now,
  });
  assert.deepEqual(byRadius.own.length + 1, 2);
});

test('the scope phrase says which shape it is, in the right language', () => {
  const markets = [market('Zueri', 'Zürich', saturday, { at: ZURICH })];
  const near = { lat: ZURICH.lat, lng: ZURICH.lng, km: 25, city: 'Zürich' };

  assert.equal(buildDigest(markets, { near, locale: 'de', now }).scope, 'im Umkreis von 25 km um Zürich');
  assert.equal(buildDigest(markets, { near, locale: 'en', now }).scope, 'within 25 km of Zürich');
  assert.equal(buildDigest(markets, { near, locale: 'fr', now }).scope, 'dans un rayon de 25 km autour de Zürich');
  assert.equal(buildDigest(markets, { near, locale: 'it', now }).scope, 'entro 25 km da Zürich');

  // And the canton shape still reads as a canton.
  assert.equal(buildDigest(markets, { region: 'zurich', locale: 'de', now }).scope, 'im Kanton Zurich');
});

test('"see all" for a radius opens the nearby view centred on them', () => {
  const markets = Array.from({ length: 12 }, (_, i) =>
    market(`Nah${i}`, `Ort${i}`, saturday, { at: ZURICH })
  );
  const digest = buildDigest(markets, {
    near: { lat: ZURICH.lat, lng: ZURICH.lng, km: 25, city: 'Zürich' }, locale: 'de', now,
  });
  assert.equal(digest.more.count, 12);
  assert.ok(digest.more.href.startsWith('/de/umkreis/'), digest.more.href);
  assert.ok(digest.more.href.includes('km=25'), digest.more.href);
});
