/**
 * How far apart two points are.
 *
 * One implementation, because there are now two callers that must agree: the
 * radius view filters a list in the browser, and the weekly digest picks a
 * subscriber's markets on a server. Two copies of a distance formula stay
 * correct until one of them is fixed.
 */

/** Great-circle distance in kilometres. Accurate to a few metres at this scale. */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * How far a card's distance pill reaches from the visitor's town. Beyond it the
 * card stays as it was: "670 km" on a Berlin page helps nobody in Zürich
 * (Delfim, 2026-09-26 — 100 was too much).
 */
export const DISTANCE_MAX_KM = 50;

/**
 * "0,7 km" in German, "0.7 km" in English — one decimal under a kilometre,
 * where rounding would print "1 km" for a two-minute walk; whole kilometres
 * above it. `tag` is a BCP 47 tag: localeTag() in a build, <html lang> in a
 * browser.
 */
export function kmLabel(km: number, tag: string): string {
  const n = km < 1 ? km : Math.round(km);
  return `${new Intl.NumberFormat(tag, { maximumFractionDigits: km < 1 ? 1 : 0 }).format(n)} km`;
}

/** The town a visitor picked, as TownSearch remembers it — coordinates since 2026-09-26. */
export interface PickedTown { slug?: string; name?: string; href?: string; lat?: number; lng?: number }

/**
 * The distances a subscription may be for.
 *
 * The same four the radius view offers, so a person who has used the one
 * recognises the other. Anything else posted to the endpoint is rounded to the
 * nearest of these rather than rejected — a number nobody can type wrong.
 */
export const RADII = [10, 25, 50, 100] as const;

/** What a signup gets when nobody chose: far enough to be worth reading. */
export const DEFAULT_RADIUS = 25;

/** The nearest offered radius to whatever arrived. */
export const nearestRadius = (km: number): number =>
  RADII.reduce((best, option) => (Math.abs(option - km) < Math.abs(best - km) ? option : best), RADII[0]);
