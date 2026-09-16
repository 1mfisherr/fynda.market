/**
 * Where the two sizes of a photograph live.
 *
 * Every market photo is written twice by scripts/import-images.mjs: the hero at
 * 1440px, and a 148px square beside it. The naming rule is here rather than in
 * either of them, because the script that writes the file and the component
 * that requests it have to agree, and a convention repeated in two places is a
 * convention that drifts.
 *
 * The thumbnail is not a nicety. A city page renders twenty MarketRows at 74px
 * square; without it each one fetches the full hero, which is roughly 2 MB of
 * image for squares the size of a postage stamp.
 */

/** Below this rendered width, the hero is wasted bytes. */
export const THUMB_ABOVE_WIDTH = 200;

/** "/images/flohmarkt-kanzlei.webp" -> "/images/flohmarkt-kanzlei-thumb.webp" */
export const thumbUrl = (url: string) => url.replace(/\.webp$/, '-thumb.webp');

/**
 * The 720px hero, for phones. The 1440px file is 70% of a market page's bytes
 * and was the largest-paint element on every phone (2026-09-16); a screen 375px
 * wide never needed it. Written beside the hero by import-images.mjs.
 */
export const MEDIUM_WIDTH = 720;
export const mediumUrl = (url: string) => url.replace(/\.webp$/, '-720.webp');

/** srcset + sizes for a hero, or undefined for anything that is not our own file. */
export function heroSources(url: string): { srcset: string; sizes: string } | undefined {
  if (!url.endsWith('.webp')) return undefined;
  return {
    srcset: `${mediumUrl(url)} ${MEDIUM_WIDTH}w, ${url} 1440w`,
    // The hero column is capped at 720px above the one breakpoint; below it the
    // photo is as wide as the screen.
    sizes: '(min-width: 900px) 720px, 100vw',
  };
}

/**
 * The file to request for a box this wide. Anything that is not one of our own
 * .webp files is returned untouched — there is nothing to swap it for.
 */
export function photoUrl(url: string, width: number): string {
  if (width > THUMB_ABOVE_WIDTH || !url.endsWith('.webp')) return url;
  return thumbUrl(url);
}
