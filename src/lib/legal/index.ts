/**
 * The four documents that say who runs Fynda and on what terms: about,
 * imprint, privacy, terms.
 *
 * Delfim wrote all four in English for fleafind.ch. They are his text, not a
 * template: the voice, the ordering and the promises are his. What changed on
 * the way over is the set of facts — the name, the domain, the operator's
 * address, and every sentence in the privacy policy that described fleafind's
 * stack rather than Fynda's. See privacy.ts for what that meant.
 *
 * They ship in all four locales. docs/PLAN.md used to hold them German-only
 * with the reason "a machine-translated privacy policy is the one prose this
 * project must not ship", which was protecting against a template nobody had
 * read. That is no longer the situation: there is a human-written English
 * original behind every translation. A French visitor thrown into German legal
 * text is the worse outcome.
 */
import type { Locale } from '../i18n';
import type { LegalDoc } from './doc';
import { ABOUT } from './about';
import { IMPRINT } from './imprint';
import { PRIVACY } from './privacy';
import { TERMS } from './terms';

export type { LegalBlock, LegalDoc } from './doc';

export const LEGAL = {
  about: ABOUT,
  imprint: IMPRINT,
  privacy: PRIVACY,
  terms: TERMS,
} as const satisfies Record<string, Record<Locale, LegalDoc>>;

export type LegalKey = keyof typeof LEGAL;

export const LEGAL_KEYS = Object.keys(LEGAL) as LegalKey[];
