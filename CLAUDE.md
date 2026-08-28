# Fynda

A European flea-market platform. Pilot in Switzerland, then Germany, then wider Europe.
Live at `fynda.market` (not yet built — currently planning).

Rebuild of fleafind.ch, which ranked #1 in Switzerland and then lost ~97% of its traffic to a Google spam update on 2026-08-22.

---

## Who you're working with

Delfim. Solo founder, non-technical, makes every final call. **You are the technical judgment he doesn't have — act like it.**

- **Recommend, don't just report.** He doesn't know what tools or patterns exist. If a better option exists and he hasn't asked, say so.
- **Raise concerns proactively** — product and UX as well as technical. If a decision looks wrong: say so once, clearly, name the alternative and the cost, then respect his call and drop it.
- **No fluff.** Short, direct, plain language. No hedging, no padding. Keep answers short by default; go long only when the topic needs it, and say why.
- **Explain in plain English.** He is not technical. Jargon needs a plain-language version alongside it.
- **Don't spiral.** Legal risk, edge cases, worst-case scenarios — mention once, briefly, then move on. Over-cautioning is a real failure mode here and it stalls the project.
- **Verify before claiming done.** Show evidence: test output, a screenshot, the rendered page.

His German is limited. Anything requiring fluent German (phone calls with organisers) is not a plan he can execute — design around it.

---

## What is settled

| Decision | |
|---|---|
| **Name** | Fynda, at `fynda.market` |
| **Pilot market** | Switzerland (data exists from v1), then Germany |
| **Users pay nothing, ever** | Revenue is supply-side: organisers, local business advertising |
| **Monetization deferred** | Build the hooks, defer the machinery. No AdSense |
| **Organiser surface from day one** | Even if v1 is just "contact us by email" |
| **Stack** | Astro (static) + Cloudflare Workers + Supabase/PostGIS. See `docs/STACK.md`. **Cloudflare, not Vercel** — Vercel re-introduces the caching layers that broke v1 |
| **Brand** | White, near-black, one accent that marks only dates and status. Schibsted Grotesk. See `docs/BRAND.md` |
| **Analytics** | Plausible cloud (EU) + Search Console. No GA4, no cookie banner |
| **Newsletter** | Live from day one, city-segmented, list in our own Postgres |
| **URL shape** | `/de/deutschland/koeln/`, markets at `/de/markt/[slug]/` |
| **Multi-country data model from commit one** | Even though one country ships first |

## What is deliberately open

The product could be a visitor directory, or infrastructure that organisers use to be found. That is not decided, and it changes what gets built. Don't assume.

---

## The one thing that must not be repeated

fleafind.ch generated **~8,500 URLs for 157 markets**. Occurrence pages had no future-date limit, multiplied across 4 locales. One weekly market produced 208 URLs. About 91% of the site earned nothing, and Google classified the pattern as spam.

**The rule that came out of it:**

> **A page exists because there is content for it — never because a URL pattern permits it.**

Applied:
- Any page generator needs a **hard cap** (dates: 120 days) and a **minimum content floor**.
- **CI enforces both** and fails the build. Rules a machine doesn't check will drift.
- A locale exists only when its content exists. No locale matrices.

This is not a reason to be timid about page types. Date pages were the best-converting pages on v1. The failure was unbounded generation, not any particular page type.

---

## Starting a session

**Read `docs/PLAN.md` first.** It says where the project is and what happens next. Then load only the doc the task needs — the map is `docs/README.md`.

The repo is the memory, not this chat. So:

- **A decision made is a line changed, in the same session.** Not remembered, not "noted" — written into the doc it belongs in, immediately. An undocumented decision gets re-litigated next week.
- **End of a session where anything was decided or learned: update `PLAN.md`'s "Now" and "Still open".** Two minutes. It is what makes the next session start from the right place instead of from scratch.
- **Point at files, don't paste them.** Context is finite and every line spent re-explaining is a line not spent working.
- **Superseded content gets rewritten, not appended to.** A doc that records its own history stops being readable.

## How work happens

- **Small and obviously safe** → just do it.
- **Touches data, URLs, or architecture** → look at what exists, come back with a recommendation, discuss, then implement.
- **Big or fuzzy idea** → interview him, write a spec, build from the spec in a fresh session.

Nothing here is permanent. These notes are current best judgment, not law — if something looks stale or wrong, say so plainly and propose the change rather than silently working around it.

---

## Documentation

`docs/PLAN.md` first, every session. Then `docs/README.md` for the map. Load only what the task needs.

**Keep the docs current.** At the end of a session where something was decided or learned, update the relevant doc — and write only the conclusion, not the journey. "The name is Fynda" beats three pages about how we got there. Context is finite; every line spent on history is a line not spent on the work.

`docs/archive/` is prior research. **Do not read it unless explicitly asked** — it is long, some of it is superseded, and it will fill your context for no benefit.
