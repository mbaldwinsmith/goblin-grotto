# Changelog

All notable changes to **Goblin Grotto** are documented here.

This project uses milestone versions described in [PLAN.md](PLAN.md). Entries remain under **Unreleased** until the corresponding version is actually published. Coding agents must update this file and the relevant `PLAN.md` checkboxes as part of each completed task, following [AGENTS.md](AGENTS.md).

## [Unreleased]

### Added

- Playable PixiJS WebGL map, seeded new-world dialog, inspection and work tools, keyboard controls, speed controls and onboarding guide (GG-014,GG-017,GG-036,GG-059).

- Validated versioned IndexedDB manual and autosave slots, portable JSON import/export and exact save continuation (GG-056,GG-057,GG-058).

- Compared isometric and oblique scenes; selected fixed isometric projection with inverse-picking tests (GG-013,GG-015).

- Architecture decisions for fixed-step simulation, DOM UI, rendering separation and versioned local saves (GG-012).

- Canonical snapshot hashes and deterministic command replay regression tests (GG-010).

- Deterministic command-driven colony slice: connected seeded caves and surface, autonomous jobs, resource hauling, mushroom food cycle, workshop bed kits, dashboard totals and multi-seed endurance tests (GG-008,GG-009,GG-026,GG-027,GG-029,GG-039,GG-042,GG-043,GG-051,GG-052,GG-054,GG-055,GG-060).

- Fixed step clock with pause speed and bounded catch-up (GG-007).

- Serializable seeded RNG with range and weighted choice (GG-006).

- Distinct stable IDs and grid position contracts (GG-005).

- Headless Vitest harness with real core assertions (GG-004).

- Biome lint and formatting plus strict type checks (GG-003).

- Vite strict TypeScript scaffold with locked dependencies and Node 24 (GG-002).

- Repository conventions, ignore rules, issue template, and branch protection guidance (GG-001).

- Initial development workflow and agent guidance in `AGENTS.md`, including task-tracking and changelog requirements.

<!-- Add future entries to the relevant category under Unreleased: Added, Changed, Fixed, Removed, or Security. Reference GG-### for completed planned work. -->

