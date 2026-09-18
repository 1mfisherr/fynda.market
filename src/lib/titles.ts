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

/** `main – tail`, or `main` alone when the pair would run too long. */
export function fitTitle(main: string, tail?: string, max = TITLE_MAX): string {
  if (!tail) return main;
  const joined = `${main} – ${tail}`;
  return joined.length <= max ? joined : main;
}
