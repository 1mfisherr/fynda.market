/**
 * Page titles that survive Google.
 *
 * Google shows about sixty characters of a title on a phone and rewrites most
 * of what runs past seventy (docs/reference/seo-research/02-seo-for-directories.md).
 * So a title is the page's heading plus one fact — the next date, the venue —
 * and the fact is dropped, never the heading, when the two together would not
 * fit. The heading is also the H1, which is what Google falls back to anyway.
 */
export const TITLE_MAX = 65;

/** The first candidate that fits, else the last one. */
export function firstFitting(candidates: string[], max = TITLE_MAX): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1];
}

/**
 * A search snippet Google will not cut mid-thought. Whole sentences while they
 * fit; a sentence ends at a full stop that follows a word (not a digit — "Sa
 * 26. Sept" is one sentence) and is not an abbreviation. Repeated full stops,
 * which a rhythm line ending in one used to produce, collapse to one.
 */
export const DESCRIPTION_MAX = 160;
const ABBREVIATIONS = /(?:\bSt|\bStr|\bNr|\bca|\bz\.B|\bbzw|\bev|\bSte)$/;
export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\.{2,}/g, '.').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const ends: number[] = [];
  for (let i = 0; i < clean.length; i++) {
    if (!'.!?'.includes(clean[i])) continue;
    if (i + 1 < clean.length && clean[i + 1] !== ' ') continue;
    if (/\d/.test(clean[i - 1] ?? '')) continue;
    if (ABBREVIATIONS.test(clean.slice(Math.max(0, i - 4), i))) continue;
    ends.push(i + 1);
  }
  const fits = ends.filter((e) => e <= max);
  if (fits.length) return clean.slice(0, fits[fits.length - 1]).trim();
  const cut = clean.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:–-]+$/, '') + '…';
}

/** `main – tail`, or `main` alone when the pair would run too long. */
export function fitTitle(main: string, tail?: string, max = TITLE_MAX): string {
  if (!tail) return main;
  const joined = `${main} – ${tail}`;
  return joined.length <= max ? joined : main;
}
