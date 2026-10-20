/**
 * A town of one market has no page of its own: every link to it opens the
 * market (2026-10-20). The rule lives in one function, so one test holds it.
 *
 *   npm test
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { hasRegionPage, hasTownPage, regionHref, townHref } from './towns.ts';
import type { Market } from './types.ts';

const market = (slug: string): Market => ({ slug, citySlug: 'liesberg', countrySlug: 'schweiz' } as unknown as Market);

test('a town of one market links to the market page', () => {
  assert.equal(townHref('de', [market('liesberger-flohmarkt')]), '/de/markt/liesberger-flohmarkt/');
  assert.equal(townHref('en', [market('liesberger-flohmarkt')]), '/en/market/liesberger-flohmarkt/');
  assert.equal(hasTownPage([market('liesberger-flohmarkt')]), false);
});

test('a canton of one market links to the market page, of two to its own', () => {
  const inUri = (slug: string) => ({ slug, regionSlug: 'uri', countryCode: 'CH', countrySlug: 'schweiz' } as unknown as Market);
  assert.equal(regionHref('en', [inUri('flohmarkt-altdorf')]), '/en/market/flohmarkt-altdorf/');
  assert.equal(hasRegionPage([inUri('flohmarkt-altdorf')]), false);
  assert.equal(regionHref('de', [inUri('a'), inUri('b')]), '/de/schweiz/kanton/uri/');
});

test('a town of two markets keeps its page', () => {
  assert.equal(townHref('de', [market('a'), market('b')]), '/de/schweiz/liesberg/');
  assert.equal(hasTownPage([market('a'), market('b')]), true);
});
