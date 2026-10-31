# 0.1.0-prototype.1 — verification and handoff

The first local playable prototype is implemented on `feat/playable-prototype`.
It is not the full v0.1 release. Checkboxes in this change represent verified
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
- `npm test`: 13 headless tests in four files. Includes 1,000 seeded starts;
  a 24,000-tick colony run; three further 16,000-tick runs with save validation
  every 200 ticks; item, reservation, hunger, construction/refund and craft/use
  invariants; snapshot replay; exact clock steps at several render frequencies;
  projection inverse tests including negative coordinates and zoom.
- `npm run build`: production static Vite build.
- `npm run test:browser`: three Chromium scenarios. Builds a farm, digs rock,
  inspects tiles, pans/zooms, opens help, saves/reloads, rejects bad imports, exports
  and imports into a fresh browser profile. Also checks both projection studies.
- A temporary intentionally invalid TypeScript/debugger fixture was rejected by
  both type checking and linting, then removed.
- Screenshots: [prototype](screenshots/prototype.png),
  [projection study](screenshots/projection-study.png).

Browser validation uses installed Chromium with SwiftShader in this cloud
workspace. The Playwright CDN is blocked by network policy; CI uses the standard
Playwright installation path. This does not establish real GPU performance,
Firefox/WebKit compatibility or a hosted CI result. The endurance test has a
20-second timeout because concurrent browser software rendering can slow it down.

## Open work and honest scope

GG-011: workflow exists, but hosted required checks/branch protection are not
verified here. M00's full gate remains open for that reason.

GG-016/018–023: camera bounds, foreground reveal and interleaved depth, full shell
and tool-state acceptance, production art bible/atlas and polished animation.
Current original code-drawn 32×32 sprites are temporary references.

GG-025/028–035: complete terrain rules, chamber discoveries, full outdoor dressing,
resource variety, robust fog, cave-ins, comprehensive seed validation, weather and
cached navigation. The prototype uses deterministic BFS and a safe connected layout.

GG-037/038/040/041/044–050/053: complete kind definitions, smooth movement and
congestion handling, richer utility/priorities, drag-painted designations,
stockpile filters, full interruption/direct-order/animation/debug criteria,
safety needs, explicit bed reservations and complete structures/refund acceptance.
The current buildings, hunger/rest and work tools are usable partial slices.

GG-054: one useful tested starter recipe exists; further furnishings/tools remain.
GG-061 and the v0.1 gate remain open. No public build or milestone tag was created.
Souls, government, possession, raids, equipment, relics and generations are later
milestones and were not introduced into this prototype.

Saves are version 1 with explicit rejection of unsupported versions. Future schema
changes need migration fixtures. No death or starvation failure state is present.
The colony has a sustainability goal rather than a win screen. Source and technical
docs use MIT; creative material follows ASSETS-LICENSE.md.
