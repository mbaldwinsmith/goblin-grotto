# Changelog

All notable changes to **Goblin Grotto** are documented here.

This project uses milestone versions described in [PLAN.md](PLAN.md). Entries remain under **Unreleased** until the corresponding version is actually published. Coding agents must update this file and the relevant `PLAN.md` checkboxes as part of each completed task, following [AGENTS.md](AGENTS.md).

## [Unreleased]

### 0.1.0-prototype.10 — four directions, a bag of shinies

#### Added

- Integrated the owner's updated base and hauling archives: four-direction idle breathing, walking, loaded breathing, loaded walking and nine-frame put-down clips. All 172 curated PNGs retain their original bytes, native padding and foot anchors; source hashes and member paths are recorded (partial GG-047; mining remains open).
- Normal deliveries release the physical item exactly once on drop frame 5, driven by simulation ticks. Cancellation and urgent interruptions free the item immediately and show the drop follow-through. Pause freezes the clips; rendering cannot advance work or transfer items.
- `/goblin-preview.html` now shows all 20 cardinal animation clips, with pause and frame-by-frame review.

#### Changed

- Applied the owner's four-cardinal-direction standard to simulation facing and rendered clips. Existing grid navigation already used four neighbours.
- Save schema 6 preserves in-progress drops, including the held/released phase. Versions 1–5 migrate without regenerating maps or losing items; old diagonal facing maps to north/south. Includes an actual schema-5 active-haul fixture and before/after-release continuation tests.

### 0.1.0-prototype.9 — make room in the passage

#### Added

- GG-038: goblins avoid occupied cells, detour where space permits and cooperate to pass through narrow entrances. Idle goblins make room; opposing workers exchange adjacent walkable cells without sharing a logical tile. Worker evaluation rotates fairly each tick.
- Movement cooldowns persist in save schema 5 and use terrain/weather costs. Older saves migrate stacked goblins onto nearby free discovered floor, keeping IDs, jobs and carried objects intact. New overlapping or blocked actor placements fail validation.

#### Fixed

- Pinned imported-art provenance to the original `5473394` archive, preserving reproducibility when the owner updates the incoming base/hauling ZIPs. New source ZIPs are retained unchanged.
- Prevented mixed-terrain detours from oscillating back toward an occupied corridor; movement checks occupants along the full remaining route. Includes a regression that failed before the fix.
- Allowed the multi-leg scouting browser scenario enough time for hosted CI software rendering, where the simulation deliberately bounds catch-up. Gameplay assertions remain unchanged.
- Wall builders work beside the wall and ask idle occupants to clear the site before construction, preventing a wall from enclosing its builder.
- Carried item coordinates update with each movement or yielding step. Browser animation checks follow the actual walking goblin rather than assuming the first actor gets the job.

### 0.1.0-prototype.8 — goblins keep their bearings

#### Added

- GG-037: four stable named goblins now carry an explicit common-goblin kind and simulation-owned facing. Selection and renderer resets preserve their identities; restored idle sprites face the saved direction.
- Save schema 4 migrates versions 1–3 with the common kind and south-facing default, preserving all previous fields and active work. A real schema-3 fixture verifies compatibility.

### 0.1.0-prototype.7 — shore up the grotto

#### Added

- GG-032: newly excavated weak ceilings can warn for 30 game seconds before a small cave-in. Build a Support (one wood, one stone) within two tiles to prevent it. Falls avoid occupied tiles and preserve colony/food access; blocked rubble can be excavated again.
- GG-034: five-day seasons, seeded clear/rain/snow transitions, a calendar/weather indicator and outdoor precipitation. Rain and snow modestly slow outdoor movement; caves stay sheltered.
- GG-035: deterministic cost-aware A* routes with a bounded cache, invalidated by terrain, discovery, ceiling warnings and weather changes. Tests cover tunnels, the outdoor entrance, occupied cells and newly dug shortcuts.

#### Changed

- Save schema 3 persists weather and ceiling warnings. Actual schema-1/schema-2 colony fixtures migrate without losing their maps, identities or active work.

#### Fixed

- A newly blocked route releases its worker and any carried item with a readable reason, allowing other work to proceed (partial GG-045; its wider criteria remain open).

### 0.1.0-prototype.6 — the owner's goblins come to life

#### Added

- Imported the owner-supplied base from commit `5473394`: eight directional idle poses and 64 canonical walk frames, copied unchanged with per-frame hashes and foot anchors. The original ZIP/GIFs and alternate west take are preserved.
- Directional walking and idle presentation, smooth position interpolation, work-facing and matching sidebar portraits. Animation uses fixed simulation ticks (two ticks per frame), respects pause and speed, and resets presentation history on load.
- `/goblin-preview.html` shows the supplied directional poses and walk previews. The old prototype goblin images remain available as legacy references.

#### Changed

- Retained the 40×40/44×44 transparent walk canvases at scale 1, aligning them to the same feet as the 32×32 idle body. No source resizing, cropping or mirroring.
- Picking and foreground fading use the displayed, interpolated position. Save schema 2 and authoritative simulation rules are unchanged. GG-023/GG-037/GG-038/GG-047 remain open for their broader atlas, kind, occupancy and task-animation criteria.

### 0.1.0-prototype.5 — separate 32×32 tiles and sprites

#### Changed

- Applied the owner's 32×32 native tile standard to projection, picking, depth, camera bounds and overlays (GG-013/GG-015/GG-017/GG-018). Home resets to 1×, where each floor tile occupies exactly 32×32 screen pixels.
- Wall tops and exposed front sides now use separate 32×32 PNG textures and independent sprite layers. Goblins and every plant type use separate untrimmed 32×32 PNGs with nearest-neighbour sampling.

#### Added

- 29 original reproducible PNGs, an asset manifest and `/art-preview.html`, covering six floor/top/side terrain families, grass, four goblins and six plant images. Includes native dimension and browser decoding checks. GG-022/GG-023 remain open for their full production-art criteria.

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

