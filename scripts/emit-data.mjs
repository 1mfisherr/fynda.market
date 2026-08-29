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

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { getMarkets, withinHorizon, HORIZON_DAYS } from '../src/lib/markets.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');

const markets = await getMarkets();

// Distinct places, counted the way the ratio check counts pages: a city or
// region earns a page by having content, so only places with a market count.
const cities = new Set(markets.map((m) => m.city));
const entities = {
  markets: markets.length,
  cities: cities.size,
  // Regions are not modelled in the fixtures yet; the import (PLAN.md 3.4)
  // fills this in. Zero is honest, and the ratio check treats it as such.
  regions: 0,
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

console.log(
  `  [data] ${entities.markets} markets, ${entities.cities} cities, ` +
    `${occurrences.length} occurrences within ${HORIZON_DAYS} days`
);
