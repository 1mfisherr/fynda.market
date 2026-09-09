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
 * So: the date window, the town match, the size of the thing, and the
 * cancellations the copy promises. Not a coverage target.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDigest, isEmpty, normaliseTown, type Digest, type DigestRow } from './digest.ts';
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
 * "everything shown for their town" has to put it back. These two say what the
 * mail renders under each heading.
 */
const inTown = (d: Digest): DigestRow[] => (d.leadInTown && d.lead ? [d.lead, ...d.own] : d.own);
const away = (d: Digest): DigestRow[] => (!d.leadInTown && d.lead ? [d.lead, ...d.elsewhere] : d.elsewhere);
const shown = (d: Digest): DigestRow[] => [...inTown(d), ...away(d)];

function market(
  name: string,
  city: string,
  date: string,
  extra: Partial<Occurrence> = {},
  kind: Market['kind'] = 'flohmarkt'
): Market {
  const slug = `${name}-${date}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return {
    id: slug,
    slug,
    name,
    kind,
    city,
    citySlug: city.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''),
    region: 'Zürich',
    regionSlug: 'zurich',
    countrySlug: 'schweiz',
    timezone: 'Europe/Zurich',
    venueName: 'Platz',
    addressLine: 'Platz 1',
    lat: 47.37,
    lng: 8.54,
    imageUrl: `/images/${slug}.webp`,
    next: { date, status: 'confirmed', startTime: '09:00', endTime: '16:00', ...extra },
    upcoming: [],
  };
}

/* -------------------------------------------------------------------------- */

test('normaliseTown folds case, accents and punctuation', () => {
  assert.equal(normaliseTown('Zürich'), 'zurich');
  assert.equal(normaliseTown('  ZURICH '), 'zurich');
  assert.equal(normaliseTown('Zurich'), 'zurich');
  assert.equal(normaliseTown('Genève'), 'geneve');
  assert.equal(normaliseTown('La Chaux-de-Fonds'), 'lachauxdefonds');
  // Different places must not collide just because they fold.
  assert.notEqual(normaliseTown('Baden'), normaliseTown('Basel'));
});

test('their town comes back separately, however they spelled it', () => {
  const markets = [
    market('Bürkliplatz', 'Zürich', saturday),
    market('Kanzlei', 'Zürich', sunday),
    market('Plainpalais', 'Genève', saturday),
  ];

  for (const spelling of ['Zürich', 'zurich', ' ZÜRICH ']) {
    const digest = buildDigest(markets, { town: spelling, locale: 'de', now });
    assert.deepEqual(inTown(digest).map((r) => r.name), ['Bürkliplatz', 'Kanzlei'], spelling);
    assert.deepEqual(away(digest).map((r) => r.name), ['Plainpalais'], spelling);
  }
});

test('a market never appears twice', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday), market('Plainpalais', 'Genève', saturday)];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const paths = shown(digest).map((r) => r.path);
  assert.equal(new Set(paths).size, paths.length);
});

test('no town means the whole country, and nothing is lost', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday), market('Plainpalais', 'Genève', saturday)];
  const digest = buildDigest(markets, { town: null, locale: 'de', now });
  assert.deepEqual(digest.own, []);
  assert.equal(digest.leadInTown, false);
  assert.equal(away(digest).length, 2);
  assert.equal(digest.total, 2);
});

test('a town we hold nothing for still gets an issue', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday)];
  const digest = buildDigest(markets, { town: 'Winterthur', locale: 'de', now });
  assert.deepEqual(inTown(digest), []);
  assert.equal(away(digest).length, 1);
  assert.equal(digest.town, 'Winterthur');
  assert.equal(isEmpty(digest), false);
});

test('cancellations are carried, because the copy promises them', () => {
  const markets = [
    market('Abgesagt', 'Zürich', saturday, { status: 'cancelled', cancellationNote: 'Wegen Regen' }),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const [row] = inTown(digest);
  assert.equal(row.cancelled, true);
  assert.equal(row.cancellationNote, 'Wegen Regen');
});

test('the window is the weekend and nothing either side of it', () => {
  const markets = [
    market('Samstag', 'Zürich', saturday),
    market('Sonntag', 'Zürich', sunday),
    market('Montag', 'Zürich', monday),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  assert.deepEqual(inTown(digest).map((r) => r.name).sort(), ['Samstag', 'Sonntag']);
});

test('the mail is capped, and the cap covers the whole of it', () => {
  /* Twelve in their town and four elsewhere. A mail that showed everything
     would scroll for a minute; what is cut is what the "see all" link is for. */
  const markets = [
    ...Array.from({ length: 12 }, (_, i) => market(`Zueri${i}`, 'Zürich', saturday)),
    ...['Basel', 'Bern', 'Chur', 'Sion'].map((town) => market(`Weit-${town}`, town, saturday)),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });

  assert.equal(shown(digest).length, 8);
  // Their own town has first claim on the budget.
  assert.equal(inTown(digest).length, 8);
  assert.equal(away(digest).length, 0);
  // And the count is still the truth about the weekend.
  assert.equal(digest.total, 16);
});

test('a quiet town leaves the rest of the budget to everywhere else', () => {
  const markets = [
    market('Einer', 'Winterthur', saturday),
    ...['Basel', 'Bern', 'Chur', 'Sion', 'Thun', 'Aarau', 'Baden', 'Zug', 'Lugano'].map((town) =>
      market(`Weit-${town}`, town, saturday)
    ),
  ];
  const digest = buildDigest(markets, { town: 'Winterthur', locale: 'de', now });
  assert.equal(inTown(digest).length, 1);
  assert.equal(away(digest).length, 7);
  assert.equal(shown(digest).length, 8);
});

test('"see all" points at their town when their town is what got cut', () => {
  const markets = Array.from({ length: 12 }, (_, i) => market(`Zueri${i}`, 'Zürich', saturday));
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  assert.equal(digest.more.count, 12);
  assert.equal(digest.more.town, 'Zürich');
  assert.ok(digest.more.href.includes('zurich'), digest.more.href);
});

test('"see all" points at the weekend when nothing of theirs was cut', () => {
  const markets = [market('Einer', 'Zürich', saturday), market('Weit', 'Basel', saturday)];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  assert.equal(digest.more.town, undefined);
  assert.equal(digest.more.count, 2);
  assert.equal(digest.more.href, '/de/');
});

test('the lead comes from their own town when they have one', () => {
  const markets = [market('Zueri', 'Zürich', saturday), market('Weit', 'Basel', saturday)];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  assert.equal(digest.leadInTown, true);
  assert.equal(digest.lead?.name, 'Zueri');
  // The wide photograph, which only the lead is shown at.
  assert.ok(digest.lead?.hero?.endsWith('.webp'));
  assert.ok(!digest.lead?.hero?.includes('-thumb'));
});

test('with nothing in their town the lead comes from elsewhere', () => {
  const markets = [market('Weit', 'Basel', saturday)];
  const digest = buildDigest(markets, { town: 'Winterthur', locale: 'de', now });
  assert.equal(digest.leadInTown, false);
  assert.equal(digest.lead?.name, 'Weit');
});

test('elsewhere shows at most one market per town per day', () => {
  const markets = [
    market('Eins', 'Basel', saturday),
    market('Zwei', 'Basel', saturday),
    market('Drei', 'Basel', sunday),
    market('Vier', 'Bern', saturday),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const seen = away(digest).map((r) => `${r.town}|${r.date}`);
  assert.equal(new Set(seen).size, seen.length);
  // Basel twice is fine — a Saturday market and a Sunday one are different days out.
  assert.equal(away(digest).filter((r) => r.town === 'Basel').length, 2);
  assert.equal(digest.total, 4);
});

test('both days of the weekend get a share of the budget', () => {
  /* Six Saturday markets in towns that all out-rank the Sunday one. Ranked
     over the whole weekend at once, a budget of two returns two Saturdays and
     the Sunday market is never seen. */
  const markets = [
    ...['Basel', 'Bern', 'Luzern', 'Chur', 'Sion', 'Thun'].map((town, i) =>
      market(`Sam${i}`, town, saturday)
    ),
    market('Sonntagsmarkt', 'Aarau', sunday),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now, limit: 2 });
  assert.equal(away(digest).length, 2);
  assert.deepEqual(
    [...new Set(away(digest).map((r) => r.date))].sort(),
    [saturday, sunday].sort()
  );
});

test('an empty weekend is an empty issue, and is not sent', () => {
  const digest = buildDigest([], { town: 'Zürich', locale: 'de', now });
  assert.equal(isEmpty(digest), true);
});

test('rows are in date order, earliest first', () => {
  const markets = [market('Sonntag', 'Zürich', sunday), market('Samstag', 'Zürich', saturday)];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  assert.deepEqual(inTown(digest).map((r) => r.date), [saturday, sunday].sort());
});

test('the path is in the subscriber own language', () => {
  const markets = [market('Bürkliplatz', 'Zürich', saturday)];
  const de = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const fr = buildDigest(markets, { town: 'Zürich', locale: 'fr', now });
  assert.ok(inTown(de)[0].path.startsWith('/de/'));
  assert.ok(inTown(fr)[0].path.startsWith('/fr/'));
  assert.notEqual(inTown(de)[0].path, inTown(fr)[0].path);
});

test('only the exceptional market kinds get a badge', () => {
  const markets = [
    market('Gewoehnlich', 'Zürich', saturday),
    market('In der Halle', 'Zürich', saturday, {}, 'hallenflohmarkt'),
    market('Fuer Kinder', 'Zürich', saturday, {}, 'kinderflohmarkt'),
    market('Antik', 'Zürich', saturday, {}, 'antikmarkt'),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const badges = Object.fromEntries(inTown(digest).map((r) => [r.name, r.badge?.label]));

  // Say the exception, never the rule: an ordinary flea market is the rule,
  // and so is an antiques market, which is not in BADGED_KINDS.
  assert.equal(badges['Gewoehnlich'], undefined);
  assert.equal(badges['Antik'], undefined);
  assert.equal(badges['In der Halle'], 'Halle');
  assert.equal(badges['Fuer Kinder'], 'Kinder');

  // And the colour is the site's own line colour for that kind.
  const halle = inTown(digest).find((r) => r.name === 'In der Halle');
  assert.equal(halle?.badge?.colour, '#3D5AFE');
});

test('a cancelled market loses its type colour', () => {
  const markets = [
    market('Abgesagt', 'Zürich', saturday, { status: 'cancelled' }, 'nachtflohmarkt'),
  ];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  const [row] = inTown(digest);
  assert.equal(row.cancelled, true);
  // The strikethrough and the word say it. A badge as well would be noise.
  assert.equal(row.badge, undefined);
});

test('a row carries the square photograph, never the hero', () => {
  const markets = [market('Erster', 'Zürich', saturday), market('Zweiter', 'Zürich', saturday)];
  const digest = buildDigest(markets, { town: 'Zürich', locale: 'de', now });
  // The second one is a row rather than the lead: 148px square, not the
  // 1440px hero. A dozen heroes is two megabytes for squares the size of a stamp.
  const row = digest.own[0];
  assert.ok(row.image?.endsWith('-thumb.webp'), String(row.image));
});

test('a market with no photograph simply has none', () => {
  const plain = market('Ohne Bild', 'Zürich', saturday);
  delete (plain as { imageUrl?: string }).imageUrl;
  const digest = buildDigest([plain], { town: 'Zürich', locale: 'de', now });
  const [row] = inTown(digest);
  assert.equal(row.image, undefined);
  assert.equal(row.hero, undefined);
});
