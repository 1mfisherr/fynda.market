// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

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
       * listed them would be sending two contradictory signals about the same
       * URL, which is a quality problem, not a technicality.
       *
       * Keep this list in step with the "utility" and "radius" route patterns
       * in guardrails.config.json.
       */
      filter: (page) =>
        !/\/(melden|newsletter|veranstalter|gemerkt|impressum|datenschutz|umkreis)\/$/.test(page),
    }),
  ],
  compressHTML: true,
});
