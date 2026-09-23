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
 * The locale a bare `/` goes to. German is the largest Swiss language and
 * where the traffic is today; it moves when the footprint does, not before.
 * (The hreflang x-default is English — layouts/Base.astro.)
 */
export const DEFAULT_LOCALE: Locale = 'de';

export interface LocaleInfo {
  /** How this language names itself, for the switcher. */
  label: string;
  /** The market segment, in this language. The same word in every country. */
  segments: {
    market: string;
  };
}

export const LOCALE: Record<Locale, LocaleInfo> = {
  de: { label: 'Deutsch', segments: { market: 'markt' } },
  fr: { label: 'Français', segments: { market: 'marche' } },
  it: { label: 'Italiano', segments: { market: 'mercato' } },
  en: { label: 'English', segments: { market: 'market' } },
};

/* --------------------------------------------------------------------------
 * Countries
 *
 * A locale alone stopped being enough the day Germany arrived: `/de/` serves
 * Zürich and München, and the two are not the same German. Three things
 * therefore hang off the country rather than the locale.
 *
 * WHICH LOCALES IT IS PUBLISHED IN. Switzerland has four; every other country
 * has its own plus English (CLAUDE.md). Nothing here enforces it — the build
 * joins slugs and names in the page's locale, so a country simply has no pages
 * in a locale nobody wrote. This list is what the rest of the code reads when
 * it needs to know without asking the database.
 *
 * THE REGION WORD IN THE PATH. `kanton` in Switzerland, `bundesland` in
 * Germany — a level of the tree, named as that country names it, in the page's
 * own language. `/de/deutschland/kanton/bayern/` would be nonsense.
 *
 * THE HREFLANG TAG. The Zürich page and the München page are both German and
 * both ours, and Google has no other way to tell a Swiss reader's page from a
 * German reader's. de-CH and de-DE say it. English stays plain `en`: the two
 * English pages are about different places, never alternates of each other, so
 * there is nothing for a region to disambiguate.
 * ------------------------------------------------------------------------ */

export type CountryCode = 'CH' | 'DE';

export interface CountryInfo {
  locales: Locale[];
  /** The country's name, per locale. The same fixed set as scripts/lib/places*.mjs. */
  name: Partial<Record<Locale, string>>;
  /** The region segment of the path, per locale. */
  region: Partial<Record<Locale, string>>;
  /** The BCP 47 tag for `<html lang>` and hreflang, per locale. */
  tag: Partial<Record<Locale, string>>;
  /** ISO 4217. An entry fee is printed and marked up in it. */
  currency: string;
  /**
   * Regions that are one city — Berlin, Hamburg, Bremen. Their region page
   * would repeat the town page word for word and compete with it for the same
   * query, so it is not built; every link to it goes to the town instead, and
   * the address it was published at 301s there (scripts/redirects.mjs).
   */
  cityStates: string[];
}

export const COUNTRY: Record<CountryCode, CountryInfo> = {
  CH: {
    locales: ['de', 'fr', 'it', 'en'],
    name: { de: 'Schweiz', fr: 'Suisse', it: 'Svizzera', en: 'Switzerland' },
    region: { de: 'kanton', fr: 'canton', it: 'cantone', en: 'canton' },
    tag: { de: 'de-CH', fr: 'fr-CH', it: 'it-CH', en: 'en' },
    currency: 'CHF',
    cityStates: [],
  },
  DE: {
    locales: ['de', 'en'],
    name: { de: 'Deutschland', en: 'Germany' },
    region: { de: 'bundesland', en: 'state' },
    tag: { de: 'de-DE', en: 'en' },
    currency: 'EUR',
    // Bremen the Land also holds Bremerhaven; the day a Bremerhaven market
    // arrives, Bremen leaves this list and gets its region page back.
    cityStates: ['berlin', 'hamburg', 'bremen'],
  },
};

/** Every region word any country uses, for the guardrails and the route shape. */
export const REGION_SEGMENTS = [
  ...new Set(Object.values(COUNTRY).flatMap((c) => Object.values(c.region))),
];

/** True where the region is one city and its page would be the town's twin. */
export const isCityState = (country: CountryCode, regionSlug: string) =>
  COUNTRY[country].cityStates.includes(regionSlug);

/** "4 CHF", "4 EUR" — the currency is the country's, never assumed. */
export const formatFee = (amount: number, country: CountryCode) => `${amount} ${COUNTRY[country].currency}`;

/** The country's name in this locale. */
export const countryName = (locale: Locale, country: CountryCode) =>
  COUNTRY[country].name[locale] ?? COUNTRY[country].name.en ?? country;

/** The region word for this page. Falls back to English, never to a guess. */
export const regionSegment = (locale: Locale, country: CountryCode) =>
  COUNTRY[country].region[locale] ?? COUNTRY[country].region.en ?? 'region';

/** The tag `<html lang>` and hreflang carry. Country-neutral pages pass none. */
export const localeTag = (locale: Locale, country?: CountryCode) =>
  (country && COUNTRY[country].tag[locale]) ?? DEFAULT_TAG[locale];

/** What a page with no country says — the home page, the forms, the legal text. */
const DEFAULT_TAG: Record<Locale, string> = { de: 'de', fr: 'fr', it: 'it', en: 'en' };

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

export const regionPath = (locale: Locale, code: CountryCode, country: string, region: string) =>
  `/${locale}/${country}/${regionSegment(locale, code)}/${region}/`;

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
  terms: { de: 'nutzungsbedingungen', fr: 'conditions-generales', it: 'condizioni-generali', en: 'terms' },
  about: { de: 'ueber-uns', fr: 'a-propos', it: 'chi-siamo', en: 'about' },
  nearby: { de: 'umkreis', fr: 'a-proximite', it: 'nei-dintorni', en: 'nearby' },
} as const;

export type UtilityKey = keyof typeof UTILITY;



/**
 * Which locales each utility page exists in — per page, not per locale, because
 * they are not all the same kind of writing.
 *
 * The four product pages are ours to write, and they are written. Leaving them
 * German-only meant every French visitor who touched "Enregistré", a CTA or a
 * report button was thrown back into German, which reads as a broken language
 * switcher rather than as a missing page.
 *
 * The four legal documents used to be German-only, on the grounds that a
 * machine-translated privacy policy is the one kind of prose this project must
 * not ship. That rule was protecting against a template nobody had read. What
 * exists now is a human-written English original — Delfim's own text from
 * fleafind.ch — so the four ship in every locale (src/lib/legal/). A French
 * visitor dropped into German legal text is the worse outcome.
 */
export const UTILITY_LOCALES: Record<UtilityKey, Locale[]> = {
  report: LOCALES,
  newsletter: LOCALES,
  organiser: LOCALES,
  saved: LOCALES,
  imprint: LOCALES,
  privacy: LOCALES,
  terms: LOCALES,
  about: LOCALES,
  nearby: LOCALES,
};

export const utilityPath = (locale: Locale, key: UtilityKey) => {
  const served = UTILITY_LOCALES[key].includes(locale) ? locale : DEFAULT_LOCALE;
  return `/${served}/${UTILITY[key][served]}/`;
};

/**
 * The radius view — `/de/umkreis/`, `/fr/a-proximite/`, one per locale, like
 * every other page on the site. It used to be a single unprefixed `/umkreis/`,
 * which meant a French visitor pressing "À proximité" landed in German; the
 * copy lived in the template, so the page could not follow the visitor's
 * language until it moved into lib/strings.ts. See guardrails.config.json,
 * route "radius".
 */
export const nearbyPath = (locale: Locale) => utilityPath(locale, 'nearby');

/** Every locale that actually has this utility page, for hreflang. */
export const utilityAlternates = (key: UtilityKey) =>
  UTILITY_LOCALES[key].map((locale) => ({ locale, path: utilityPath(locale, key) }));

/**
 * The utility pages we DO ask Google for.
 *
 * Almost none of them: a form, a saved list and a filter view are pages for a
 * person who is already here, and a legal document competes for no query. The
 * exception is About, which is the one page that says a person is behind this
 * site — the signal a directory recovering from a spam classification most
 * needs to be able to show. It costs four URLs.
 */
export const INDEXED_UTILITY: UtilityKey[] = ['about'];

/**
 * Every utility page that carries a robots noindex, in every locale it is
 * served in. astro.config.mjs subtracts exactly this from the sitemap.
 *
 * It lives here rather than in astro.config.mjs because this file is the only
 * place a URL is assembled — and because `Object.keys` returns `string[]`,
 * which throws away the UtilityKey union the moment the config tries to do it
 * itself. In TypeScript the narrowing is one cast; in a `// @ts-check`ed .mjs
 * it was three type errors.
 */
export const noindexPaths = () => [
  ...(Object.keys(UTILITY) as UtilityKey[])
    .filter((key) => !INDEXED_UTILITY.includes(key))
    .flatMap((key) => UTILITY_LOCALES[key].map((locale) => utilityPath(locale, key))),
  // The per-locale 404 pages. Astro builds them at /{locale}/404/ before
  // postbuild moves them to where Cloudflare looks; the sitemap is written in
  // between, and shipped four noindex pages to Google for two weeks
  // (2026-09-18) because the guardrail never saw the moved files.
  ...LOCALES.map((locale) => `/${locale}/404/`),
];
