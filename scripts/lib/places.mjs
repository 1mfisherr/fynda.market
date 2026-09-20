/**
 * Names and slugs of the places Switzerland is published under — the country,
 * the cantons and the towns. Read by scripts/localise-places.mjs (which writes
 * them for every place in the database) and scripts/import-v1-additions.mjs
 * (which writes them for a place the moment it is created, so a town never
 * publishes under a slug it then has to retire).
 *
 * The rules that shaped these tables are in localise-places.mjs, at the top.
 */

import { slugify } from '../slugify.mjs';

/** The locales Switzerland is published in. */
export const LOCALES = ['de', 'fr', 'it', 'en'];

/**
 * The country segment, per locale — the one part of the path that is still
 * translated. A fixed hand-written set of about fifty entries that never grows
 * with the data, which is why it does not carry the cost that per-locale city
 * slugs did.
 */
export const COUNTRY = {
  de: 'Schweiz',
  fr: 'Suisse',
  it: 'Svizzera',
  en: 'Switzerland',
};

/** Canton names, per locale. Keyed by the German name in the database. */
export const CANTONS = {
  'Aargau': { fr: 'Argovie', it: 'Argovia', en: 'Aargau' },
  'Basel-Landschaft': { fr: 'Bâle-Campagne', it: 'Basilea Campagna', en: 'Basel-Landschaft' },
  'Basel-Stadt': { fr: 'Bâle-Ville', it: 'Basilea Città', en: 'Basel-Stadt' },
  'Bern': { fr: 'Berne', it: 'Berna', en: 'Bern' },
  'Freiburg': { fr: 'Fribourg', it: 'Friburgo', en: 'Fribourg' },
  'Genf': { fr: 'Genève', it: 'Ginevra', en: 'Geneva' },
  'Glarus': { fr: 'Glaris', it: 'Glarona', en: 'Glarus' },
  'Graubünden': { fr: 'Grisons', it: 'Grigioni', en: 'Grisons' },
  'Jura': { fr: 'Jura', it: 'Giura', en: 'Jura' },
  'Luzern': { fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
  'Neuenburg': { fr: 'Neuchâtel', it: 'Neuchâtel', en: 'Neuchâtel' },
  'Obwalden': { fr: 'Obwald', it: 'Obvaldo', en: 'Obwalden' },
  'Schaffhausen': { fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
  'Schwyz': { fr: 'Schwytz', it: 'Svitto', en: 'Schwyz' },
  'Solothurn': { fr: 'Soleure', it: 'Soletta', en: 'Solothurn' },
  'St. Gallen': { fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
  'Tessin': { fr: 'Tessin', it: 'Ticino', en: 'Ticino' },
  'Thurgau': { fr: 'Thurgovie', it: 'Turgovia', en: 'Thurgau' },
  'Uri': { fr: 'Uri', it: 'Uri', en: 'Uri' },
  'Waadt': { fr: 'Vaud', it: 'Vaud', en: 'Vaud' },
  'Wallis': { fr: 'Valais', it: 'Vallese', en: 'Valais' },
  'Zug': { fr: 'Zoug', it: 'Zugo', en: 'Zug' },
  'Zürich': { fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
};

/** City names, per locale. Everything not listed keeps one name in all four. */
export const CITIES = {
  'Basel': { fr: 'Bâle', it: 'Basilea', en: 'Basel' },
  'Bern': { fr: 'Berne', it: 'Berna', en: 'Bern' },
  'Biel/Bienne': { fr: 'Bienne', it: 'Bienne', en: 'Biel/Bienne' },
  'Chur': { fr: 'Coire', it: 'Coira', en: 'Chur' },
  'Freiburg': { fr: 'Fribourg', it: 'Friburgo', en: 'Fribourg' },
  'Genf': { fr: 'Genève', it: 'Ginevra', en: 'Geneva' },
  'Luzern': { fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
  'Schaffhausen': { fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
  'St. Gallen': { fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
  'Thun': { fr: 'Thoune', it: 'Thun', en: 'Thun' },
  'Zürich': { fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
};

/**
 * The name the single slug is built from, where the German name in the database
 * is the wrong one to build it from. Two kinds of entry, for two reasons.
 *
 * ENDONYMS. Genève, Fribourg, Ticino and Vaud are French- and Italian-speaking
 * places that German sources name differently, and the import wrote the German
 * exonym. The place's own name wins. Bern, Graubünden and Basel-Landschaft are
 * officially multilingual too, but their majority language is German, so the
 * German name is already the endonym. The tiebreaker, written down so it does
 * not get re-decided per town: the name the commune itself registers, and where
 * that is itself dual (Biel/Bienne), the majority language.
 *
 * INTERNATIONAL FORMS. Zürich is `zurich`, not `zuerich`. It is the one Swiss
 * place with a settled accent-free form that the whole world already uses —
 * Booking, Airbnb, Tripadvisor and Google Maps all spell it that way — and this
 * slug is now shared by the French, Italian and English pages as well. That is
 * not true of Bülach or Dübendorf, whose own town councils write buelach.ch and
 * duebendorf.ch; they keep the German transliteration. An exception list of one
 * is the right size for "famous enough to have an international spelling".
 */
export const SLUG_FROM = {
  region: {
    'Genf': 'Genève', 'Freiburg': 'Fribourg', 'Tessin': 'Ticino', 'Waadt': 'Vaud',
    'Neuenburg': 'Neuchâtel', 'Wallis': 'Valais',
    'Zürich': 'Zurich',
  },
  city: { 'Genf': 'Genève', 'Freiburg': 'Fribourg', 'Zürich': 'Zurich', 'Biel/Bienne': 'Biel' },
};

/** The one slug a canton carries in every locale. */
export const regionSlug = (deName) => slugify(SLUG_FROM.region[deName] ?? deName);
/** The one slug a town carries in every locale. */
export const citySlug = (deName) => slugify(SLUG_FROM.city[deName] ?? deName);
/** A canton's name in a locale; the German name in the database stands for all where no exonym exists. */
export const regionName = (deName, locale) => CANTONS[deName]?.[locale] ?? deName;
/** A town's name in a locale. */
export const cityName = (deName, locale) => CITIES[deName]?.[locale] ?? deName;
