/**
 * Names and slugs of the places Germany is published under. Same shape as
 * places.mjs (Switzerland), two locales: the country's own and English.
 *
 * Slugs follow the rule in places.mjs: the German transliteration, the way the
 * town writes itself (muenchen.de, koeln.de, nuernberg.de). Zürich's
 * international form was an exception of one and stays one — a Munich visitor
 * on /de/ expects `muenchen`, and one slug serves both locales.
 */

import { slugify } from '../slugify.mjs';

export const LOCALES = ['de', 'en'];

export const COUNTRY = { de: 'Deutschland', en: 'Germany' };

/** Bundesländer by ISO 3166-2 code. German name in the database, English beside it. */
export const REGIONS = {
  BW: { de: 'Baden-Württemberg', en: 'Baden-Württemberg' },
  BY: { de: 'Bayern', en: 'Bavaria' },
  BE: { de: 'Berlin', en: 'Berlin' },
  BB: { de: 'Brandenburg', en: 'Brandenburg' },
  HB: { de: 'Bremen', en: 'Bremen' },
  HH: { de: 'Hamburg', en: 'Hamburg' },
  HE: { de: 'Hessen', en: 'Hesse' },
  MV: { de: 'Mecklenburg-Vorpommern', en: 'Mecklenburg-Vorpommern' },
  NI: { de: 'Niedersachsen', en: 'Lower Saxony' },
  NW: { de: 'Nordrhein-Westfalen', en: 'North Rhine-Westphalia' },
  RP: { de: 'Rheinland-Pfalz', en: 'Rhineland-Palatinate' },
  SL: { de: 'Saarland', en: 'Saarland' },
  SN: { de: 'Sachsen', en: 'Saxony' },
  ST: { de: 'Sachsen-Anhalt', en: 'Saxony-Anhalt' },
  SH: { de: 'Schleswig-Holstein', en: 'Schleswig-Holstein' },
  TH: { de: 'Thüringen', en: 'Thuringia' },
};

/** German name → code. */
export const REGION_CODE = Object.fromEntries(Object.entries(REGIONS).map(([code, n]) => [n.de, code]));

/** City names with a settled English form. Everything else keeps one name in both. */
export const CITIES = {
  'München': { en: 'Munich' },
  'Köln': { en: 'Cologne' },
  'Nürnberg': { en: 'Nuremberg' },
  'Hannover': { en: 'Hanover' },
  'Braunschweig': { en: 'Brunswick' },
};

export const regionSlug = (code) => slugify(REGIONS[code].de);
export const regionName = (code, locale) => REGIONS[code][locale] ?? REGIONS[code].de;
export const citySlug = (deName) => slugify(deName);
export const cityName = (deName, locale) => CITIES[deName]?.[locale] ?? deName;
