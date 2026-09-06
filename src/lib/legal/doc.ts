/**
 * The shape of a legal document.
 *
 * Legal pages are prose with headings and lists and nothing else — no forms,
 * no data, no interaction. Holding them as data rather than as sixteen .astro
 * files means one template renders all of them and a new locale is a new key,
 * not a new file to keep in step.
 */

export interface LegalBlock {
  /** The h2. Omitted for an unheaded run of paragraphs. */
  h?: string;
  /** Paragraphs under the heading. */
  p?: string[];
  /** A bullet list, rendered after the paragraphs. */
  ul?: string[];
}

export interface LegalDoc {
  /** <title>. */
  title: string;
  /** Meta description. */
  description: string;
  /** The h1. */
  heading: string;
  /** "Effective from 6 September 2026", where a document has one. */
  effective?: string;
  /** Paragraphs before the first heading. */
  lede?: string[];
  blocks: LegalBlock[];
}
