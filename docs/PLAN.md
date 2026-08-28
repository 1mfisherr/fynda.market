# Plan

Where the project stands, and the order things happen in. **Read this first in any new session.**

---

## Now

**Repo is live and the build pipeline works.** Astro skeleton, design tokens, six CI guardrails, GitHub Actions. `npm run verify` is green, and the guardrails have been tested against the two URL shapes that killed v1 — both are rejected and block deploy.

Brand direction settled (`BRAND.md`). Mockups in `/design`.

**The next real move is Phase 0** below — two decisions that change what gets built, and neither can be resolved by thinking harder. Phase 1 accounts (1.2–1.7) are still open and are Delfim's to create.

---

## What the playbook says

Four lessons from companies that solved this exact shape of problem. These drive the plan below.

**1 — The bottleneck is trust, not traffic.** Airbnb's revenue doubled in a month when the founders went door to door photographing listings themselves. Better photos were a trust signal, and no amount of traffic fixed what bad photos broke. Fynda's equivalent trust signal is **a date that is actually right**, and the unscalable act that produces it is talking to organisers one at a time.

**2 — Give the supply side a tool, then open the doors.** OpenTable did not start as a diner marketplace. It gave restaurants a booking system that solved their own admin pain, and only once restaurants were on it opened the platform to diners. Applied here: **organisers get something genuinely useful on day one**, and their data arrives as a by-product. This is the strongest available answer to the open question in `CLAUDE.md`.

**3 — One beachhead, to real density, before anything else.** Every new city is its own cold start. Companies that expand before a region is dense spread thin and never reach liquidity anywhere.

**4 — Listen faster than you commit.** GetYourGuide had five bookings in two years — three from the CEO's mother — and only moved when they pivoted from peer-to-peer to professional operators on market feedback. Intellectual honesty about what isn't working is the accelerant.

---

## Phase 0 — Two decisions. Nothing else starts until these move.

Both are answered by talking to people, not by more analysis.

| # | Decision | How it gets resolved |
|---|---|---|
| **0.1** | **Visitor directory, or organiser infrastructure with a directory on the front?** | Five organiser conversations. Offer three things — get your Google listing right, broadcast your cancellations, send you vendors — and see which lands. If none do, a pure visitor directory is the answer and that is fine. |
| **0.2** | **Which region gets depth first?** | Data says Zürich and Luzern. Pick one, commit to 50 km around it, and make every market in it correct. |

**Delfim's German is limited, so this is email and a short web form, not phone calls.** A three-question German email template is part of Phase 2 and needs writing before this starts.

Ten conversations. A week. Everything downstream is cheaper once they are done.

---

## Phase 1 — Set up the machine

Do these in order. All are one-off and small.

| # | Task | Notes |
|---|---|---|
| ~~1.1~~ | ~~**GitHub repo**~~ | **Done.** `github.com/1mfisherr/fynda.market` |
| 1.2 | **Register `fynda.market`** | Decided in `NAMING.md`. Only this one domain. |
| 1.3 | **Cloudflare account** | Workers + R2 + Pages. Per `STACK.md`. |
| 1.4 | **Supabase project** | Postgres + PostGIS. EU region. |
| 1.5 | **Resend account** | Newsletter sending. Free tier covers launch. |
| 1.6 | **Plausible account** | See the analytics decision below. |
| 1.7 | **Google Search Console** | Verify the domain the day it exists. The v1 data is the only real demand evidence we have; keep the pipeline running. |
| ~~1.8~~ | ~~**Astro skeleton + CI guardrails**~~ | **Done.** Six checks in `scripts/guardrails.mjs`, config in `guardrails.config.json`, CI in `.github/workflows/ci.yml`. Run `npm run verify` before any push. |

**Note on 1.8:** `guardrails.config.json` encodes architecture decisions, not preferences. Changing a threshold or adding an allowed route pattern means updating `ARCHITECTURE.md` in the same commit. A guardrail that gets loosened to make a build pass is a guardrail that no longer exists.

---

## Phase 2 — Brand, copy, content

Runs in parallel with Phase 1. Detail lives in `BRAND.md`.

| # | Task | Owner |
|---|---|---|
| 2.1 | Lock the accent colour | Delfim |
| 2.2 | Finish the wordmark and app mark | Claude, Delfim approves |
| 2.3 | Build the icon set — market types, states, actions | Claude |
| 2.4 | Tone of voice, written down with examples | Claude, Delfim approves |
| 2.5 | Core German copy — every label, empty state and error | Claude, **a native German speaker checks it** |
| 2.6 | The organiser email template | Claude |
| 2.7 | **Photograph two markets** | Delfim. This is the Airbnb move. Nothing substitutes for it. |
| 2.8 | Instagram account, set up narrowly (see below) | Delfim |

---

## Phase 3 — The data

| # | Task |
|---|---|
| 3.1 | Export everything from fleafind.ch before it goes away |
| 3.2 | Build the schema — geography tree, markets, occurrences, per-fact provenance ledger |
| 3.3 | Import and clean. Every market gets a source and a date |
| 3.4 | **Hand-verify the beachhead region.** Every market, every date, against the organiser or the city website |
| 3.5 | Everything outside the beachhead is marked "not verified recently" and shown honestly |

---

## Phase 4 — Build

Only after 0–3. Four page types from `ARCHITECTURE.md`, nothing more.

Home · market · city · region. Filters work from day one but are query parameters, not indexable URLs. Newsletter live from the first subscriber. Organiser surface real, even if v1 is a form and an email address.

---

## Decisions taken this session

| Question | Answer | Why |
|---|---|---|
| **Hosting** | **Cloudflare, not Vercel** | Already reasoned in `STACK.md`. Vercel would re-introduce the caching and rendering layers that caused v1's stale-page and layout-shift bugs. Do not churn on this. |
| **Analytics — self-hosted or not?** | **Plausible cloud, EU. ~€9/month.** | Self-hosting is a maintenance job Delfim cannot do. Plausible needs no cookie banner, which means no consent popup in front of the answer, and no deceptive-pattern exposure. Add Search Console. **Skip GA4** — it needs consent and gives us nothing Plausible doesn't. |
| **Newsletter from day one?** | **Yes** | The list is the only distribution channel no algorithm can take away. City-segmented from subscriber #1, content generated from our own database ("this weekend near you"), so it costs almost nothing to run. |
| **Instagram?** | **Yes, but narrowly** | It is the photo home, the organiser outreach channel, and local discovery. Not a growth engine. Two or three posts a week off the back of market visits. Do not let it become a job. |
| **Customer reviews?** | **No, not at launch** | Reviews need volume to be useful, carry a moderation burden, and Google already has them. Our differentiator is freshness, not opinion. Revisit once there is traffic. |
| **Accounts / login?** | **No** | Nothing at launch needs one. Saved markets live in the browser. |
| **Saved markets, calendar export (ICS)** | **Yes** | Cheap, no accounts needed, and a calendar entry is a bookmark no algorithm can remove. |
| **Map view** | **Yes, as a view — not the front door** | Search demand is time-led, not map-led. The map is the second tab, not the homepage. |
| **Mascot** | **Hold** | A mascot is a real commitment and risks undercutting "calm and easy". Nail the wordmark and icon system first, revisit when there is a brand to extend. Delfim's call. |

---

## Still open

- **The two Phase 0 decisions.** Everything downstream bends on them.
- **What lives at `/`?** `ARCHITECTURE.md` starts its URL table at `/de/`, which leaves the root undecided. Either `/` 301s to `/de/`, or `/` is home and the `/de/` prefix waits for a second locale. **Recommendation: `/` redirects to `/de/`** — URL shape is expensive to change later and the prefix is already in every other route. Cheap to settle now, annoying after launch. The guardrails permit both until it is decided.
- **Would vendors pay for anything?** Unconfirmed. Five vendor conversations settle it. Parked in `IDEAS.md`.
- **CH-wide launch, or beachhead-only launch?** `ARCHITECTURE.md` assumes ~230 pages covering Switzerland. The cold-start playbook says depth beats breadth. **Recommendation: publish CH-wide for SEO, but concentrate verification, photography and organiser contact in one region.** Breadth of pages, depth of truth. Not yet agreed.
- **What exactly organisers get on day one.** Shortlist: a listing page they control, help fixing their Google Business Profile, one-click cancellation broadcast, a printable QR poster. The cancellation broadcast is the strongest candidate — it is their worst moment and our best trust asset.

---

## Conventions worth not relearning

- `npm run verify` before every push. It is what CI runs.
- Guardrails that report `SKIP` are waiting on data, not passing. `data/README.md` says what they need.
- Colour, type, spacing and motion come from `src/styles/tokens.css`. Nothing is hardcoded in a component.
- German copy is not final until a native speaker has read it.

---

owner: Delfim
last_reviewed: 2026-08-28
