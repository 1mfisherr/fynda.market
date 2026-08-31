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
 * The file to request for a box this wide. Anything that is not one of our own
 * .webp files is returned untouched — there is nothing to swap it for.
 */
export function photoUrl(url: string, width: number): string {
  if (width > THUMB_ABOVE_WIDTH || !url.endsWith('.webp')) return url;
  return thumbUrl(url);
}
