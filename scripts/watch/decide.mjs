/**
 * One page's dates against one market's: stamp what matches, ask about the rest.
 *
 * Pure. The run feeds it what `dates.mjs` read and what we hold; it returns
 * the dates to stamp and the questions for the AI. Nothing here is a change
 * to the site — a question becomes a change only when Delfim approves it.
 *
 *   stamp     our date is on the page, plainly, and the page is not stale
 *   cancelled our date is on the page as struck, cancelled or excluded
 *   missing   our date lies inside the span of dates the page lists, but is not
 *             there (a page that lists the next three dates does not make the
 *             fourth "missing")
 *   new_date  the page names a date we do not have, on a line this page never
 *             showed before, beside the market's name or a flea-market word
 *   hours     the page gives other opening hours on the line of a date we have
 *
 * A page that covers several markets (an organiser's calendar) only stamps and
 * asks about lines that name this market; it never reports "missing".
 */

import { hoursIn, normalise } from './dates.mjs';

const FLEA = /floh|trödel|troedel|antik|brocante|puces|vide[- ]grenier|vide[- ]dressing|mercatin|bazar|basar|börse|boerse|flea|markt|marché|march[eé]|mercato|market/iu;

// Words in a market's name that say nothing about which market it is.
const GENERIC = new Set([
  'flohmarkt', 'flohmärkte', 'trödelmarkt', 'troedelmarkt', 'trödel', 'antikmarkt', 'antik', 'markt', 'märkte', 'nachtflohmarkt',
  'hallenflohmarkt', 'kinderflohmarkt', 'flohmarkt', 'floh', 'und', 'der', 'die', 'das', 'den', 'dem', 'am', 'im', 'in', 'an', 'auf',
  'bei', 'beim', 'vor', 'zum', 'zur', 'von', 'vom', 'mit', 'für', 'the', 'and', 'of', 'at', 'flea', 'market', 'marché', 'aux', 'puces',
  'de', 'du', 'des', 'la', 'le', 'les', 'mercatino', 'mercato', 'del', 'della', 'di', 'e', 'st', 'sankt', 'grosser', 'großer', 'großer',
]);

/** The words that pick this market out of a page: its name, its venue, its town. */
export function marketTokens({ name = '', venue = '', town = '' }) {
  const words = (s) => normalise(s).split(/[^\p{L}\d]+/u).filter((w) => w.length >= 3 && !GENERIC.has(w));
  return [...new Set([...words(name), ...words(venue), ...words(town)])];
}

const mentions = (text, tokens) => tokens.some((t) => text.includes(t));

/**
 * @param {object} page
 * @param {string[]} page.lines
 * @param {Array<{iso: string, line: number, assumed: boolean, weekday: boolean|null, off: string|null}>} page.dates
 * @param {boolean} page.stale
 * @param {string} page.title
 * @param {Set<string>} page.newLines   indexes of lines this page has never shown before
 * @param {string} page.today       YYYY-MM-DD, Europe/Zurich
 * @param {boolean} page.firstRead
 * @param {number} page.marketsCovered
 * @param {object} market
 * @param {string[]} market.tokens
 * @param {Array<{date: string, status: string, start: string|null, end: string|null, origin: string}>} market.dates  ours, from today on
 * @returns {{stamp: string[], questions: Array<{kind: string, dates: string[], lines: number[], hint: string, start?: string, end?: string}>, relevantDates: number, named: boolean}}
 */
export function decide(page, market) {
  const lower = page.lines.map(normalise);
  const window = (i) => [lower[i - 1] ?? '', lower[i], lower[i + 1] ?? ''].join(' ');
  const named = mentions(lower.join(' ') + ' ' + normalise(page.title ?? ''), market.tokens);
  const single = page.marketsCovered <= 1;
  // A page about this market alone: we link no other market to it, and it names this one
  // (its name, venue or town) somewhere — a page that never does is no evidence for it.
  const dedicated = single && named;

  // On a calendar of several markets a date belongs to this one only if its own line, or the
  // heading it sits under (the nearest line above without a date), names it — never a neighbour's line.
  const dateLines = new Set(page.dates.map((d) => d.line));
  const heading = (i) => {
    for (let j = i - 1; j >= Math.max(0, i - 8); j--) if (!dateLines.has(j)) return lower[j];
    return '';
  };
  const relevant = (d) => {
    if (dedicated) return true;
    if (single) return mentions(window(d.line), market.tokens) || FLEA.test(window(d.line));
    return mentions(lower[d.line], market.tokens) || mentions(heading(d.line), market.tokens);
  };
  const pageDates = page.dates.filter(relevant);
  const on = new Map(pageDates.filter((d) => !d.off).map((d) => [d.iso, d]));
  const off = new Map(pageDates.filter((d) => d.off).map((d) => [d.iso, d]));
  const ours = market.dates.filter((d) => d.status !== 'cancelled');
  const oursSet = new Set(market.dates.map((d) => d.date));
  const last = [...on.keys()].sort().at(-1) ?? null;

  // "Missing" needs a page that is the whole schedule: within its span it shows most of what we list.
  // A weekly market's page that names three special dates is not a list of every Saturday.
  const inSpan = last ? ours.filter((o) => o.date > page.today && o.date <= last) : [];
  const shown = inSpan.filter((o) => on.has(o.date)).length;
  const fullSchedule = inSpan.length > 0 && shown / inSpan.length >= 0.6;

  const stamp = [];
  const questions = [];
  // One question per kind (and per set of hours), its dates together: ten identical answers are one decision.
  const ask = (kind, dates, lines, hint, extra = {}) => {
    const same = questions.find((q) => q.kind === kind && q.start === extra.start && q.end === extra.end);
    if (same) {
      same.dates.push(...dates);
      same.lines = [...new Set([...same.lines, ...lines])];
      same.hint = `${same.hint.split(' (and')[0]} (and ${same.dates.length - 1} more date(s) alike)`;
    } else {
      questions.push({ kind, dates: [...dates], lines: [...new Set(lines)], hint, ...extra });
    }
  };

  for (const o of ours) {
    const p = on.get(o.date);
    const x = off.get(o.date);
    if (x) {
      ask('cancelled', [o.date], [x.line], `The page lists ${o.date} as ${x.off}; we show it as happening.`);
      continue;
    }
    if (p) {
      const trusted = !page.stale && (!p.assumed || p.weekday === true) && p.weekday !== false;
      const h = hoursIn(page.lines[p.line]);
      if (h && o.start && (h.start !== o.start || (o.end && h.end !== o.end))) {
        ask('hours', [o.date], [p.line], `Our hours for ${o.date} are ${o.start}–${o.end ?? '?'}; the line says ${h.start}–${h.end}.`, h);
      } else if (trusted) {
        stamp.push(o.date);
      }
      // Otherwise the page shows the day but not its year: no stamp, and nothing an AI could settle.
      continue;
    }
    // Inside the page's list but absent — only meaningful on a page about this market alone.
    if (dedicated && fullSchedule && o.date > page.today && o.date < last && o.origin !== 'organiser') {
      const before = [...on.values()].filter((d) => d.iso < o.date).at(-1);
      const after = [...on.values()].find((d) => d.iso > o.date);
      ask('missing', [o.date], [before?.line, after?.line].filter((n) => n != null),
        `We list ${o.date}; the page lists dates before and after it but not this one.`);
    }
  }

  // Dates we do not have, on lines this page has not shown before (on a first read: only beside the market's name).
  const fresh = [...on.values()].filter((d) => !oursSet.has(d.iso) && d.iso > page.today
    && (page.firstRead ? mentions(window(d.line), market.tokens) || dedicated : page.newLines.has(d.line)));
  if (fresh.length) {
    ask('new_date', fresh.map((d) => d.iso), fresh.map((d) => d.line),
      `The page lists ${fresh.map((d) => d.iso).join(', ')}, which we do not have.`);
  }

  return { stamp, questions, relevantDates: pageDates.length, named };
}

/** The lines the AI sees for a question: each named line with three either side, in page order. */
export function snippetFor(lines, indexes, around = 3) {
  const keep = new Set();
  for (const i of indexes) for (let j = Math.max(0, i - around); j <= Math.min(lines.length - 1, i + around); j++) keep.add(j);
  const out = [];
  let prev = -2;
  for (const j of [...keep].sort((a, b) => a - b)) {
    if (j > prev + 1 && out.length) out.push('…');
    out.push(lines[j]);
    prev = j;
  }
  return out.join('\n');
}
