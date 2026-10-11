/**
 * Finding a town by what someone typed — the town search's rule, shared with
 * the newsletter's town field so the two can never disagree about whether
 * "muen" is München.
 *
 * A town matches on the start of its name, then on the start of any word in
 * it, never the middle of a word ("mün" must not find Dortmund); with or
 * without its umlaut; and by its slug, which is the town's own name in plain
 * letters, so "Genève" finds Genf on /de/. Bigger towns first.
 */

/* "München", "Muenchen" and "Munchen" are one town to a person typing. */
const MARKS = /\p{M}/gu;
export const fold = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(MARKS, '')
    .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u').replace(/ß/g, 'ss');

export interface Matchable { slug: string; name: string; n: number }

export function townMatcher<T extends Matchable>(towns: T[]) {
  const folded = towns.map((town) => ({
    town,
    key: fold(town.name),
    words: [...fold(town.name).split(/[\s\-/().]+/), fold(town.slug.replace(/-/g, ' '))],
  }));
  return {
    /** Up to `limit` towns for what was typed; none for an empty box. */
    match(query: string, limit = 6): T[] {
      const q = fold(query.trim());
      if (!q) return [];
      return folded
        .map(({ town, key, words }) => ({ town, score: key.startsWith(q) ? 0 : words.some((w) => w.startsWith(q)) ? 1 : 9 }))
        .filter((x) => x.score < 9)
        .sort((a, b) => a.score - b.score || b.town.n - a.town.n)
        .slice(0, limit)
        .map((x) => x.town);
    },
    /** The town whose whole name (or slug) is exactly what was typed. */
    exact(query: string): T | undefined {
      const q = fold(query.trim());
      if (!q) return undefined;
      return folded.find(({ town, key }) => key === q || fold(town.slug.replace(/-/g, ' ')) === q)?.town;
    },
  };
}
