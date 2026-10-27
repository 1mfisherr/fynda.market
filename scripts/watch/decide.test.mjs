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

/* The first live run, 2026-10-09: seven of fourteen findings were wrong. Each case, as the page had it. */

const kassel = (dates) => ({
  tokens: marketTokens({ name: 'XXL Flohmarkt Messe Kassel', venue: 'Messehallen', town: 'Kassel' }),
  dates: dates.map((date) => ({ date, status: 'confirmed', start: null, end: null, origin: 'import' })),
});

test('an organiser\'s programme: a date captioned with another market is not ours (Hansen, Kassel)', () => {
  const lines = ['Flohmärkte Hessen', '24. Oktober 2026', 'Kassel Messehallen (Sa+So)', 'Weitere Informationen',
    '07. November 2026', 'Hann.Münden Weserpark (Sa/So)', 'Weitere Informationen', '12. Dezember 2026', 'Kassel Messehallen (Sa+So)'];
  const r = decide(page(lines, { newLines: [1, 4, 7] }), kassel(['2026-10-24', '2026-12-12']));
  assert.deepEqual(r.stamp, ['2026-10-24', '2026-12-12']);
  assert.deepEqual(r.questions.filter((q) => q.kind === 'new_date'), []);
});

test('"nur FM Harz u. Heide": that weekend belongs to the organiser\'s other market (Pinguin, Schützenplatz)', () => {
  const lines = ['Flohmarkt Schützenplatz BS: unsere nächsten Termine:', 'Freitag, 30. Oktober / Sonnabend, 31. Oktober 2026',
    'Freitag, 06. November / Sonnabend, 07. November nur FM Harz u. Heide', 'Freitag, 13. November / Sonnabend, 14. November 2026'];
  const m = { tokens: marketTokens({ name: 'Flohmarkt Schützenplatz', venue: 'Schützenplatz', town: 'Braunschweig' }),
    dates: ['2026-10-30', '2026-10-31', '2026-11-06', '2026-11-13', '2026-11-14'].map((date) => ({ date, status: 'confirmed', start: null, end: null, origin: 'import' })) };
  const r = decide(page(lines, { newLines: [1, 2, 3] }), m);
  assert.deepEqual(r.questions.filter((q) => q.kind === 'new_date'), [], '7 November is not offered as ours');
  assert.deepEqual(r.questions.filter((q) => q.kind === 'missing').flatMap((q) => q.dates), ['2026-11-06'], 'and our 6 November is questioned');
});

test('an earlier start with the same end is the sellers\' gate, not new hours (troedel-mit, Weidenpesch)', () => {
  const p = page(['Flohmarkt an der Galopprennbahn Weidenpesch', 'Datum 10.10.2026 Zeit 6:00 - 14:00']);
  const r = decide(p, market([{ date: '2026-10-10', status: 'confirmed', start: '08:00', end: '14:00', origin: 'import' }],
    { tokens: marketTokens({ name: 'Flohmarkt an der Galopprennbahn Weidenpesch', town: 'Köln' }) }));
  assert.deepEqual(r.questions, []);
  assert.deepEqual(r.stamp, ['2026-10-10']);
});

test('real new hours are still asked about (Riem, 7–14 against our 6–15)', () => {
  const p = page(['Flohmarkt Riem', '07.11.2026 von 7 - 14 Uhr']);
  const r = decide(p, market([{ date: '2026-11-07', status: 'confirmed', start: '06:00', end: '15:00', origin: 'import' }],
    { tokens: marketTokens({ name: 'Flohmarkt Riem', town: 'München' }) }));
  assert.deepEqual(r.questions.map((q) => [q.kind, q.start, q.end]), [['hours', '07:00', '14:00']]);
});

test('a page that says "every Saturday" does not make the dates it leaves out missing (Leo)', () => {
  const lines = ['Leo Flohmarkt', 'JEDEN SAMSTAG', '10 - 16 UHR',
    'Flohmarkt am Leopoldplatz am 17. Oktober 2026 · 2026-10-17', 'Flohmarkt am Leopoldplatz am 24. Oktober 2026 · 2026-10-24',
    'Flohmarkt am Leopoldplatz am 31. Oktober 2026 · 2026-10-31'];
  const m = { tokens: marketTokens({ name: 'Leo Flohmarkt', venue: 'Leopoldplatz', town: 'Berlin' }),
    dates: ['2026-10-10', '2026-10-17', '2026-10-24', '2026-10-31'].map((date) => ({ date, status: 'confirmed', start: null, end: null, origin: 'import' })) };
  const r = decide(page(lines), m);
  assert.deepEqual(r.questions, []);
  assert.deepEqual(r.stamp, ['2026-10-17', '2026-10-24', '2026-10-31']);
});

/* Rule pages (rules.mjs, 2026-10-27): a date we hold that the organiser's stated rhythm produces is stamped. */

test('a weekly rule stamps the dates we hold on that weekday, and no other', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Jeden Sonntag von 10 bis 18 Uhr']);
  const r = decide(p, market(['2026-10-11', '2026-10-18', '2026-10-17']));
  assert.deepEqual(r.stamp, ['2026-10-11', '2026-10-18']);
  assert.deepEqual(r.questions, []);
});

test('"jeden Samstag und Sonntag" and "jedes Wochenende" cover both days', () => {
  for (const line of ['ganzjährig jeden Samstag und Sonntag', 'An jedem Wochenende (ausser an Feiertagen)']) {
    assert.deepEqual(decide(page(['Flohmarkt am Mauerpark', line]), market(['2026-10-17', '2026-10-18', '2026-10-16'])).stamp, ['2026-10-17', '2026-10-18'], line);
  }
});

test('"jeden 3. Sonntag" stamps only the third Sunday', () => {
  const p = page(['Flohmarkt am Mauerpark', 'jeden Samstag und jeden 3. Sonntag im Monat']);
  assert.deepEqual(decide(p, market(['2026-10-18', '2026-10-25', '2026-10-24'])).stamp, ['2026-10-18', '2026-10-24']);
});

test('a rule never stamps a holiday, Christmas week or the quiet November Sundays', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Jeden Sonntag']);
  // All Saints, Volkstrauertag, Totensonntag, 27 Dec; 29 Nov is an ordinary Sunday.
  assert.deepEqual(decide(p, market(['2026-11-01', '2026-11-15', '2026-11-22', '2026-11-29', '2026-12-27'])).stamp, ['2026-11-29']);
});

test('a page that speaks of a season or a break stamps nothing by rule', () => {
  for (const line of ['Winterpause Dezember bis Februar', 'Von April bis Oktober', 'Letzter Markt 2026 am 28.11.2026']) {
    assert.deepEqual(decide(page(['Flohmarkt am Mauerpark', 'Jeden Sonntag', line]), market(['2026-10-18'])).stamp, [], line);
  }
});

test('a negated rule is no rule', () => {
  assert.deepEqual(decide(page(['Flohmarkt am Mauerpark', 'Kein Markt jeden Sonntag']), market(['2026-10-18'])).stamp, []);
});

test('on a calendar of several markets, only a rule naming this market counts', () => {
  const lines = ['Unsere Märkte', 'Arkonaplatz: jeden Sonntag', 'Mauerpark: jeden Samstag'];
  assert.deepEqual(decide(page(lines, { marketsCovered: 2 }), market(['2026-10-17', '2026-10-18'])).stamp, ['2026-10-17']);
});

test('a rule with other hours than ours stamps nothing; the sellers\' gate is not other hours', () => {
  const ours = (start, end) => market([{ date: '2026-10-18', status: 'confirmed', start, end, origin: 'import' }]);
  assert.deepEqual(decide(page(['Flohmarkt am Mauerpark', 'Jeden Sonntag 8-16 Uhr']), ours('10:00', '18:00')).stamp, []);
  assert.deepEqual(decide(page(['Flohmarkt am Mauerpark', 'Jeden Sonntag 9-18 Uhr']), ours('10:00', '18:00')).stamp, ['2026-10-18']);
});

test('inside a span of listed dates the list decides, not the rule', () => {
  const p = page(['Flohmarkt am Mauerpark', 'Jeden Sonntag', 'So 11.10.2026', 'So 25.10.2026']);
  assert.deepEqual(decide(p, market(['2026-10-11', '2026-10-18', '2026-10-25', '2026-11-08'])).stamp, ['2026-10-11', '2026-10-25', '2026-11-08']);
});
