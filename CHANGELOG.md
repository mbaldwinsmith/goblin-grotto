# Changelog

All notable changes to **Goblin Grotto** are documented here.

This project uses milestone versions described in [PLAN.md](PLAN.md). Entries remain under **Unreleased** until the corresponding version is actually published. Coding agents must update this file and the relevant `PLAN.md` checkboxes as part of each completed task, following [AGENTS.md](AGENTS.md).

## [Unreleased]

### 0.1.0-prototype.4 — discoveries beyond the firelight

#### Added

- GG-028: seed-selected fungal groves, ruins, old workings, pools, shrines and abandoned dens with visible markers, flavour text and discovery entries.
- GG-029: forest undergrowth, gatherable loose stone, a grotto entrance and a marked traveller approach, with accessible surface food and trees.
- GG-030: iron, copper, gold and gem deposits, ancient masonry, distinct resource visuals and inspection. Mining/gathering create the corresponding physical resources; ore totals show their breakdown.
- GG-031: persistent settlement discovery, wall-blocked sight, an Explore designation and frontier hints. Unseen landmarks and deposits stay hidden; work routes use known terrain.
- GG-033: generation validates spawn/food access, buildable floor, entrance/outdoor routes, immutable boundaries, resource placement and landmarks. The 1,000-seed sweep fails with the seed and concrete invariant if generation regresses.

#### Changed

- Save schema 2 adds landmark metadata and resource types. Existing schema-1 saves migrate without losing map knowledge, items or running jobs; new chamber layouts apply to new grottos. Includes a compressed migration fixture generated from the previous committed simulation.
- Applying a tile coordinate centres the view on the chosen location.

### 0.1.0-prototype.3 — map interaction and terrain

#### Added

- GG-016: bounded pan, pointer-anchored zoom, Home reset and entity focus, verified while paused and after resize.
- GG-018/GG-019: interleaved object/actor depth, selected foreground fading, a Reveal walls toggle and logical goblin/structure picking independent of sprite transparency.
- GG-020/GG-021/GG-041: keyboard-friendly Chronicle drawer, goblin inspector, drag-painted work with one application per tile, and safe Escape/focus-loss/pointer-cancel behavior. Future Guard and Possess tools are visibly disabled.
- GG-025: all six terrain materials now define readable names, hardness, support ratings, movement intervals and resource drops. Walking and mining use the registry; the inspector explains the costs. Cave-in behavior remains GG-032.

#### Fixed

- Cached terrain graphics prevent expensive per-frame object rebuilds. The tool list scrolls while Home, Reveal walls and Help remain accessible.
- Imported goblin names are assigned to meter labels through DOM attributes, closing an HTML-injection path.

### 0.1.0-prototype.2 — three-quarter JRPG perspective

#### Changed

- Corrected GG-013/GG-015/GG-017 presentation to the requested three-quarter JRPG view: rectangular floor tiles, raised walls, upright sprites and row-based depth sorting. Updated picking, overlays, projection regression tests and the projection ADR. Simulation coordinates and saves retain their existing format.

### 0.1.0-prototype.1 — playable local prototype

Unreleased prerelease build; no public milestone tag or release is claimed.

#### Added

- Owner-private HTTPS preview through Sites, so the prototype can be opened without cloud port forwarding.

- Chromium browser checks for farm construction, digging, panning and zoom, save/load, malformed imports and portable saves in a fresh profile (GG-024).

- Playable PixiJS WebGL map, seeded new-world dialog, inspection and work tools, keyboard controls, speed controls and onboarding guide (GG-014,GG-017,GG-036,GG-059).

- Validated versioned IndexedDB manual and autosave slots, portable JSON import/export and exact save continuation (GG-056,GG-057,GG-058).

- Compared isometric and oblique scenes; selected fixed isometric projection with inverse-picking tests (GG-013,GG-015).

- Architecture decisions for fixed-step simulation, DOM UI, rendering separation and versioned local saves (GG-012).

- Canonical snapshot hashes and deterministic command replay regression tests (GG-010).

- Deterministic command-driven colony slice: connected seeded caves and surface, autonomous jobs, resource hauling, mushroom food cycle, workshop bed kits, dashboard totals and multi-seed endurance tests (GG-008,GG-009,GG-026,GG-027,GG-039,GG-042,GG-043,GG-051,GG-052,GG-055,GG-060).

- Fixed step clock with pause speed and bounded catch-up (GG-007).

- Serializable seeded RNG with range and weighted choice (GG-006).

- Distinct stable IDs and grid position contracts (GG-005).

- Headless Vitest harness with real core assertions (GG-004).

- Biome lint and formatting plus strict type checks (GG-003).

- Vite strict TypeScript scaffold with locked dependencies and Node 24 (GG-002).

- Repository conventions, ignore rules, issue template, and branch protection guidance (GG-001).

- Partial GG-029: traversable outdoor strip with trees and forage. Partial GG-054: one workshop bed-kit recipe with a tested craft-to-build loop; broader content remains open.
- GitHub Actions quality workflow added; GG-011 remains open until hosted CI and merge protection are verified.

#### Earlier documentation

- Initial development workflow and agent guidance in `AGENTS.md`, including task-tracking and changelog requirements.

<!-- Add future entries to the relevant category under Unreleased: Added, Changed, Fixed, Removed, or Security. Reference GG-### for completed planned work. -->

