/**
 * The town facts line counts only what the markets hold — a number on a town
 * page is a claim a visitor checks by scrolling.
 *
 *   npm test
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { runsWeekly, townFacts } from './town-facts.ts';
import type { Market } from './types.ts';

const TODAY = '2026-10-12'; // a Monday
const on = (...dates: string[]) => {
  const [next, ...upcoming] = dates.map((date) => ({ date, status: 'confirmed' as const }));
  return { next, upcoming };
};
const market = (extra: Partial<Market> = {}) => ({ kind: 'flohmarkt', upcoming: [], ...extra }) as Market;

test('weekly is a date in each of the next three weeks', () => {
  assert.equal(runsWeekly(market(on('2026-10-17', '2026-10-24', '2026-10-31')), TODAY), true, 'a season that ends this month');
  assert.equal(runsWeekly(market(on('2026-10-17', '2026-10-31', '2026-11-14')), TODAY), false, 'fortnightly');
  assert.equal(runsWeekly(market(on('2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18')), TODAY), false, 'a four-day fair is one week');
});

test('a cancelled date does not make a week', () => {
  const m = market(on('2026-10-17', '2026-10-24', '2026-10-31'));
  m.upcoming[0] = { ...m.upcoming[0], status: 'cancelled' };
  assert.equal(runsWeekly(m, TODAY), false);
});

test('below four markets there is no line', () => {
  assert.deepEqual(townFacts([market({ setting: 'indoor' }), market(), market()], TODAY), []);
});

test('facts held by nobody are left out, the rest in order, three at most', () => {
  const town = [
    market({ setting: 'indoor', tags: ['records_books'] }),
    market({ kind: 'kinderflohmarkt' }),
    market({ kind: 'nachtflohmarkt', setting: 'indoor' }),
    market({ tags: ['antiques'] }),
  ];
  assert.deepEqual(townFacts(town, TODAY), [
    { fact: 'kids', n: 1 },
    { fact: 'indoor', n: 2 },
    { fact: 'night', n: 1 },
  ]);
});
