import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractDates, datesInQuote, hoursIn } from './dates.mjs';

// Friday 9 October 2026, Europe/Zurich.
const today = '2026-10-09';
const read = (...lines) => extractDates(lines, { today });
const isos = (...lines) => read(...lines).dates.map((d) => d.iso);
const one = (line) => read(line).dates[0];

test('full dates in every language', () => {
  assert.deepEqual(isos('Samstag, 24. Oktober 2026'), ['2026-10-24']);
  assert.deepEqual(isos('samedi 24 octobre 2026'), ['2026-10-24']);
  assert.deepEqual(isos('sabato 24 ottobre 2026'), ['2026-10-24']);
  assert.deepEqual(isos('Saturday, October 24, 2026'), ['2026-10-24']);
  assert.deepEqual(isos('24.10.2026'), ['2026-10-24']);
  assert.deepEqual(isos('24.10.26'), ['2026-10-24']);
  assert.deepEqual(isos('2026-10-24'), ['2026-10-24']);
  assert.deepEqual(isos('1er mai 2027'), ['2027-05-01']);
  assert.deepEqual(isos('1° maggio 2027'), ['2027-05-01']);
  assert.deepEqual(isos('Sonnabend, 14. November 2026'), ['2026-11-14']);
});

test('a date without a year needs its dot, a weekday or a month word', () => {
  assert.deepEqual(isos('Sa 24.10.'), ['2026-10-24']);
  assert.equal(one('Sa 24.10.').assumed, false, 'the weekday fixes the year');
  assert.equal(one('Sa 24.10.').weekday, true);
  assert.deepEqual(isos('Sa 24.10'), ['2026-10-24']);
  assert.deepEqual(isos('am 24.10. ab 9 Uhr'), ['2026-10-24']);
  assert.equal(one('am 24.10. ab 9 Uhr').assumed, true);
  assert.deepEqual(isos('Öffnungszeiten 8.00–16.00'), [], 'opening hours are not dates');
  assert.deepEqual(isos('von 10.00 bis 15.00 Uhr'), []);
  assert.deepEqual(isos('Mai 2027'), [], 'a month is not a date');
  assert.deepEqual(isos('jeden ersten Samstag im Monat'), []);
  assert.deepEqual(isos('Straße des 17. Juni, Berlin'), [], 'a street, not a date');
});

test('lists and ranges', () => {
  assert.deepEqual(isos('3./10./17. Mai 2027'), ['2027-05-03', '2027-05-10', '2027-05-17']);
  assert.deepEqual(isos('les 24 et 25 octobre'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('24.–25. Oktober'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('du 24 au 25 octobre 2026'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('dal 24 al 25 ottobre 2026'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('Samstag 24. und Sonntag 25. Oktober 2026'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('24./25.10.'), ['2026-10-24', '2026-10-25']);
  assert.deepEqual(isos('Oktober 2026: 10., 24.'), ['2026-10-10', '2026-10-24']);
});

test('the year comes from the line, then the heading above, then the weekday', () => {
  assert.deepEqual(isos('Termine 2027', '10. Januar', '14. Februar'), ['2027-01-10', '2027-02-14']);
  assert.equal(read('Termine 2027', '10. Januar').dates[0].assumed, false);
  // Hyper Bazar's own layout.
  assert.deepEqual(isos('2027 ?', '– Samedi 24 avril', '– Samedi 29 mai'), ['2027-04-24', '2027-05-29']);
  // A weekday that fits only last year: last year's page, nothing upcoming.
  const old = read('Samstag, 25. Oktober');
  assert.deepEqual(old.dates, []);
  assert.equal(old.past, 1);
});

test('a weekday that does not fit its date is kept but marked', () => {
  const d = one('Samstag, 25. Oktober 2026'); // a Sunday
  assert.equal(d.iso, '2026-10-25');
  assert.equal(d.weekday, false);
});

test('dates the page says will not run are marked off', () => {
  const kanzlei = read('Jeden Samstag (ausser am 1.5., 1.8. und zwischen Weihnachten und Neujahr)').dates;
  assert.deepEqual(kanzlei.map((d) => [d.iso, d.off]), [['2027-05-01', 'excluded'], ['2027-08-01', 'excluded']]);
  const peters = read('Im Jahr 2026 findet an folgenden Tagen kein Markt statt: 3. Januar, 4. April, 10. Oktober und 26. Dezember.');
  assert.deepEqual(peters.dates.map((d) => [d.iso, d.off]), [['2026-10-10', 'excluded'], ['2026-12-26', 'excluded']]);
  assert.equal(peters.past, 2);
  assert.equal(one('24.10.2026 – abgesagt').off, 'cancelled');
  assert.equal(one('samedi 24 octobre 2026 : annulé').off, 'cancelled');
  const struck = read('~~24.10.2026~~ 31.10.2026').dates;
  assert.deepEqual(struck.map((d) => [d.iso, d.off]), [['2026-10-24', 'struck'], ['2026-10-31', null]]);
  assert.deepEqual(read('An folgenden Tagen findet kein Markt statt:', '26.12.2026').dates.map((d) => d.off), ['excluded']);
  assert.equal(one('Ausserdem am 24.10.2026 offen').off, null, '"ausserdem" is not "ausser"');
});

test('phone numbers and past dates are not upcoming dates', () => {
  assert.deepEqual(isos('Tel. 044 123 45 67, Anmeldung bis 24.10.'), []);
  const r = read('12.09.2026', '24.10.2026');
  assert.deepEqual(r.dates.map((d) => d.iso), ['2026-10-24']);
  assert.equal(r.past, 1);
  assert.deepEqual(isos('24.10.2029'), [], 'beyond 15 months');
});

test('a quote is read with the same rules', () => {
  assert.ok(datesInQuote('Sa 24. April 2027 • 10.00 – 17.00 h', { today }).has('2027-04-24'));
  assert.ok(!datesInQuote('Sa 24. April 2027', { today }).has('2027-04-25'));
});

test('opening hours', () => {
  assert.deepEqual(hoursIn('8-16 Uhr'), { start: '08:00', end: '16:00' });
  assert.deepEqual(hoursIn('Der Flosch dauert jeweils von 8- 17 Uhr'), { start: '08:00', end: '17:00' });
  assert.deepEqual(hoursIn('08:00–17:00'), { start: '08:00', end: '17:00' });
  assert.deepEqual(hoursIn('de 8h à 16h30'), { start: '08:00', end: '16:30' });
  assert.deepEqual(hoursIn('von 10.00 bis 15.00 Uhr'), { start: '10:00', end: '15:00' });
  assert.equal(hoursIn('Saison 2026-2027'), null);
  assert.equal(hoursIn('3./10./17. Mai'), null);
});
