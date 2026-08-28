// @ts-check
import { defineConfig } from 'astro/config';

// Static output only. See docs/STACK.md — the predecessor's stale-page and
// layout-shift bugs came from SSR caching layers that do not exist here.
export default defineConfig({
  site: 'https://fynda.market',
  output: 'static',
  trailingSlash: 'always',
  build: {
    // Emit /de/schweiz/zuerich/index.html rather than /de/schweiz/zuerich.html
    format: 'directory',
  },
  image: {
    // Astro emits explicit width/height, which CI check 5 enforces.
    responsiveStyles: true,
  },
  compressHTML: true,
});
