/**
 * The "Nearby towns" links on a town with no date of its own: nearest first,
 * one per town with its market count, never the town itself, never past 25 km.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { nearbyTowns } from './lists.ts';
import type { Market } from './types.ts';

const market = (id: string, citySlug: string, city: string, lat: number, lng: number) =>
  ({ id, slug: id, citySlug, city, lat, lng, upcoming: [] }) as unknown as Market;

// Allschwil, two Basel markets (~2.6 and ~3.4 km), Reinach (~6.6 km), Zürich (~75 km).
const allschwil = market('a', 'allschwil', 'Allschwil', 47.5532, 7.5434);
const all = [
  allschwil,
  market('b1', 'basel', 'Basel', 47.5636, 7.5752),
  market('b2', 'basel', 'Basel', 47.5590, 7.5880),
  market('r', 'reinach', 'Reinach', 47.4960, 7.5870),
  market('z', 'zurich', 'Zürich', 47.3769, 8.5417),
];

test('nearby towns: nearest first, counted, the town itself and far towns left out', () => {
  const towns = nearbyTowns([allschwil], all);
  assert.deepEqual(towns.map((t) => [t.slug, t.count]), [['basel', 2], ['reinach', 1]]);
  assert.ok(towns[0].km < towns[1].km);
  assert.ok(towns[0].km > 2 && towns[0].km < 3, `Basel at ${towns[0].km} km`);
});

test('nearby towns: at most the number asked for', () => {
  assert.equal(nearbyTowns([allschwil], all, 1).length, 1);
});
