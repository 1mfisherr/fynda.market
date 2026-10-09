import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpret, normaliseForQuote } from './ask.mjs';

const today = '2026-10-09';
const question = (id, kind, extra = {}) => [id, {
  id, kind, dates: [], ours: new Set(['2026-10-24']), snippet: 'Termine 2026\nSa 24.10.2026\nSa 21.11.2026, 8–16 Uhr',
  snippetDates: new Set(['2026-10-24', '2026-11-21']), market: { name: 'Flohmarkt', town: 'Berlin' }, ...extra,
}];

test('quotes are compared tolerantly but exactly', () => {
  assert.equal(normaliseForQuote('Sa 21.11.2026 – 8 Uhr'), normaliseForQuote('sa  21.11.2026 - 8 uhr'));
});

test('a new date with a real quote that states it is verified', () => {
  const qs = new Map([question('Q1', 'new_date')]);
  const [f] = interpret({ items: [{ id: 'Q1', verdict: 'changed', dates: [{ iso: '2026-11-21', quote: 'Sa 21.11.2026, 8–16 Uhr' }], start: '08:00', end: '16:00', summary: 's' }] }, qs, today);
  assert.equal(f.kind, 'new_date');
  assert.deepEqual(f.dates, ['2026-11-21']);
  assert.equal(f.verified, true);
  assert.equal(f.start, '08:00');
});

test('a real quote with an invented year is not verified', () => {
  const qs = new Map([question('Q1', 'new_date', { snippet: 'Sa 21.11.', snippetDates: new Set(['2026-11-21']) })]);
  const [f] = interpret({ items: [{ id: 'Q1', verdict: 'changed', dates: [{ iso: '2027-11-21', quote: 'Sa 21.11.' }], summary: 's' }] }, qs, today);
  assert.equal(f.verified, false);
});

test('a quote that is not on the page is not verified', () => {
  const qs = new Map([question('Q1', 'new_date')]);
  const [f] = interpret({ items: [{ id: 'Q1', verdict: 'changed', dates: [{ iso: '2026-11-21', quote: 'Samstag 21. November 2026' }], summary: 's' }] }, qs, today);
  assert.equal(f.verified, false);
});

test('a possible cancellation always reaches a person', () => {
  const qs = new Map([question('Q2', 'cancelled', { dates: ['2026-10-24'] })]);
  const [f] = interpret({ items: [{ id: 'Q2', verdict: 'unclear', dates: [], summary: 's' }] }, qs, today);
  assert.equal(f.kind, 'cancelled');
  assert.equal(f.verified, false);
});

test('confirmations, unknown ids and dates we already have make no finding', () => {
  const qs = new Map([question('Q3', 'missing', { dates: ['2026-10-31'] }), question('Q1', 'new_date')]);
  const out = interpret({ items: [
    { id: 'Q3', verdict: 'confirmed', dates: [], summary: 's' },
    { id: 'Q9', verdict: 'changed', dates: [{ iso: '2026-11-21', quote: 'Sa 21.11.2026' }], summary: 's' },
    { id: 'Q1', verdict: 'changed', dates: [{ iso: '2026-10-24', quote: 'Sa 24.10.2026' }], summary: 's' },
  ] }, qs, today);
  assert.deepEqual(out, []);
});
