#!/usr/bin/env node
/**
 * The data build.
 *
 * Writes the two files data/README.md describes, from the same query layer the
 * pages use. Runs as `prebuild`, so `npm run build` and `npm run verify` cannot
 * forget it.
 *
 * Why these files exist at all: the guardrails have to check the URL-to-entity
 * ratio and the occurrence horizon without a database connection, because CI
 * has none. They are build output, never hand-written.
 *
 * Node 24 strips TypeScript types natively, so this imports the .ts query layer
 * directly rather than keeping a second copy of the logic that could drift.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMarkets, withinHorizon, HORIZON_DAYS } from '../src/lib/markets.ts';
import { LOCALES } from '../src/lib/i18n.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const publicDir = join(root, 'public');

const markets = await getMarkets();

// Distinct places, counted the way the ratio check counts pages: a city or
// region earns a page by having content, so only places with a market count.
const cities = new Set(markets.map((m) => m.city));
const regions = new Set(markets.map((m) => m.regionSlug));
const entities = {
  // Which data the build ran on. The redirect check needs it: a fixtures build
  // holds six markets, so it cannot judge whether a retired address still lands
  // on a real page, and must not pretend to.
  source: process.env.FYNDA_DATA_SOURCE ?? 'fixtures',
  markets: markets.length,
  cities: cities.size,
  // How many languages the same set of entities is published in. The ratio
  // check divides by this: four languages of one market is four full pages,
  // not four empty cells.
  locales: LOCALES.length,
  // Counted from the markets, like the cities: a canton earns a page by having
  // one, which is the same rule the canton route applies.
  regions: regions.size,
};

// Every occurrence a page may render. The horizon clamp is applied here as
// well as in the templates, so the file cannot claim a page is clean while the
// template renders something further out.
const occurrences = [];
for (const market of markets) {
  const dates = withinHorizon([market.next, ...market.upcoming].filter(Boolean));
  for (const o of dates) {
    occurrences.push({ marketSlug: market.slug, date: o.date, status: o.status });
  }
}

mkdirSync(dataDir, { recursive: true });
writeFileSync(join(dataDir, 'entities.json'), JSON.stringify(entities, null, 2) + '\n');
writeFileSync(join(dataDir, 'occurrences.json'), JSON.stringify(occurrences, null, 2) + '\n');

/* --------------------------------------------------------------------------
 * Redirects
 *
 * data/redirects.json is committed, like the other two files, because CI has no
 * database and guardrail 9 has to be able to check that every retired address
 * still lands somewhere real. It is rewritten only on a Supabase build — a
 * fixtures build would otherwise erase the record of every URL we have moved.
 * ------------------------------------------------------------------------ */

const redirectsFile = join(dataDir, 'redirects.json');

if ((process.env.FYNDA_DATA_SOURCE ?? 'fixtures') === 'supabase') {
  const { buildRedirects } = await import('./redirects.mjs');
  const redirects = await buildRedirects();
  writeFileSync(redirectsFile, JSON.stringify(redirects, null, 2) + '\n');
}

const redirects = existsSync(redirectsFile) ? JSON.parse(readFileSync(redirectsFile, 'utf8')) : [];

// public/_redirects is build output, not source — Astro copies it into dist/,
// where Cloudflare Pages picks it up. It is gitignored; data/redirects.json is
// the version-controlled half.
const { formatRedirects } = await import('./redirects-format.mjs');
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, '_redirects'), formatRedirects(redirects));

console.log(
  `  [data] ${entities.markets} markets, ${entities.cities} cities, ` +
    `${occurrences.length} occurrences within ${HORIZON_DAYS} days, ` +
    `${redirects.length} redirects`
);
