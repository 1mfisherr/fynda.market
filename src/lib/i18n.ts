/**
 * Locales, and the words the URLs are made of.
 *
 * Switzerland is published in German, French, Italian and English. Every other
 * country gets its own language plus English — English because it is the
 * language a visitor from anywhere falls back to, and because a Swiss market is
 * worth finding by someone who reads neither German nor French.
 *
 * The whole path is in the page's own language, including the country and the
 * segment words: `/it/svizzera/mercato/…`, never `/it/schweiz/markt/…`. Google's
 * URL guidance is explicit that the words should be in the audience's language,
 * and a half-translated path reads as a bug to the person it is aimed at.
 *
 * Place names and place slugs are NOT here — they are per-locale rows in the
 * database (`slugs`, `texts`), written by scripts/localise-places.mjs. This file
 * holds only what is true of a locale itself.
 */

export type Locale = 'de' | 'fr' | 'it' | 'en';

export const LOCALES: Locale[] = ['de', 'fr', 'it', 'en'];

/**
 * The locale a bare `/` goes to, and the hreflang x-default. German is the
 * largest Swiss language and where the traffic is today; it moves when the
 * footprint does, not before.
 */
export const DEFAULT_LOCALE: Locale = 'de';

export interface LocaleInfo {
  /** The BCP 47 tag for `<html lang>` and hreflang. */
  tag: string;
  /** How this language names itself, for the switcher. */
  label: string;
  /** The fixed URL segments, in this language. */
  segments: {
    market: string;
    region: string;
  };
}

export const LOCALE: Record<Locale, LocaleInfo> = {
  // de-CH, not de: the content is Swiss German usage (ss for ß, "Velo"), and
  // the German-for-Germany pages will be a different cluster member.
  de: { tag: 'de-CH', label: 'Deutsch', segments: { market: 'markt', region: 'kanton' } },
  fr: { tag: 'fr-CH', label: 'Français', segments: { market: 'marche', region: 'canton' } },
  it: { tag: 'it-CH', label: 'Italiano', segments: { market: 'mercato', region: 'cantone' } },
  en: { tag: 'en', label: 'English', segments: { market: 'market', region: 'canton' } },
};

export const isLocale = (value: string): value is Locale => (LOCALES as string[]).includes(value);

/* --------------------------------------------------------------------------
 * URL building
 *
 * Every internal link goes through these. A template that assembles a path by
 * hand is how `/it/frankreich/paris/` happens — the right words in the wrong
 * language, invisible until someone reads it.
 * ------------------------------------------------------------------------ */

export const homePath = (locale: Locale) => `/${locale}/`;

export const countryPath = (locale: Locale, country: string) => `/${locale}/${country}/`;

export const cityPath = (locale: Locale, country: string, city: string) =>
  `/${locale}/${country}/${city}/`;

export const regionPath = (locale: Locale, country: string, region: string) =>
  `/${locale}/${country}/${LOCALE[locale].segments.region}/${region}/`;

export const marketPath = (locale: Locale, slug: string) =>
  `/${locale}/${LOCALE[locale].segments.market}/${slug}/`;

/**
 * Utility pages — the forms and the legal text. The key is stable; the slug is
 * translated, because `/fr/melden/` is half-German nonsense to the person it is
 * for. These pages are noindex, so the only thing at stake is whether they read
 * correctly to a human.
 */
export const UTILITY = {
  report: { de: 'melden', fr: 'signaler', it: 'segnalare', en: 'report' },
  newsletter: { de: 'newsletter', fr: 'newsletter', it: 'newsletter', en: 'newsletter' },
  organiser: { de: 'veranstalter', fr: 'organisateurs', it: 'organizzatori', en: 'organisers' },
  saved: { de: 'gemerkt', fr: 'favoris', it: 'salvati', en: 'saved' },
  imprint: { de: 'impressum', fr: 'mentions-legales', it: 'note-legali', en: 'imprint' },
  privacy: { de: 'datenschutz', fr: 'confidentialite', it: 'privacy', en: 'privacy' },
  nearby: { de: 'umkreis', fr: 'a-proximite', it: 'nei-dintorni', en: 'nearby' },
} as const;

export type UtilityKey = keyof typeof UTILITY;

/**
 * Locales whose utility pages actually exist. The forms and the legal text are
 * written prose, not interface labels, so they appear in a language when
 * somebody has written them in it — not when the router could.
 *
 * Until then a French page's footer links to the German imprint, which is
 * honest and reachable. Linking to a French URL that 404s would not be.
 */
export const UTILITY_LOCALES: Locale[] = ['de'];

export const utilityPath = (locale: Locale, key: UtilityKey) => {
  const served = UTILITY_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  return `/${served}/${UTILITY[key][served]}/`;
};

/** Every locale that actually has this utility page, for hreflang. */
export const utilityAlternates = (key: UtilityKey) =>
  UTILITY_LOCALES.map((locale) => ({ locale, path: utilityPath(locale, key) }));
