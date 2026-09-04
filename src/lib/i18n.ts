/**
 * Locales, and the words the URLs are made of.
 *
 * Switzerland is published in German, French, Italian and English. Every other
 * country gets its own language plus English — English because it is the
 * language a visitor from anywhere falls back to, and because a Swiss market is
 * worth finding by someone who reads neither German nor French.
 *
 * Every WORD in the path is in the page's own language — the country and the
 * segment words: `/it/svizzera/mercato/…`, never `/it/schweiz/markt/…`. A
 * half-translated path reads as a bug to the person it is aimed at.
 *
 * Every NAME in the path is not. A city, a canton and a market carry ONE slug
 * across all four languages: `/de/schweiz/zurich/` and `/it/svizzera/zurich/`,
 * while the Italian page reads "Zurigo" throughout. A place name is a proper
 * noun, and an address that moves when a translation is corrected is an address
 * that breaks. Google reads language from hreflang, never from the path, so the
 * translated name bought nothing and cost every link. See the slug_ledger
 * migration.
 *
 * Names and slugs are therefore NOT here — they are rows in the database
 * (`slugs`, `texts`), written by scripts/localise-places.mjs. This file holds
 * only what is true of a locale itself.
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

/** Everything before the slug. The saved page matches links against it. */
export const marketPrefix = (locale: Locale) => `/${locale}/${LOCALE[locale].segments.market}/`;

export const marketPath = (locale: Locale, slug: string) => `${marketPrefix(locale)}${slug}/`;

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
 * The radius view. It sits at `/umkreis/` with no locale prefix, because it is
 * a filter over everything rather than a place, and only one of them is built —
 * see guardrails.config.json, route "radius". UTILITY.nearby holds the slugs the
 * other three will use; until those pages exist, everything points here.
 */
export const nearbyPath = () => `/${UTILITY.nearby[DEFAULT_LOCALE]}/`;

/**
 * Which locales each utility page exists in — per page, not per locale, because
 * they are not all the same kind of writing.
 *
 * The four product pages are ours to write, and they are written. Leaving them
 * German-only meant every French visitor who touched "Enregistré", a CTA or a
 * report button was thrown back into German, which reads as a broken language
 * switcher rather than as a missing page.
 *
 * The imprint and the privacy policy are legal documents. The German ones still
 * carry unfilled placeholders, and a machine-translated privacy policy is the
 * one kind of prose this project must not ship (docs/PLAN.md). They stay German
 * until a person writes them, and a French page links to the German one, which
 * is honest and reachable. Linking to a French URL that 404s would not be.
 */
export const UTILITY_LOCALES: Record<UtilityKey, Locale[]> = {
  report: LOCALES,
  newsletter: LOCALES,
  organiser: LOCALES,
  saved: LOCALES,
  imprint: [DEFAULT_LOCALE],
  privacy: [DEFAULT_LOCALE],
  nearby: [DEFAULT_LOCALE],
};

export const utilityPath = (locale: Locale, key: UtilityKey) => {
  const served = UTILITY_LOCALES[key].includes(locale) ? locale : DEFAULT_LOCALE;
  return `/${served}/${UTILITY[key][served]}/`;
};

/** Every locale that actually has this utility page, for hreflang. */
export const utilityAlternates = (key: UtilityKey) =>
  UTILITY_LOCALES[key].map((locale) => ({ locale, path: utilityPath(locale, key) }));

/**
 * Every utility page, in every locale it is served in.
 *
 * It lives here rather than in astro.config.mjs because this file is the only
 * place a URL is assembled — and because `Object.keys` returns `string[]`,
 * which throws away the UtilityKey union the moment the config tries to do it
 * itself. In TypeScript the narrowing is one cast; in a `// @ts-check`ed .mjs
 * it was three type errors.
 */
export const utilityPaths = () =>
  (Object.keys(UTILITY) as UtilityKey[]).flatMap((key) =>
    UTILITY_LOCALES[key].map((locale) => utilityPath(locale, key))
  );
