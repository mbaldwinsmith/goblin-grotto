# 0.1.0-prototype.12 — verification and handoff

The first local playable prototype is implemented on `feat/playable-prototype`.
It is not the full v0.1 release. The current fixed three-quarter JRPG renderer supersedes the initial isometric presentation. Checkboxes in this change represent verified
implementation and become completed plan records on merge. No release tag exists. An owner-private [hosted preview](https://goblin-grotto-prototype.breezyeft133.chatgpt.site) is now deployed through Sites; this is not a public milestone release.

## What to try

Run `npm ci && npm run dev`, then follow the in-game guide: two mushroom patches,
four beds, a new room and a stockpile. Four autonomous goblins carry out work,
interrupt it to eat/sleep, and resume. Save/load and export/import preserve their
world and running work. The workshop produces a bed kit from one wood; a bed
uses a stored kit before falling back to two raw wood.

## Evidence

- `npm run typecheck`: strict TypeScript, including browser and simulation tests.
- `npm run lint` and `npm run format:check`: Biome checks.
- `npm test`: 76 headless tests in sixteen files. Includes 1,000 seeded starts;
  a 24,000-tick colony run; three further 16,000-tick runs with save validation
  every 200 ticks; item, reservation, hunger, construction/refund and craft/use
  invariants; snapshot replay; exact clock steps at several render frequencies;
  projection inverse tests including negative coordinates and zoom.
- `npm run build`: production static Vite build.
- `npm run test:browser`: fifteen Chromium scenarios. Builds a farm, digs rock,
  inspects tiles, pans/zooms, opens help, saves/reloads, rejects bad imports, exports
  and imports into a fresh browser profile. Also checks both projection studies, scouting, hidden landmark information,
  actual schema-1 save import, wall reveal/entity picking, keyboard focus,
  resize/paused camera use, Escape during a stroke and drag-painted stockpiles.
- A temporary intentionally invalid TypeScript/debugger fixture was rejected by
  both type checking and linting, then removed.
- Screenshots: [prototype](screenshots/prototype.png),
  [projection study](screenshots/projection-study.png).

Browser validation uses installed Chromium with SwiftShader in this cloud
workspace. The Playwright CDN is blocked by network policy; CI uses the standard
Playwright installation path. This does not establish real GPU performance,
Firefox/WebKit compatibility or the latest hosted CI status. The endurance test has a
20-second timeout because concurrent browser software rendering can slow it down.

## Open work and honest scope

GG-011: the previous hosted Quality run is green (run 41239850553), but required
checks/branch protection are not verified here. M00's full gate remains open for that reason.

GG-022/GG-023: production art bible/atlas and polished animation.
The original 29-file 32×32 PNG reference set is implemented; directional animation
and the production atlas remain open.

GG-032/GG-034/GG-035 are verified on this branch: warned cave-ins/supports, seasonal weather and cached A* navigation. Completion records await merge.

GG-045–050/053:
full interruption/direct-order/animation/debug criteria,
safety needs, explicit bed reservations and complete structures/refund acceptance.
The current buildings, hunger/rest and work tools are usable partial slices.

GG-054: one useful tested starter recipe exists; further furnishings/tools remain.
GG-061 and the v0.1 gate remain open. No public build or milestone tag was created.
Souls, government, possession, raids, equipment, relics and generations are later
milestones and were not introduced into this prototype.

New saves are schema 8; schema-1 through schema-7 saves migrate in place with their existing map,
knowledge, objects and work preserved. Unsupported versions are explicitly rejected. Future schema
changes need migration fixtures. No death or starvation failure state is present.
The colony has a sustainability goal rather than a win screen. Source and technical
docs use MIT; creative material follows ASSETS-LICENSE.md.

## Iteration 4 verification

New grottos contain four landmark sites, including concealed chambers. The six
landmark archetypes occur across tested seeds. Exterior stone, undergrowth,
entrance and approach markers complement guaranteed trees and forage. The
generator runs validateWorld before returning; the existing 1,000-seed sweep
therefore checks the full generation invariants as well as physical reachability.
Fog is persistent knowledge, not an omniscient reveal of connected chambers.
Scouting and excavation update sight; gameplay path queries use known terrain.
The browser scenario scouts through the eastern passage, reads a newly revealed
landmark and then imports the previous committed save and finishes its active farm.
See [discovery screenshot](screenshots/discovery.png). No new generation is injected
into an imported colony.

## Native art verification

Every floor, wall top, wall side and plant PNG is 32×32. The owner-supplied
static goblin poses are 32×32; current animation canvases retain 40×40/44×44/48×48 at scale 1. Home resets the
view to 1×, giving a 32×32 screen-pixel floor grid. Wall tops and sides are separate
textures and render nodes; exposed sides and raised tops retain their native size.
The browser suite verifies all 29 images decode at 32×32 and repeats selection,
wall reveal, camera/resize, painting, scouting and save migration at the new scale.
This renderer change did not alter simulation coordinates or the then-current save schema 2.
See [art preview](screenshots/art-preview.png).

## Supplied goblin integration

The prototype.6 integration used eight idle directions and 64 canonical walk frames from the
owner's ZIP. Tests verify archive/frame hashes, native dimensions, padding anchors,
eight-way direction mapping, continuous gait across tiles, frozen presentation on
unchanged ticks, smooth positions and history reset. An additional picking test
selects an interpolated body rather than its future authoritative tile. Browser QA
checks actual texture IDs/dimensions, a walking→paused→walking→idle transition and
unmodified sprite scale. It also exercises the existing save/load and wall reveal
scenarios with the new art. The source data and all game rules remain unchanged.
At that stage GG-023/GG-037/GG-038/GG-047 were partial. Iterations 8 and 9 below
verify GG-037/GG-038; atlas and specialised task-animation criteria remain open.


## Iteration 7 verification

Fixed-seed tests verify 300-tick ceiling warnings, actual support construction,
unsupported falls, occupied-tile postponement, food/corridor safety, and item
identity preservation. Weather is repeated from the same RNG state through all
seasons; only exterior movement costs change. Navigation tests cover weighted
routes, transient occupants, fog, exterior access, cache bounds and invalidation
for a newly opened shortcut or wall. A blocked haul releases both reservations.

A real schema-2 active-colony fixture from commit `e0d4662` is migrated field for
field. Saving mid-warning and resuming preserves exact weather/collapse outcomes.
The ninth browser scenario reads the ceiling warning, rejects an unsafe bed,
builds a support, sees the shored-up event, then saves/reloads the support and rain.
Screenshots: [ceiling warning](screenshots/ceiling-warning.png) and
[outside rain](screenshots/environment.png). See ADR 0003 for the modest safety
rules and cache invalidation contract. Damage, injuries and starvation are still
outside this prototype; GG-045's broader interruption criteria remain open.


## Iteration 8 verification

GG-037: goblin kind, facing, name, position and ID live in the simulation and
validated save data. Headless tests render and clear presentation history without
mutating actors, verify work-facing and migrate the real schema-3 fixture. Browser
QA imports a west-facing Nib, selects him, checks the actual idle-west sprite and
restores the same kind/facing after save/reload. New goblins are common goblins;
boggart/hobgoblin definitions remain GG-155. Schema 4 supports versions 1–3.


## Iteration 9 verification

GG-038 adds deterministic occupied-cell detours, idle yielding and cooperative
adjacent swaps in one-cell tunnels. A persistent next-move tick limits each actor
to one movement per terrain/weather interval, including being asked to yield.
Worker evaluation rotates each tick. Wall building uses an adjacent working tile
and clears idle actors from its site before completion.

Tests assert distinct walkable positions after each tick, moving holder/item
coordinates, opposing hauls through a tunnel, four deliveries to one pile,
blocked paths, cooldowns, safe wall construction and exact save continuation.
The browser sends four scouts down one narrow entrance, verifies all four finish
and checks distinct positions: [traffic screenshot](screenshots/traffic.png).
Existing animation/picking and save/import scenarios run with occupancy enabled.

Schema 5 stores movement cooldowns. Versions 1–4 keep IDs and work; legacy actors
sharing a tile or standing on a wall move to nearby free discovered floor, with
held items following their holder. New invalid overlaps are rejected. This is
local cooperation for four workers; large population performance is GG-187.
At that stage task priorities were still pending; iteration 11 below implements GG-040. Direct orders, full needs and bed reservations remain open.


Merge verification: hosted Quality run 41324610105 passed all headless/build
checks and ten browser scenarios, but scouting timed out. A longer local wait
reproduced a mixed-terrain detour oscillation. A regression test fails on the
previous movement code: a goblin repeatedly turns back from a muddy detour toward
a cheap occupied corridor. Movement now checks occupants along the full remaining
route, so the goblin completes the detour. The scouting scenario also has a
120-second overall budget and 30-second per-trip waits for software rendering,
retaining all discovery, fog and legacy-save assertions.

Owner commit `37ad2ad` updates the incoming base ZIP and adds a hauling ZIP. The
existing imported frames retain their original provenance via the archived
`5473394` ZIP and manifest path; the new incoming ZIPs are preserved byte for byte.
They are not automatically substituted for the curated runtime frames.


## Iteration 10 verification

The owner-requested cardinal art standard loads four directions for five clips:
empty idle/walk, loaded idle/walk and put-down. Four static poses per pack support
portraits/rest; the 172-frame manifest verifies every source hash and anchor.
The original eight-way export stays archived; unused diagonal files are legacy
references and are not loaded by the runtime.

Seven new headless tests cover breathing, carrying, pause, all nine drop frames,
exactly-once release at frame 5, render independence, cancellation, schema-5
migration, invalid state and exact save continuation before/after release.
Normal delivery completes on release; its follow-through finishes before new work.
Interruptions retain immediate recoverable drops and start at the release frame.

Browser QA exercises loaded idle, bag walking, pause, wind-up save/reload, physical
release, final idle and one surviving item identity; gallery QA decodes all twenty
clips and selects drop frame 5. Screenshots: [hauling](screenshots/hauling.png),
[drop](screenshots/drop.png), [cardinal gallery](screenshots/cardinal-animations.png).
Mining animation is still pending: GG-047 remains open. No attack art is repurposed
as mining. Raw owner ZIPs remain unchanged and imports use version-pinned copies.


## Iteration 11 verification

GG-040 introduces three player priority tiers and optional preferred work. A global
pool of eligible free-worker/job pairs chooses by priority, then route cost,
preference, fatigue, food/support urgency, progress already made and a bounded
seeded tie-break. Each worker and job is claimed once; active jobs are retained.
Stored resources, known routes and physical item availability gate eligibility.
The goblin inspector records why a job was chosen; planned tiles explain blockers.

Nine new headless tests cover High before Normal, closest-worker assignment,
four-worker distribution, preference as encouragement, food/support urgency,
fatigue, urgent needs, missing stored resources, unreachable work, RNG independence
of pure inspection, reproducible variation, invalid requests, migration and exact
continuation. A real schema-6 wind-up fixture retains its original fields while
adding Normal priorities and Any work. The browser edits both controls, checks
choice reasons/worker identity, verifies active work stays reserved, uses a select
without panning and restores priorities/preferences after save/reload.
See [work choices](screenshots/work-choices.png) and ADR 0006. GG-048's full debug
view, Stockpile filters are verified in iteration 12; broader labour policies remain open.


## Iteration 12 verification

GG-044 adds five stockpile presets, idempotent area painting, explicit area removal,
filter editing and per-tile contents. Destinations use known weighted routes;
invalid destinations reroute without changing cargo IDs. A wind-up is cancelled
before release when necessary; no matching destination frees the worker and item.
Goods physically on accepted floor are stored, and held, excluded or buried goods
are not. Stockpiles beneath new structures/solid terrain are cleared.

Nine new simulation tests cover every preset, repeated painting, storage beneath
existing goods, nearest reachable matching piles, mixed-resource delivery,
filter/removal rerouting, wind-up save continuation, no-destination recovery,
blocked stockpiles, inventory conservation and migration/corruption handling.
A real schema-7 delivery fixture receives All goods without changing valid data.
Legacy stale stored flags are reconciled; schema-8 imports reject mismatched flags.
The earlier interruption test now expects cargo dropped on accepted storage to
count as stored, while its holder is still freed immediately.

The fifteenth browser scenario marks food/building areas, sorts two stacks,
checks resource tooltips and contents, restores filters after load, then changes
and removes destinations and verifies the same two objects arrive elsewhere.
See [stockpiles](screenshots/stockpiles.png) and ADR 0007. Capacity, containers,
per-item equipment and broader stockpile policies remain later work.
