# 0.1.0-prototype.5 — verification and handoff

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
- `npm test`: 27 headless tests in eight files. Includes 1,000 seeded starts;
  a 24,000-tick colony run; three further 16,000-tick runs with save validation
  every 200 ticks; item, reservation, hunger, construction/refund and craft/use
  invariants; snapshot replay; exact clock steps at several render frequencies;
  projection inverse tests including negative coordinates and zoom.
- `npm run build`: production static Vite build.
- `npm run test:browser`: seven Chromium scenarios. Builds a farm, digs rock,
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

GG-032/GG-034/GG-035: cave-ins, calendar/weather and cached navigation. The prototype uses deterministic BFS and a safe connected layout.

GG-037/038/040/044–050/053: complete kind definitions, smooth movement and
congestion handling, richer utility/priorities,
stockpile filters, full interruption/direct-order/animation/debug criteria,
safety needs, explicit bed reservations and complete structures/refund acceptance.
The current buildings, hunger/rest and work tools are usable partial slices.

GG-054: one useful tested starter recipe exists; further furnishings/tools remain.
GG-061 and the v0.1 gate remain open. No public build or milestone tag was created.
Souls, government, possession, raids, equipment, relics and generations are later
milestones and were not introduced into this prototype.

New saves are schema 2; schema-1 saves migrate in place with their existing map,
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

Every floor, wall top, wall side, goblin and plant PNG is 32×32. Home resets the
view to 1×, giving a 32×32 screen-pixel floor grid. Wall tops and sides are separate
textures and render nodes; exposed sides and raised tops retain their native size.
The browser suite verifies all 29 images decode at 32×32 and repeats selection,
wall reveal, camera/resize, painting, scouting and save migration at the new scale.
This renderer change does not alter simulation coordinates or save schema 2.
See [art preview](screenshots/art-preview.png).
