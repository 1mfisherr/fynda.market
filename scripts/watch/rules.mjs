/**
 * Rule pages: "jeden Samstag", "jeden 1. Sonntag", "every weekend", "Immer Samstags".
 *
 * Most German organisers state a rhythm and list no dates, so a page that only
 * says "jeden Sonntag 8–17 Uhr" stamped nothing and the "checked" line under
 * every Berlin market aged for five weeks (found 2026-10-27). This reads the
 * rule in code — no AI — and lets decide.mjs stamp a date WE ALREADY HOLD when
 * the rule produces it. It never adds a date: a rule cannot say a market runs,
 * only that a date we have fits what the organiser says.
 *
 * Strict on purpose, because a wrong stamp costs trust and a missed one costs
 * nothing (the next listed date or a hand check stamps it):
 *   - a page that speaks of a season, a break or a last market stamps nothing by rule;
 *   - a line that negates ("kein Markt jeden Sonntag im Januar") is no rule;
 *   - public holidays, 24 Dec – 1 Jan and the two quiet Sundays of November
 *     are never stamped by rule — organisers close on them without saying so.
 */

import { normalise } from './dates.mjs';

const DAY = {
  montag: [1], dienstag: [2], mittwoch: [3], donnerstag: [4], freitag: [5], samstag: [6], sonnabend: [6], sonntag: [0],
  monday: [1], tuesday: [2], wednesday: [3], thursday: [4], friday: [5], saturday: [6], sunday: [0],
  lundi: [1], mardi: [2], mercredi: [3], jeudi: [4], vendredi: [5], samedi: [6], dimanche: [0],
  lunedì: [1], martedì: [2], mercoledì: [3], giovedì: [4], venerdì: [5], sabato: [6], domenica: [0],
  wochenende: [6, 0], weekend: [6, 0],
};
const NTH = {
  '1.': 1, '2.': 2, '3.': 3, '4.': 4, erste: 1, ersten: 1, zweite: 2, zweiten: 2, dritte: 3, dritten: 3, vierte: 4, vierten: 4,
  letzte: -1, letzten: -1, first: 1, second: 2, third: 3, fourth: 4, last: -1, premier: 1, deuxième: 2, troisième: 3, dernier: -1,
  primo: 1, prima: 1, secondo: 2, seconda: 2, terzo: 3, terza: 3, ultimo: -1, ultima: -1,
};
const days = Object.keys(DAY).join('|');
// "jeden Samstag", "jeden 1. Sonntag", "jedes Wochenende", "an jedem Wochenende", "every Saturday",
// "tous les samedis", "ogni sabato", "immer samstags". The weekday may carry a plural or adverbial -s.
const RULE = new RegExp(`(?:jede[nmrs]?|every|chaque|tous les|ogni|tutti i|tutte le|immer)\\s+(?:(\\d\\.|${Object.keys(NTH).filter((k) => !/\d/.test(k)).join('|')})\\s+)?(${days})(?:s|n)?(?![\\p{L}])`, 'giu');
// "Samstag und Sonntag", "Samstag & jeden Sonntag": a second weekday joined to the first.
const AND = new RegExp(`^\\s*(?:und|&|\\+|and|et|e|sowie)\\s+(?:jede[nmrs]?\\s+)?(${days})(?:s|n)?(?![\\p{L}])`, 'iu');

/** Words that make a whole page unsafe for rule stamps: the rhythm has a season or a gap. */
export const SEASON_RE = /winterpause|sommerpause|saisonpause|weihnachtspause|saison|season|pause|letzte[rn]? (markt|termin|flohmarkt)|last market|dernier march|ultimo mercat|(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|january|february|march|june|july|october|december|janvier|février|mars|avril|juin|juillet|août|octobre|novembre|décembre|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|dicembre)\s*(bis|-|to|à|a|–)\s*(januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember|january|february|march|june|july|october|december|janvier|février|mars|avril|juin|juillet|août|octobre|novembre|décembre|gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|dicembre)/iu;
const NEGATED = /(?<!\p{L})(kein|keine|nicht|geschlossen|entfällt|fällt|ruht|außer|ausser|no|not|closed|except|pas de|fermé|sauf|chiuso|tranne|niente)(?!\p{L})/iu;
// "außer an Feiertagen" is the one exception a rule may carry: quietDay() never stamps a holiday anyway.
const HOLIDAY_EXCEPTION = /\(?\s*(außer|ausser|nicht)\s+an\s+(gesetzlichen\s+)?feiertagen\s*\)?|\(?\s*except\s+(on\s+)?(public\s+)?holidays\s*\)?|\(?\s*sauf\s+(les\s+)?jours\s+fériés\s*\)?|\(?\s*tranne\s+(i\s+)?(giorni\s+)?festivi\s*\)?/giu;

/**
 * Every rule on the page.
 * @param {string[]} lines
 * @returns {Array<{line: number, weekdays: number[], nth: number|null}>}
 */
export function rulesIn(lines) {
  const out = [];
  lines.forEach((raw, line) => {
    const text = normalise(raw).replace(HOLIDAY_EXCEPTION, ' ');
    if (NEGATED.test(text)) return;
    for (const m of text.matchAll(RULE)) {
      const weekdays = [...DAY[m[2].toLowerCase()]];
      // "jeden Samstag und Sonntag" — the joined day shares the rule (not its nth: "jeden 1. Samstag und Sonntag" is rare and ambiguous).
      const rest = text.slice(m.index + m[0].length);
      const joined = AND.exec(rest);
      if (joined && !m[1]) weekdays.push(...DAY[joined[1].toLowerCase()]);
      out.push({ line, weekdays: [...new Set(weekdays)], nth: m[1] ? NTH[m[1].toLowerCase()] : null });
    }
  });
  return out;
}

const utc = (iso) => new Date(`${iso}T12:00:00Z`);
const iso = (d) => d.toISOString().slice(0, 10);
const plus = (d, n) => new Date(d.getTime() + n * 86_400_000);

/** Whether a rule produces this date. */
export function ruleCovers(rule, date) {
  const d = utc(date);
  if (!rule.weekdays.includes(d.getUTCDay())) return false;
  if (rule.nth == null) return true;
  const nth = Math.ceil(d.getUTCDate() / 7);
  const last = plus(d, 7).getUTCMonth() !== d.getUTCMonth();
  return rule.nth === -1 ? last : rule.nth === nth;
}

/** Easter Sunday (Gregorian, anonymous algorithm). */
function easter(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451), month = Math.floor((h + l - 7 * m + 114) / 31);
  return new Date(Date.UTC(y, month - 1, ((h + l - 7 * m + 114) % 31) + 1, 12));
}

/**
 * Days a rule never vouches for: public holidays in Germany or Switzerland
 * (national or in several states/cantons), 24 Dec – 1 Jan, and Volkstrauertag
 * and Totensonntag, the quiet Sundays Berlin's markets close on.
 */
export function quietDay(date) {
  const d = utc(date);
  const y = d.getUTCFullYear();
  const md = date.slice(5);
  if (md >= '12-24' || md === '01-01') return true;
  if (['01-06', '05-01', '08-01', '08-15', '10-03', '10-31', '11-01'].includes(md)) return true;
  const e = easter(y);
  if ([-2, 1, 39, 50, 60].some((n) => iso(plus(e, n)) === date)) return true;
  // Totensonntag: the Sunday before the first of Advent, i.e. the last Sunday on or before 26 Nov.
  const nov26 = new Date(Date.UTC(y, 10, 26, 12));
  const totensonntag = plus(nov26, -nov26.getUTCDay());
  return date === iso(totensonntag) || date === iso(plus(totensonntag, -7)) || date === iso(plus(totensonntag, -4)); // and Buß- und Bettag
}
