# AGENTS.md — Goblin Grotto

> Instructions for Codex and other coding agents working in this repository.
> **Dig deep. Hoard shinies. Cause trouble.** Build the game in small, tested, reviewable increments.

## 1. Sources of truth

Read these files **before changing code**:

1. **`PLAN.md`** — authoritative product scope, dependencies, `GG-###` tasks, acceptance criteria, milestones, and definition of done.
2. **`AGENTS.md`** — working rules for agents and contributors.
3. **`README.md`** — public-facing project description, setup, and usage.
4. **`CHANGELOG.md`** — record of completed changes and released milestones.
5. **`LICENSE.md` and `ASSETS-LICENSE.md`** — separate rights for code and creative assets.

Follow the latest explicit task request. If it conflicts with `PLAN.md`, flag the conflict, make only the authorised change, and update the plan/ADR as appropriate. Do not silently redefine the product or expand v1.0 scope.

## 2. Project identity and scope

Goblin Grotto is a browser-first, real-time, fixed-perspective **2.5D pixel-art goblin colony and dungeon-defence game**, with a dark-fairy-tale tone: **the Brothers Grimm meet slapstick**.

- The player is the **Spirit of the Grotto**: guardian, mischievous *genius loci*, or potential tyrant.
- **Goblin-centred simulation:** simulate what local goblins can experience; keep distant people, kingdoms, geology, and weather abstract unless gameplay needs more detail.
- **Rules create possibilities; goblins enact them.** Policies, designations, and priorities guide autonomous agents; direct orders and possession allow intervention, with consequences.
- Goblins have compact **Souls**: Four Humours, attributes, needs, memories, relationships, ambitions, and morale. Their choices must be understandable without being entirely predictable.
- Chief and Shaman may resist, reinterpret, or over-enthusiastically fulfil the Spirit's will. Individual and communal property claims can conflict.
- Combat is **real-time**, tick-driven, and deliberately bounded. Stronger factions are beaten by traps, positioning, morale, and scavenging—not by out-forging dwarves or elves.
- Named items have persistent identities, provenance, ownership claims, and discoverable histories. Grudges depend on what factions actually know.
- The first release has **one playable Z-level** and a small nearby surface region. Preserve future seams without implementing vertical gameplay or world-scale simulation.
- Centuries, clans, inheritance, and an optional Overlord victory are planned; the sandbox continues after victory.

**Scope guard:** prefer the simplest implementation that creates an interesting decision, interaction, or story. Do not add complex geology, meteorology, psychology, physics, a general-purpose ECS, multiplayer, or speculative architecture without a concrete plan task and demonstrated need.

## 3. Required agent workflow — every task

### Before editing

1. Inspect `git status`, relevant code/tests, and the current `PLAN.md` checklist. Preserve uncommitted work; never assume the tree is clean.
2. Select the **smallest uncompleted `GG-###` task** whose prerequisites are satisfied, unless the user explicitly directs a different task. Read its **full** description and **Done** criteria, plus relevant architecture and scope sections.
3. State the task ID, intended minimal change, tests, and any dependencies or blockers in the work summary/PR. For multi-agent work, agree distinct task IDs and file ownership to avoid concurrent edits to shared contracts.
4. If a requirement is ambiguous, prefer the plan's proposed default. Record consequential choices in a concise ADR under `docs/adr/` rather than inventing extensive systems.

### While implementing

5. Make one focused, reversible change at a time. Prefer a test with the implementation; do not bundle unrelated `GG-###` tasks into an enormous commit.
6. Keep `main` runnable. Respect existing APIs, save formats, content conventions, and art guidelines; write migrations when persisted state changes.
7. Do not treat renderer output, a passing build, or a partially scaffolded feature as proof that the task's gameplay acceptance criteria are complete.
8. If the task is too large, split it into independently testable increments **without changing existing task IDs**, document any added subtask/dependency in `PLAN.md`, and leave the parent unchecked until its full criteria pass.

### Before considering a task complete — mandatory documentation updates

9. **Run the relevant tests and checks** (see §5). Confirm the actual acceptance criteria, including browser behaviour where relevant. Record commands run and results; never claim a check passed if it was not executed.
10. **Update `PLAN.md` in the same PR/commit set as the implementation:**
    - Change that task's checkbox from `- [ ]` to `- [x]` **only when all its Done criteria are satisfied**. Preserve the `GG-###` ID, task wording, and acceptance criteria.
    - A checked box is regarded as completed **once that change is merged**. Do not announce an unmerged or unverified task as finished.
    - If incomplete or blocked, leave `- [ ]`, explain the gap, and record any necessary follow-up. Never tick off a whole milestone because one component works.
    - Update milestone gates, cross-system dependencies, architectural decisions, or scope labels **only if actually affected**; preserve completed task history.
11. **Update `CHANGELOG.md` in the same PR/commit set:**
    - Add a concise entry under **`## [Unreleased]`**, using `Added`, `Changed`, `Fixed`, `Removed`, or `Security` as appropriate.
    - Reference the `GG-###` ID for planned work and state the concrete outcome, not just “implemented task.” For bug fixes or improvements outside the plan, describe them plainly and reference an issue/PR if available.
    - Include meaningful internal foundations (tests, CI, tooling, save migrations) when they complete a plan task; avoid noisy entries for trivial formatting or typo-only edits.
    - Do **not** backdate entries, invent release dates, or mark unreleased work as shipped. On a tagged milestone, move relevant notes into the actual version heading and leave a fresh `Unreleased` section.
12. Update `README.md`, help text, ADRs, `docs/ART_BIBLE.md`, asset attribution/provenance, and user-facing controls **when the change affects them**. Don't duplicate the whole plan in these files.
13. Commit using **Conventional Commits**, preferably one coherent task per commit/short PR, e.g. `feat(world): generate seeded caverns (GG-027)` or `fix(economy): prevent duplicate item transfers (GG-071)`. Include test, `PLAN.md` checkbox, and changelog changes together wherever possible.
14. Finish with a concise report: task ID(s), what changed, tests run/results, PLAN checkbox state, changelog entry, remaining risks, and commit/PR reference **if one actually exists**.

**No silent bookkeeping debt:** a task is not done if its required `PLAN.md` and `CHANGELOG.md` updates are missing. Do not mark work complete merely to make a progress indicator advance.

## 4. Architecture and coding conventions

- **TypeScript:** strict mode, ES modules, explicit domain types; avoid `any`, unchecked casts, and implicit global state. Keep modules small and descriptive.
- **Stack:** Vite (`vanilla-ts`), PixiJS for the pixel-art world, semantic HTML/CSS for UI, Vitest for pure simulation tests, and Playwright for browser smoke tests; introduce dependencies only when they clearly remove useful work.
- **Simulation/rendering boundary:** `src/core/` and `src/sim/` stay pure TypeScript. No PixiJS, DOM, canvas, wall-clock time, or `Math.random()` in authoritative simulation rules. Renderers consume state/events; inputs become validated commands.
- **Determinism:** fixed simulation steps, seeded serialisable PRNG, stable iteration/tie-breaks, ordered systems, reproducible seeds, and replayable tests. Cosmetic randomness must not alter game outcomes.
- **Identity and persistence:** stable entity/item/faction/clan/event IDs; typed ownership and transfer operations; versioned saves, validation, migration, and round-trip tests. Keep critical item provenance and unresolved claims intact.
- **World:** one playable `z = 0` level for v1; logical positions may have `z` for future expansion. Terrain types are fiction-first, not realistic geological taxonomy.
- **AI:** bounded utility scoring, task reservations, priorities, and explainable failure reasons. Prefer event-driven or scheduled reevaluation to expensive frame-by-frame searches.
- **UI/accessibility:** keep essential interface elements in HTML where practical, with keyboard access, focus indicators, readable information, and reduced-motion support. Treat names, imported saves, and Chronicle text as untrusted content; don't inject them as raw HTML.
- **Art:** establish projection/anchors in the `GG-013` spike and `docs/ART_BIBLE.md` before mass-producing sprites. Target 32×32 native goblin sprites, nearest-neighbour scaling, and a consistent PixelLab-assisted palette.
- **Content:** use typed data for materials, jobs, items, encounters, and narrative templates. Avoid huge hardcoded conditionals and overengineered plugin frameworks.

Use the planned directory boundaries in `PLAN.md` as guidance; **do not create empty directories or abstractions merely to match a diagram**.

## 5. Tests and definition of done

Run available repository scripts before committing or requesting merge:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Also run `npm run format:check` once introduced. Use Playwright/browser tests for renderer, selection, input, inventory, accessibility, and persistence changes. During the initial scaffold, some scripts may not yet exist: clearly report **not configured** rather than claiming success; add each script as its corresponding `PLAN.md` task requires.

For simulation changes, include fixed-seed regression tests and invariant checks where appropriate: no duplicated items, impossible inventory placement, dangling references, conflicting reservations, or broken save round-trips. For visual/UI tasks, provide a reproducible manual test and screenshot/GIF when useful. Check that the game remains playable, not only that TypeScript compiles.

**Acceptance checklist for every completed `GG-###`:** full `Done` criteria met; appropriate tests passing; no unexplained regression; saves handled; player-visible behaviour legible; `PLAN.md` checkbox updated; `CHANGELOG.md` entry added; supporting documentation adjusted.

## 6. Git, collaboration, and releases

- Prefer short feature branches/PRs named like `feat/gg-027-seeded-caverns` or `fix/gg-071-item-transfer` and keep `main` green.
- Never force-push, reset away another contributor's changes, delete unrelated files, or rewrite history without explicit authorisation.
- If parallel agents touch shared files, coordinate before merging; reconcile `PLAN.md` and `CHANGELOG.md` changes rather than overwriting another agent's entries.
- Do not create a release tag or claim a milestone is complete until **all** its acceptance gates pass and the release has actually been approved/published.
- For actual releases, create a dated `CHANGELOG.md` version section (`## [0.1.0] - YYYY-MM-DD`), document known issues, verify build/saves/credits, and link the tag/release from the README when relevant.

## 7. Licences and provenance

- Source code is MIT-licensed as stated in `LICENSE.md`; original creative assets are **not** automatically MIT-licensed. Follow `ASSETS-LICENSE.md`.
- Never import, trace, decompile, or repackage copyrighted game graphics, sounds, code, fonts, or other materials without a suitable licence or permission.
- Record provenance and permitted uses for third-party assets; preserve required credits and licence files. Check PixelLab terms for intended uses and curate generated art to a consistent style.
- Do not commit credentials, tokens, private files, unnecessary generated output, or oversized intermediate exports.

## 8. Task handoff template

Use this format in PR descriptions or final agent summaries:

```text
Task: GG-### — <short name>
Change: <what is now implemented>
Verification: <exact commands and pass/fail; manual steps if needed>
PLAN.md: <checked / remains open and why>
CHANGELOG.md: <Unreleased entry added / explain exception>
Docs/assets: <updated / not applicable>
Risks or follow-ups: <none / specifics>
Commit or PR: <actual reference, if created>
```

**Final filter before adding a feature:** What can a goblin perceive? What interesting choice does this create? Who can react, and what might be remembered later? If the answer is unclear, simplify or defer.
