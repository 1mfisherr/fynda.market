/**
 * The season line says only what a market's months say — "Back in April" from
 * a page with no date is a promise a visitor plans around.
 *
 *   npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { seasonLabel, seasonOf } from './season.ts';

const market = (seasonFrom?: number, seasonTo?: number, next?: { date: string }, lastDate?: string) =>
  ({ seasonFrom, seasonTo, lastDate, next: next && { ...next, status: 'confirmed' as const } });

test('outside a season it is back when the season opens', () => {
  assert.deepEqual(seasonOf(market(4, 10), '2026-10-31'), undefined, 'still October: inside');
  assert.deepEqual(seasonOf(market(4, 10), '2026-11-01'), { kind: 'back', month: 4 });
  assert.deepEqual(seasonOf(market(4, 10), '2027-03-15'), { kind: 'back', month: 4 });
});

test('a season whose last month has had its edition is over', () => {
  // Wollishofen: April to October, last held 4 October, read on the 10th.
  assert.deepEqual(seasonOf(market(4, 10, undefined, '2026-10-04'), '2026-10-10'), { kind: 'back', month: 4 });
  // The edition was last month: October may still bring one.
  assert.equal(seasonOf(market(4, 10, undefined, '2026-09-06'), '2026-10-10'), undefined);
});

test('a season over the new year wraps', () => {
  // Uster, October to April.
  assert.deepEqual(seasonOf(market(10, 4), '2027-01-10'), undefined);
  assert.deepEqual(seasonOf(market(10, 4), '2026-07-01'), { kind: 'back', month: 10 });
});

test('an annual market is usually in its month, whatever the date', () => {
  assert.deepEqual(seasonOf(market(9, 9), '2026-09-20'), { kind: 'usually', month: 9 });
  assert.deepEqual(seasonOf(market(9, 9), '2027-02-01'), { kind: 'usually', month: 9 });
});

test('a date, or no season, says nothing', () => {
  assert.equal(seasonOf(market(4, 10, { date: '2027-04-04' }), '2026-12-01'), undefined);
  assert.equal(seasonOf(market(), '2026-12-01'), undefined);
});

test('in words, in each language', () => {
  assert.equal(seasonLabel(market(4, 10), '2026-11-15', 'en'), 'Back in April');
  assert.equal(seasonLabel(market(9, 9), '2026-11-15', 'en'), 'Usually in September');
  assert.equal(seasonLabel(market(4, 10), '2026-11-15', 'it'), 'Torna ad aprile');
  assert.equal(seasonLabel(market(10, 4), '2026-06-15', 'it'), 'Torna a ottobre');
});
