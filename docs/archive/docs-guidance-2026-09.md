# How to keep docs for coding agents — Anthropic and OpenAI, researched 2026-09-16

Two reports, one per company, with their sources. The rules distilled from them are in `../README.md` §Keeping these current; this file is the evidence, not loaded by any session.

---

# Anthropic's guidance on in-repo docs for Claude Code

Researched 2026-09-16. The 2025 engineering post "Claude Code: Best practices for agentic coding" now redirects (308) to the official docs, so the docs are the current source. Sources cited by key; URLs at the end.

## 1. Concrete rules Anthropic states

| Rule | Source |
|---|---|
| CLAUDE.md is **context, not enforcement**. It arrives as a user message after the system prompt; compliance is best-effort. Anything that must hold every time is a hook or a permission rule. | MEM, FEAT |
| **Under 200 lines per CLAUDE.md.** "Longer files consume more context and reduce adherence." | MEM, FEAT, CTX |
| Per-line test: *"Would removing this cause Claude to make mistakes?"* If not, cut it. "Bloated CLAUDE.md files cause Claude to ignore your actual instructions!" | BP |
| Be **specific enough to verify**: "Run `npm test` before committing", not "Test your changes". | MEM |
| **No contradictions** — "Claude may pick one arbitrarily." Review root file, nested files and `.claude/rules/` periodically. | MEM |
| Add a line when Claude makes the same mistake twice, a review catches something it should have known, or you re-type last session's correction. | MEM, FEAT |
| A multi-step procedure, or anything only one part of the codebase needs, does **not** belong in CLAUDE.md: skill or path-scoped rule. | MEM, SK |
| Emphasis (`IMPORTANT`) on **one** line that keeps being skipped. "If you emphasize many lines, none of them stands out." | BP |
| Treat CLAUDE.md like code: review when things go wrong, prune regularly, test a change by watching behaviour. | BP |
| `/context` shows what loaded; `/doctor` proposes trims (cuts what is derivable from code, keeps pitfalls and rationale). | MEM, BP |
| `@path` imports load at launch, max four hops; they organise but "don't reduce context". Backticks keep `@x` literal. | MEM |
| Root CLAUDE.md, unscoped rules, auto memory and the plan-mode file are **re-injected after compaction**; path-scoped rules and nested CLAUDE.md are not. | CTX |
| Skills: `SKILL.md` under 500 lines, detail in supporting files; body loads only on use; post-compaction truncation keeps the top. | SK, CTX |
| Prompt "altitude": neither brittle hard-coded logic nor vague guidance. Aim for "the smallest possible set of high-signal tokens" — and "minimal does not necessarily mean short". A few canonical examples beat an exhaustive rule list. | CE |
| Say **why**: motivation behind an instruction improves targeting. Newer models over-trigger on shouting; "Use this tool when..." beats "CRITICAL: You MUST". | PE |
| Write for "a brilliant but new employee who lacks context on your norms" — make tribal knowledge explicit. | PE, TOOLS |

## 2. Recommended structure and length

**CLAUDE.md** (root, committed, < 200 lines). The June 2026 blog: think of it "as an index pointing to other files where Claude can find more information as needed" (STEER). Listed contents: commands Claude can't guess, style rules that differ from defaults, repository etiquette, project-specific architectural decisions, environment quirks, gotchas (BP). Headers and bullets — "Claude scans structure the same way readers do" (MEM). No mandated format.

**Companion docs.** Anthropic prescribes no `docs/` layout. What it does say:

- Keep long reference out of always-loaded files and point to it: "CLAUDE.md says 'follow our API conventions', a skill contains the full guide" (FEAT).
- Just-in-time beats pre-loading: keep "lightweight identifiers (file paths ...)" and fetch on demand (CE).
- Progressive disclosure inside a skill: overview in `SKILL.md`, then `reference.md`, `examples.md`, scripts (SK).
- Working state (plan, progress notes, spec) lives in files outside the window — `NOTES.md`, a todo, a `SPEC.md` from an interview, then a fresh session to build (CE, BP). Git holds history; current models "perform especially well in using git to track state across multiple sessions" (PE).
- HTML comments in CLAUDE.md are stripped before injection: free maintainer notes (MEM).

**Keeping it current** (LARGE, FEAT): review CLAUDE.md edits like any doc change; revisit after model releases because old workarounds become overhead; "a repeated mistake or a recurring review comment is a CLAUDE.md edit, not a one-off correction in chat"; optionally a `Stop` hook that reads the transcript and proposes edits.

## 3. What to keep out

From the docs' exclude column (BP) and the June blog (STEER):

- Anything derivable from the code: directory layouts, dependency lists, file-by-file descriptions, architecture overviews.
- Standard language conventions; "write clean code" platitudes.
- Detailed API docs — link instead. Information that changes often. Long explanations or tutorials.
- "Every time X, do Y" → hook. "Never do this" → permission deny or `PreToolUse` hook. "An instruction ... is a request, not a guarantee" (FEAT).
- Procedures and playbooks → skills. Single-directory concerns → path-scoped rule.

## 4. Mechanisms and when to use each

| Mechanism | Loads | Use for |
|---|---|---|
| `CLAUDE.md` | Every session; survives compaction | "Always do X", commands, decisions, gotchas |
| `CLAUDE.local.md` (gitignored) | Every session | Personal URLs, test data |
| `~/.claude/CLAUDE.md`, `~/.claude/rules/` | All projects | Personal preferences |
| `@path` import | At launch, ≤ 4 hops | Sharing `@AGENTS.md`; splitting a file without changing its cost |
| `.claude/rules/*.md`, no frontmatter | Every session, same priority as CLAUDE.md | Topic files when the root grows |
| `.claude/rules/*.md` with `paths:` | When a matching file is read; not re-injected after compaction | Directory- or file-type rules, scattered paths |
| Nested `CLAUDE.md` | When files in that directory are read | Same, versioned beside the code |
| `.claude/skills/<name>/SKILL.md` | Description always; body on invoke or relevance. `disable-model-invocation: true` = zero cost until `/name` | Workflows (`/deploy`), sometimes-needed reference; supports `paths:`, `allowed-tools`, `context: fork` |
| Auto memory (`~/.claude/projects/<repo>/memory/MEMORY.md`) | First 200 lines / 25 KB; machine-local; Claude-written | Corrections, preferences, context not in code. Skips what CLAUDE.md already says |
| Hooks (`.claude/settings.json`) | On events; zero context unless they output | Must-happen-every-time: lint after edit, block a folder, gate stop on a passing check |
| Subagents (`.claude/agents/`) | Own context; load CLAUDE.md, not main auto memory | Many-file research; adversarial diff review |
| `permissions.deny`, `claudeMdExcludes` | Enforced by the client | Hard blocks; skipping irrelevant instruction files |

Trigger table (FEAT): wrong twice → CLAUDE.md; same prompt typed repeatedly → user-invocable skill; same playbook pasted three times → skill; must happen every time → hook; side task floods context → subagent; second repo needs the setup → plugin.

## 5. Checklist for a small solo-founder repo

1. Root `CLAUDE.md` under 200 lines: commands, settled decisions, gotchas, how to work together. Confirm with `/context`; try `/doctor` for trims.
2. Every line: would deleting it cause a mistake? Otherwise delete. One `IMPORTANT` at most.
3. Nothing `ls`, `package.json` or the code already says.
4. One home per fact — CLAUDE.md or the owning doc, never both.
5. Directory-specific rules → `.claude/rules/<topic>.md` with `paths:`. What must survive compaction stays in the root file.
6. Any procedure described twice (deploy, migration, mail run) → a skill, `disable-model-invocation: true` if it has side effects.
7. Anything that must never happen → `permissions.deny` or a `PreToolUse` hook, not a sentence.
8. A check Claude can run beats "be careful"; ask for evidence, not assertions.
9. Long reference stays in `docs/`, out of context; a short map in CLAUDE.md says which file answers what. A status file for "true now"; git for history.
10. Big features: interview → `SPEC.md` → fresh session.
11. Revisit after each model release and whenever you correct the same thing twice. Prune before adding.
12. Let auto memory hold your preferences; don't duplicate them in CLAUDE.md.

**Fynda, observation only:** `CLAUDE.md` is 75 lines but ~1,100 words of dense tables — under the line target, heavy by tokens. Three path-scoped rules match the guidance. No skills, hooks or `settings.json`: the deploy/migration/digest commands and "before every push" are the textbook skill and hook candidates. `docs/README.md`'s own rules (one home per fact, status not history, ~200-line ceiling) are the same rules Anthropic states.

## Sources

- MEM https://code.claude.com/docs/en/memory
- BP https://code.claude.com/docs/en/best-practices (target of https://www.anthropic.com/engineering/claude-code-best-practices)
- FEAT https://code.claude.com/docs/en/features-overview
- SK https://code.claude.com/docs/en/skills
- LARGE https://code.claude.com/docs/en/large-codebases
- CTX https://code.claude.com/docs/en/context-window
- STEER https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more (2026-06-18)
- CE https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- TOOLS https://www.anthropic.com/engineering/writing-tools-for-agents
- PE https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices


---

# OpenAI's guidance on in-repo docs for coding agents (AGENTS.md)

Researched 2026-09-16. `developers.openai.com/codex/...` pages now redirect to `learn.chatgpt.com/...`; the original URLs are given. Only section 5's Anthropic side is from general knowledge rather than a fetched page.

## 1. The concrete rules OpenAI states

**a. Purpose** — "the extra, sometimes detailed context coding agents need: build steps, tests, and conventions that might clutter a README." Plain Markdown, no required fields. Explicit user prompts override it. Agents run any checks it lists and fix failures. — https://agents.md/ ; framing repeated in https://openai.com/index/introducing-codex/

**b. What a good one covers** — repo layout; how to run the project; build, test and lint commands; engineering conventions and PR expectations; constraints and do-not rules; what "done" means and how to verify. — https://developers.openai.com/codex/learn/best-practices

**c. Length and growth**, same page — "A short, accurate `AGENTS.md` is more useful than a long file full of vague rules." "Start with the basics, then add new rules only after you notice repeated mistakes." Same mistake twice → "ask it for a retrospective and update `AGENTS.md`." If it grows, "keep the main file concise and reference task-specific markdown files" (planning, review, architecture). Tool config belongs in `config.toml`; repeated workflows become skills.

**d. The `/init` template** (the prompt Codex uses to write a starter file) — title "Repository Guidelines"; "200-400 words is optimal"; short, repo-specific, with example commands and paths. Sections: Project Structure; Build, Test and Development Commands; Coding Style and Naming; Testing Guidelines; Commit and PR Guidelines; optional Security/Configuration, Architecture Overview, Agent-Specific Instructions. — https://github.com/openai/codex/blob/rust-v0.50.0/codex-rs/tui/prompt_for_init_command.md (moved on `main`; tagged copy is stable)

**e. "Harness engineering"** (Ryan Lopopolo, OpenAI, 2026-02-11; three engineers, ~1M lines written by Codex) — AGENTS.md is "roughly 100 lines" and is "the table of contents", not the encyclopedia. A monolithic file fails because context is scarce and it crowds out the task; "when everything is 'important,' nothing is"; it "rots instantly"; and it can't be checked mechanically. Knowledge lives in a structured `docs/` directory the file points to (progressive disclosure). Taste goes into custom linters and CI, not prose. A recurring "doc-gardening" agent files PRs against stale docs. — https://openai.com/index/harness-engineering/

**f. Model behaviour** — "the model has been trained to closely adhere to these instructions." Remove prompts for upfront plans or preambles; they can make the model stop early. — https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide

**g. Contradictions cost reasoning** — GPT-5 "follows prompt instructions with surgical precision"; conflicting rules burn tokens on reconciliation, so fix the hierarchy instead of adding rules. Cursor got better results by *softening* "maximize thoroughness" wording. — https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide

**h. Code review** — a `## Code Review Rules` section in the AGENTS.md nearest the code. "Keep rules concise, explain the behavior to flag and any safe path or exception, and reserve formatting and lint checks for CI." — https://developers.openai.com/codex/guides/agents-md

**i. Cloud** — Codex cloud "uses it to find project-specific lint and test commands"; every task starts from a fresh container, so durable instructions go in the file. — https://developers.openai.com/codex/cloud/environments

**Third-party evidence** (all test Codex; none cites OpenAI's pages):
- Gloaguen et al., ETH Zurich, arXiv 2602.11988 — context files did not significantly raise success (LLM-written −0.5 to −2 pts; developer-written +2.4, n.s.) and raised cost ~20%. Instructions *are* followed; "repository overviews … are not helpful." Files only helped (+2.7%) when the repo's own docs were removed. Include "only specific additional instructions beyond what is already available in the codebase."
- Lulla et al., arXiv 2601.20404 — 124 PRs, 10 repos: with AGENTS.md, median runtime −28.6%, output tokens −16.6%, same completion. The file cuts wasted exploration, not failures.
- Two-agent ablation, arXiv 2607.27250 (Claude Code + Codex) — no correctness difference between no file, always-on file, and on-demand docs.
- Upsun's reading: start empty, "add one rule at a time." — https://developer.upsun.com/posts/ai/agents-md-less-is-more

## 2. Recommended structure and length

- **Root file**: 200–400 words (`/init`) to ~100 lines (OpenAI's own practice). Order: layout → commands → style → testing → commit/PR → constraints → definition of done. Every line repo-specific and actionable.
- **Companion docs**: a `docs/` directory the root points to; loaded when needed. OpenAI's `openai/codex` AGENTS.md is ~320 lines but delegates ("See `codex-rs/tui/styles.md`") rather than inlining.
- **Nested files** for subprojects with their own commands; overrides "as close to specialized work as possible."

## 3. What to keep out

- Overviews and framework descriptions the README or the model already covers (cost, no benefit).
- Generic quality advice ("write clean, tested code").
- Anything a linter, test or CI can enforce — build the check, delete the prose.
- Contradictory or "maximize"-style rules; plan-first/preamble instructions.
- Stale rules — garden them or the file becomes "a graveyard."
- Tool config (belongs in `config.toml`) and repeated workflows (belong in skills).

## 4. Mechanisms (Codex CLI and cloud)

- **Per directory, first match wins**: `AGENTS.override.md` → `AGENTS.md` → `project_doc_fallback_filenames` (e.g. `["CLAUDE.md"]`, so one file can serve both agents).
- **Walk**: global `~/.codex/AGENTS.md` first, then project root (git root or `project_root_markers`) down to the working directory, one file per level. Deeper files are appended later and win on conflict; siblings are never read.
- **Injection**: each file is a user-role message headed `# AGENTS.md instructions for <directory>`, before your prompt.
- **Cap**: `project_doc_max_bytes`, default 32 KiB across all files; empty files skipped; past the cap, deeper files are dropped silently.
- **Overrides**: `AGENTS.override.md` replaces only its own level; parents still apply. `model_instructions_file` replaces the built-in system prompt (rare); `developer_instructions` appends.
- **Precedence**: user prompt > deepest file > parents > global.
- **Check**: `codex --ask-for-approval never "Summarize the current instructions."`
- Sources: https://developers.openai.com/codex/guides/agents-md , https://developers.openai.com/codex/config-reference

## 5. Where OpenAI and Anthropic agree and differ

**Agree**: short, specific, commands-first; nearest file wins; add rules from observed mistakes; keep the always-loaded file lean and point to deeper docs; enforce style with tools; the user's prompt outranks the file.

**Differ**:
- *Filename*: `AGENTS.md` plus configurable fallbacks vs `CLAUDE.md`.
- *Numbers*: OpenAI publishes targets (200–400 words; ~100 lines; 32 KiB). Anthropic says "concise" without a figure.
- *Overrides*: Codex has same-level `AGENTS.override.md`; Claude Code layers user/project/local files and `@path` imports.
- *Path-scoped rules*: Claude Code's `.claude/rules/*.md` load by file touched; Codex scopes only by directory.
- *Overviews*: OpenAI's `/init` still asks for a "Project Structure" section; its own harness post and the ETH study say it earns the least.

## 6. Checklist for a small solo-founder repo

1. One root file, ~100 lines. This repo's `CLAUDE.md` is 75 lines / 1,100 words / 6.7 KB — inside OpenAI's line target and cap, above its 200–400-word `/init` target; fine while every line is a rule, not a description.
2. First screen: build, test, deploy, and what "done" looks like. Commands over prose.
3. Every rule repo-specific and mistake-derived. Cut what the README, the code or the model already knows.
4. Detail lives in `docs/`; the root file is the map.
5. Prefer a check to a sentence: if a guardrail or test can enforce it, write the check and delete the prose.
6. No contradictions; one home per fact; rewrite in place.
7. Garden it: same mistake twice → retrospective → one new line. Occasionally ask the agent which rules it never used.
8. If Codex is ever used too: `project_doc_fallback_filenames = ["CLAUDE.md"]` in `~/.codex/config.toml`, or a one-line `AGENTS.md` pointing at `CLAUDE.md`; verify with "Summarize the current instructions."
9. `.claude/rules/` has no Codex equivalent; nested `AGENTS.md` files in `functions/` and `supabase/migrations/` would be the port.
