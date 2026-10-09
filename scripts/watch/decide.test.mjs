import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDates } from './dates.mjs';
import { decide, marketTokens, snippetFor } from './decide.mjs';

const today = '2026-10-09';
const page = (lines, extra = {}) => ({
  lines, title: '', today, stale: false, firstRead: false, marketsCovered: 1,
  ...extractDates(lines, { today }), ...extra, newLines: new Set(extra.newLines ?? []),
});
const market = (dates, extra = {}) => ({
  tokens: marketTokens({ name: 'Flohmarkt am Mauerpark', venue: 'Mauerpark', town: 'Berlin' }),
  dates: dates.map((d) => (typeof d === 'string' ? { date: d, status: 'confirmed', start: null, end: null, origin: 'import' } : d)),
  ...extra,
});

test('tokens leave out the words every market shares', () => {
  assert.deepEqual(marketTokens({ name: 'Flohmarkt am Mauerpark', venue: 'Mauerpark', town: 'Berlin' }), ['mauerpark', 'berlin']);
});

test('our dates on a page about this market are stamped', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Termine 2026', 'Sa 24.10.', 'Sa 31.10.']);
  const r = decide(p, market(['2026-10-24', '2026-10-31']));
  assert.deepEqual(r.stamp, ['2026-10-24', '2026-10-31']);
  assert.deepEqual(r.questions, []);
});

test('a date whose year is only assumed is not stamped and not asked', () => {
  const p = page(['Flohmarkt am Mauerpark', 'nächster Markt am 24.10.']);
  const r = decide(p, market(['2026-10-24']));
  assert.deepEqual(r.stamp, []);
  assert.deepEqual(r.questions, []);
});

test('a date inside the listed span but absent is asked about as missing', () => {
  const p = page(['Flohmarkt am Mauerpark', '24.10.2026', '7.11.2026']);
  const r = decide(p, market(['2026-10-24', '2026-10-31', '2026-11-07']));
  assert.deepEqual(r.stamp, ['2026-10-24', '2026-11-07']);
  assert.equal(r.questions.length, 1);
  assert.equal(r.questions[0].kind, 'missing');
  assert.deepEqual(r.questions[0].dates, ['2026-10-31']);
});

test('dates after the last one the page shows are not missing', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Nächste Termine: 24.10.2026, 31.10.2026']);
  const r = decide(p, market(['2026-10-24', '2026-10-31', '2026-11-07', '2026-11-14']));
  assert.deepEqual(r.questions, []);
});

test('a struck or cancelled date we show is asked about', () => {
  const p = page(['Flohmarkt am Mauerpark', '~~24.10.2026~~', '31.10.2026']);
  const r = decide(p, market(['2026-10-24', '2026-10-31']));
  assert.deepEqual(r.questions.map((q) => [q.kind, q.dates]), [['cancelled', ['2026-10-24']]]);
});

test('a new date is asked about only when its line is new to the page', () => {
  const lines = ['Flohmarkt am Mauerpark', '24.10.2026', '21.11.2026'];
  assert.deepEqual(decide(page(lines), market(['2026-10-24'])).questions, []);
  const r = decide(page(lines, { newLines: [2] }), market(['2026-10-24']));
  assert.deepEqual(r.questions.map((q) => [q.kind, q.dates]), [['new_date', ['2026-11-21']]]);
});

test('on a calendar of many markets only lines naming this one count, and nothing is "missing"', () => {
  const p = page(['Unsere Märkte', 'Mauerpark: 24.10.2026', 'Arkonaplatz: 25.10.2026', 'Mauerpark: 7.11.2026'], { marketsCovered: 4, newLines: [2] });
  const r = decide(p, market(['2026-10-24', '2026-10-31', '2026-11-07']));
  assert.deepEqual(r.stamp, ['2026-10-24', '2026-11-07']);
  assert.deepEqual(r.questions, [], 'Arkonaplatz is not ours to ask about, and 31 Oct is not "missing" here');
});

test('other hours on a date line are asked about, not stamped', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Sa 24.10.2026, 8-16 Uhr']);
  const r = decide(p, market([{ date: '2026-10-24', status: 'confirmed', start: '10:00', end: '18:00', origin: 'import' }]));
  assert.deepEqual(r.stamp, []);
  assert.deepEqual(r.questions.map((q) => [q.kind, q.start, q.end]), [['hours', '08:00', '16:00']]);
});

test('a snippet is the named lines with their neighbours', () => {
  const lines = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  assert.equal(snippetFor(lines, [1], 1), 'a\nb\nc');
  assert.equal(snippetFor(lines, [1, 8], 1), 'a\nb\nc\n…\nh\ni\nj');
});
