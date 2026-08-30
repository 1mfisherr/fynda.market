/**
 * One slug function, shared by every script that mints a URL.
 *
 * It lives here rather than in import-v1.mjs because that module runs its
 * import the moment it is loaded — importing it for one helper would re-run the
 * whole thing.
 */

/**
 * ASCII, transliterated the German way: zuerich, not zurich and not zürich.
 * guardrails.config.json forbids umlauts in URLs; ü -> u would collide Zürich
 * with a hypothetical Zurich and reads wrong to a German speaker.
 *
 * French and Italian take the plain accent-stripping the same code gives them:
 * Genève -> geneve, Basilea Città -> basilea-citta.
 */
export function slugify(value) {
  return value
    .normalize('NFC')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
