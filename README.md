# fynda.market

Every flea market in Switzerland and Germany, with dates that are checked. Live at [fynda.market](https://fynda.market).

Built and run with Claude Code. Start with [`CLAUDE.md`](CLAUDE.md) (how to work here), then [`docs/PLAN.md`](docs/PLAN.md) (what is true now) and [`docs/README.md`](docs/README.md) (the map).

```bash
npm install
npm run dev       # local site
npm run verify    # docs, types, tests, build, guardrails — before every push
npm run deploy    # build against the live database and upload; end of session only
```

The rule every build enforces (`scripts/guardrails.mjs`, `docs/ARCHITECTURE.md`):

> **A page exists because there is content for it — never because a URL pattern permits it.**

Astro (static) · Cloudflare Pages and Functions · Supabase / PostGIS · Resend. Why, in [`docs/STACK.md`](docs/STACK.md).
