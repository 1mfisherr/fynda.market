/**
 * Every date a page states, read the way a person would — the watcher's eyes.
 *
 * Pure: lines in, dates out, no network, no database. `dates.test.mjs` holds
 * the cases that matter (docs/WATCH-SPEC.md §Date extraction rules).
 *
 * Why our own and not chrono-node: tested 2026-10-09, chrono reads nothing in
 * "Sa 24.10.", only the last day of "3./10./17. Mai", accepts a weekday that
 * does not fit its date, and reads "8.00–16.00" as tomorrow. A wrong date here
 * becomes a wrong stamp on the site, so the extractor is strict and a miss is
 * cheap: a date it misses becomes a question for the AI, never a stamp.
 *
 * What a date needs to count:
 *   - a year beside it, or a trailing dot ("24.10."), or a weekday before it
 *     ("Sa 24.10"), or a month written as a word ("24. Oktober");
 *   - not on a phone or fax line;
 *   - between today and 15 months out (earlier ones are counted as `past`).
 * A date without a year takes, in order: a year on the same line, the nearest
 * year heading above ("Termine 2027"), the year its weekday fits, else the
 * next time that day comes round — marked `assumed`.
 */

const MONTHS = [
  ['januar', 'jan', 'janvier', 'janv', 'gennaio', 'genn', 'gen', 'january', 'jänner', 'jaenner'],
  ['februar', 'feb', 'febr', 'février', 'fevrier', 'févr', 'fevr', 'febbraio', 'febbr', 'february'],
  ['märz', 'maerz', 'marz', 'mär', 'mrz', 'mars', 'marzo', 'march', 'mar'],
  ['april', 'apr', 'avril', 'avr', 'aprile'],
  ['mai', 'maggio', 'magg', 'may'],
  ['juni', 'jun', 'juin', 'giugno', 'giu', 'june'],
  ['juli', 'jul', 'juillet', 'juil', 'luglio', 'lug', 'july'],
  ['august', 'aug', 'août', 'aout', 'agosto', 'ago'],
  ['september', 'sept', 'sep', 'septembre', 'settembre', 'sett', 'set'],
  ['oktober', 'okt', 'octobre', 'oct', 'ottobre', 'ott', 'october'],
  ['november', 'nov', 'novembre'],
  ['dezember', 'dez', 'décembre', 'decembre', 'déc', 'dec', 'dicembre', 'dic', 'december'],
];
const ENGLISH_MONTHS = new Set(['january', 'jan', 'february', 'feb', 'march', 'mar', 'april', 'apr', 'may', 'june', 'jun',
  'july', 'jul', 'august', 'aug', 'september', 'sept', 'sep', 'october', 'oct', 'november', 'nov', 'december', 'dec']);

// 0 = Sunday, as Date.getUTCDay().
const WEEKDAYS = [
  ['sonntag', 'so', 'dimanche', 'dim', 'domenica', 'dom', 'sunday', 'sun'],
  ['montag', 'mo', 'lundi', 'lun', 'lunedì', 'lunedi', 'monday', 'mon'],
  ['dienstag', 'di', 'mardi', 'martedì', 'martedi', 'tuesday', 'tue', 'tues'],
  ['mittwoch', 'mi', 'mercredi', 'mer', 'mercoledì', 'mercoledi', 'wednesday', 'wed'],
  ['donnerstag', 'do', 'jeudi', 'jeu', 'giovedì', 'giovedi', 'gio', 'thursday', 'thu', 'thur', 'thurs'],
  ['freitag', 'fr', 'vendredi', 'ven', 'venerdì', 'venerdi', 'friday', 'fri'],
  ['samstag', 'sonnabend', 'sa', 'samedi', 'sam', 'sabato', 'sab', 'saturday', 'sat'],
];

const monthOf = new Map(MONTHS.flatMap((words, i) => words.map((w) => [w, i + 1])));
const weekdayOf = new Map(WEEKDAYS.flatMap((words, i) => words.map((w) => [w, i])));
const alt = (words) => [...words].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.]/g, '\\.')).join('|');
const MONTH = `(?:${alt(monthOf.keys())})`;
const WEEKDAY = `(?:${alt(weekdayOf.keys())})`;
const L = '\\p{L}';

/** Words that say a date will not happen. Counted only on lines new to a page (decide.mjs). */
export const CANCEL_RE = new RegExp([
  'abgesagt', 'f[äa]llt\\s+(?:leider\\s+)?aus', 'entf[äa]llt', 'findet\\s+(?:leider\\s+)?nicht\\s+statt', 'verschoben', 'abgesagt',
  'annul[ée]e?s?', "n['’]aura\\s+pas\\s+lieu", 'report[ée]e?s?',
  'annullat[oaie]', 'rinviat[oaie]', 'non\\s+si\\s+terr[àa]', 'sospes[oaie]',
  'cancell?ed', 'postponed', 'called\\s+off',
].join('|'), 'iu');

/**
 * Words that say the dates on a line are the days a market does NOT run:
 * "ausser am 1.5.", "an folgenden Tagen kein Markt", "sauf jours fériés".
 */
// Whole words only: "ausser" must not fire inside "ausserdem", nor "chiuso" inside a longer word.
export const NEGATE_RE = new RegExp(`(?<![\\p{L}])(?:${[
  'au(?:ß|ss)er', 'ausgenommen', 'kein(?:e|en)?\\s+(?:flohmarkt|markt)', 'nicht\\s+statt', 'geschlossen', 'ruhetag',
  'sauf', "pas\\s+de\\s+march[ée]", 'ferm[ée]e?s?', 'rel[âa]che',
  'tranne', 'eccett[oa]', 'esclus[oaie]', 'nessun\\s+mercat\\p{L}*',
  'except', 'no\\s+market', 'closed',
].join('|')})(?![\\p{L}])`, 'iu');

const PHONE_RE = /\b(tel|telefon|téléphone|telefono|fax|mobile|natel)\b|\+4[19]|\b0\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b/iu;
const YEAR_RE = /(?<![\d.])(20[2-3]\d)(?![\d.])/u;

/** Lower-case, one kind of dash, one kind of space, no invisible characters. */
export function normalise(line) {
  return line
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[­​-‍⁠﻿]/gu, '')
    .replace(/[‐-―−]/gu, '-')
    .replace(/\s+/gu, ' ')
    .trim();
}

const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const real = (y, m, d) => {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};
const weekdayAt = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
const fullYear = (y) => (y < 100 ? 2000 + y : y);

/**
 * Expand "3./10./17.", "24.-25.", "24 et 25", "du 24 au 25" into day numbers.
 * A range ("-", "au", "al", "bis", "to") fills in the days between, up to a week.
 */
function daysOf(list) {
  const days = [];
  const parts = list.split(/\s*(?:,|\/|&|\+|\bund\b|\bet\b|\be\b|\band\b|\bsowie\b|\|)\s*/u);
  for (const part of parts) {
    const range = part.match(/(\d{1,2})\.?\s*(?:-|\bbis\b|\bau\b|\bal\b|\bto\b|\buntil\b)\s*(?:\p{L}+\s+)?(\d{1,2})/u);
    if (range) {
      const [a, b] = [Number(range[1]), Number(range[2])];
      if (b > a && b - a <= 7) for (let d = a; d <= b; d++) days.push(d);
      else days.push(a, b);
      continue;
    }
    for (const m of part.matchAll(/(\d{1,2})/gu)) days.push(Number(m[1]));
  }
  return days;
}

// Patterns, most specific first. Each names its groups; `scan` turns a match into candidates.
const DAY_SUFFIX = `(?:\\.|er|e|°|st|nd|rd|th)?`;
const DAYLIST = `\\d{1,2}${DAY_SUFFIX}(?:\\s*(?:,|/|&|\\+|-|und|et|e|and|bis|au|al|to|sowie)\\s*(?:${WEEKDAY}\\.?,?\\s*)?\\d{1,2}${DAY_SUFFIX})*`;
const PATTERNS = [
  // 2026-10-24
  { name: 'iso', re: /(?<!\d)(?<y>20\d\d)-(?<m>\d\d)-(?<d>\d\d)(?!\d)/gu },
  // 24.10.2026 · 24.10.26 · 24/10/2026 · 24. 10. 2026
  { name: 'numeric', re: /(?<![\d.])(?<d>\d{1,2})\.\s?(?<m>\d{1,2})\.\s?(?<y>20\d\d|\d\d)(?![\d.:])/gu },
  { name: 'slash', re: /(?<![\d/])(?<d>\d{1,2})\/(?<m>\d{1,2})\/(?<y>20\d\d)(?!\d)/gu },
  // 24. Oktober 2026 · samedi 24 octobre · 3./10./17. Mai · du 24 au 25 octobre · 24.-25. Oktober
  // (not a street named after a date: "Straße des 17. Juni", "Platz des 18. März")
  { name: 'words', re: new RegExp(`(?<![\\d${L}])(?<!(?:stra(?:ß|ss)e|str\\.|platz|allee|brücke|ring|weg|park)\\s+des\\s+)(?<list>${DAYLIST})\\s*(?<month>${MONTH})\\.?(?![${L}])(?!,?\\s*1\\d{3}(?!\\d))(?:,?\\s*(?<y>20\\d\\d)(?!\\d))?`, 'gu') },
  // October 24, 2026 · Oct 24 (English only — "Mai 2027" is a month, not a date)
  { name: 'english', re: new RegExp(`(?<![${L}])(?<month>${MONTH})\\.?\\s+(?<d>\\d{1,2})(?:st|nd|rd|th)?(?![\\d.:])(?:,?\\s+(?<y>20\\d\\d))?`, 'gu'), english: true },
  // Oktober 2026: 10., 24.  ·  Mai: 3./17.
  { name: 'monthlist', re: new RegExp(`(?<![${L}])(?<month>${MONTH})\\.?\\s*(?<y>20\\d\\d)?\\s*:\\s*(?<list>\\d{1,2}\\.(?:\\s*(?:,|/|&|und|et|e)\\s*\\d{1,2}\\.)*)`, 'gu') },
  // 24./25.10. · 3. + 17.10.
  { name: 'numlist', re: /(?<![\d.])(?<list>\d{1,2}\.(?:\s*(?:\/|,|&|\+|-|und|et)\s*\d{1,2}\.)+)\s?(?<m>\d{1,2})\.(?!\s?\d)/gu },
  // 24.10. — the trailing dot is what makes it a date and not a time
  { name: 'dotted', re: /(?<![\d.])(?<d>\d{1,2})\.\s?(?<m>\d{1,2})\.(?!\s?\d)(?!\s*(?:uhr|h)\b)/gu },
  // Sa 24.10 — a weekday vouches for a date without its trailing dot
  { name: 'weekdayed', re: new RegExp(`(?<![${L}])(?<wd>${WEEKDAY})\\.?,?\\s+(?<d>\\d{1,2})\\.(?<m>\\d{1,2})(?![\\d.:])(?!\\s*(?:uhr|h)\\b)`, 'gu') },
];

/** The weekday written just before a match, if any ("Sa 24.10.", "samedi 24 octobre"). */
function weekdayBefore(text, index) {
  const before = text.slice(Math.max(0, index - 16), index);
  const m = before.match(new RegExp(`(?<![${L}])(${WEEKDAY})\\.?,?\\s*$`, 'u'));
  return m ? weekdayOf.get(m[1]) : null;
}

/** Candidate {d, m, y|null, wd|null} from one line, without year inference. */
function scan(text) {
  const found = [];
  const taken = [];
  const free = (a, b) => !taken.some(([x, y]) => a < y && b > x);
  for (const p of PATTERNS) {
    for (const m of text.matchAll(p.re)) {
      const start = m.index, end = m.index + m[0].length;
      if (!free(start, end)) continue;
      const g = m.groups;
      if (p.english && !ENGLISH_MONTHS.has(g.month)) continue;
      const month = g.month ? monthOf.get(g.month) : Number(g.m);
      const year = g.y ? fullYear(Number(g.y)) : null;
      const days = g.list ? daysOf(g.list) : [Number(g.d)];
      if (!days.length) continue;
      const wd = g.wd ? weekdayOf.get(g.wd) : weekdayBefore(text, start);
      taken.push([start, end]);
      days.forEach((d, i) => found.push({ d, m: month, y: year, wd: i === 0 ? wd : null, at: start }));
    }
  }
  return found;
}

/**
 * The dates on a page.
 *
 * @param {string[]} lines   cleaned lines (clean.mjs); `~~…~~` marks struck-through text
 * @param {{today: string, months?: number}} opts   today as YYYY-MM-DD (Europe/Zurich)
 * @returns {{dates: Array<{iso: string, line: number, text: string, assumed: boolean, weekday: boolean|null, off: null|'struck'|'cancelled'|'excluded'}>, past: number, stale: boolean}}
 *   `off` says the page names the date as one that will not run.
 */
export function extractDates(lines, { today, months = 15 }) {
  const [ty, tm, td] = today.split('-').map(Number);
  const end = new Date(Date.UTC(ty, tm - 1 + months, td)).toISOString().slice(0, 10);
  const out = new Map();
  let past = 0;
  let mismatched = 0;
  let headingYear = null;
  let offHeading = false; // "An folgenden Tagen findet kein Markt statt:" governs the list below it

  lines.forEach((raw, index) => {
    const text = normalise(raw);
    if (!text || PHONE_RE.test(text)) { offHeading = false; return; }
    const candidates = scan(text);
    // "Im Jahr 2026 findet an folgenden Tagen kein Markt statt: 3. Januar, …" — the year is on the line, not on a date.
    const lineYear = candidates.find((c) => c.y)?.y ?? (text.match(YEAR_RE) ? Number(text.match(YEAR_RE)[1]) : null);
    // A line that names a year and no date is a heading for what follows ("Termine 2027", "2027 ?").
    if (!candidates.length) {
      const y = text.match(YEAR_RE);
      if (y && text.length <= 60) headingYear = Number(y[1]);
      offHeading = text.endsWith(':') && (NEGATE_RE.test(text) || CANCEL_RE.test(text));
      return;
    }
    const cancelled = CANCEL_RE.test(text);
    const negated = NEGATE_RE.test(text) || offHeading;

    for (const c of candidates) {
      let y = c.y ?? lineYear ?? headingYear;
      let assumed = false;
      if (!y && c.wd != null) {
        // The year in which this weekday fits, nearest first.
        y = [ty, ty + 1, ty - 1].find((yy) => real(yy, c.m, c.d) && weekdayAt(yy, c.m, c.d) === c.wd) ?? null;
      }
      if (!y) {
        y = real(ty, c.m, c.d) && iso(ty, c.m, c.d) >= today ? ty : ty + 1;
        assumed = true;
      }
      if (!real(y, c.m, c.d)) continue;
      const date = iso(y, c.m, c.d);
      const weekday = c.wd == null ? null : weekdayAt(y, c.m, c.d) === c.wd;
      if (weekday === false) mismatched++;
      if (date < today) { past++; continue; }
      if (date > end) continue;
      const struck = isStruck(c, text);
      const off = struck ? 'struck' : cancelled ? 'cancelled' : negated ? 'excluded' : null;
      const prev = out.get(date);
      // Keep the strongest reading of a date seen twice: a stated year beats an assumed one,
      // and a date the page says will run beats the same date in an exclusion list.
      if (!prev || (prev.assumed && !assumed) || (prev.off && !off && prev.assumed === assumed)) {
        out.set(date, { iso: date, line: index, text: raw.trim(), assumed, weekday, off });
      }
    }
  });

  const dates = [...out.values()].sort((a, b) => a.iso.localeCompare(b.iso));
  // Weekdays that fit no date are the mark of last year's page.
  const stale = mismatched > 0 && mismatched >= dates.filter((d) => d.weekday === true).length;
  return { dates, past, stale };
}

/** Whether the date at this match sits inside ~~struck~~ text. */
function isStruck(candidate, text) {
  if (!text.includes('~~')) return false;
  const parts = text.split('~~');
  let pos = 0;
  for (let i = 0; i < parts.length; i++) {
    const next = pos + parts[i].length + 2;
    if (candidate.at >= pos && candidate.at < next) return i % 2 === 1;
    pos = next;
  }
  return false;
}

/** The ISO dates a short quote states, read with the same rules — for checking the AI. */
export function datesInQuote(quote, { today, yearHint = null }) {
  const lines = yearHint ? [String(yearHint), quote] : [quote];
  return new Set(extractDates(lines, { today, months: 24 }).dates.map((d) => d.iso));
}

/** Opening hours on a line: "8-16 Uhr", "08:00–17:00", "de 8h à 16h", "10.00 bis 15.00". */
export function hoursIn(line) {
  const text = normalise(line);
  const t = '(\\d{1,2})(?:[:.h](\\d{2}))?';
  const m = text.match(new RegExp(`(?<![\\d.])${t}\\s*(?:uhr|h)?\\s*(?:-|bis|à|a|to|until|alle)\\s*${t}\\s*(uhr|h)?(?![\\d.])`, 'u'));
  if (!m) return null;
  const hasMarker = /uhr|\d[:h]\d|\dh\b|\d\s*h\b/u.test(m[0]) || m[5];
  if (!hasMarker) return null;
  const [sh, sm = '00', eh, em = '00'] = [m[1], m[2], m[3], m[4]];
  if (Number(sh) > 23 || Number(eh) > 24 || Number(sm) > 59 || Number(em) > 59 || Number(eh) <= Number(sh)) return null;
  return { start: `${pad(sh)}:${sm}`, end: `${pad(eh)}:${em}` };
}
