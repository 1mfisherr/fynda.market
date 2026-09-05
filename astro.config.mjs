// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { utilityPaths } from './src/lib/i18n.ts';

/**
 * Every page that carries `indexable={false}`, as a set of paths.
 *
 * Derived, never typed out. The hand-written version listed only the German
 * slugs, so `/fr/signaler/`, `/it/salvati/`, `/en/report/` and six more shipped
 * with a robots noindex tag AND an entry in the sitemap — the site asking
 * Google to index a page while telling it not to. It went unnoticed because
 * `newsletter` is spelled the same in all four languages, which made the list
 * look like it covered everything.
 *
 * A list that has to be "kept in step" by hand is a list that drifts. This one
 * is built from the same UTILITY map the pages are, so a new utility page or a
 * new locale cannot get it wrong. Guardrail 10 checks the result.
 */
const NOINDEX = new Set(utilityPaths());

// Static output only. See docs/STACK.md — the predecessor's stale-page and
// layout-shift bugs came from SSR caching layers that do not exist here.
export default defineConfig({
  site: 'https://fynda.market',
  output: 'static',
  trailingSlash: 'always',
  redirects: { '/': '/de/' },
  build: {
    // Emit /de/schweiz/zurich/index.html rather than /de/schweiz/zurich.html
    format: 'directory',
  },
  image: {
    // Astro emits explicit width/height, which CI check 5 enforces.
    responsiveStyles: true,
  },
  integrations: [
    sitemap({
      /**
       * The sitemap is a list of pages we are asking Google to index, so it
       * must agree with the pages themselves. Utility pages carry
       * `indexable={false}` and a robots noindex tag; a sitemap that still
       * listed them sends two contradictory signals about the same URL, which
       * is a quality problem rather than a technicality.
       *
       * NOINDEX is derived from src/lib/i18n.ts, so it cannot fall behind the
       * pages the way the hand-written list did.
       */
      filter: (page) => !NOINDEX.has(new URL(page).pathname),
    }),
  ],
  compressHTML: true,
});
