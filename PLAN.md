# Goblin Grotto — Master Development Plan

> **Dig deep. Hoard shinies. Cause trouble.**
>
> A cute, dark-fairy-tale, real-time goblin-colony and dungeon-defence game, built with TypeScript and pixel art. *The Brothers Grimm meet slapstick; Dungeon Keeper meets Dwarf Fortress, with the goblins as protagonists.*

**Document:** `PLAN.md`  
**Status:** Living plan / initial specification (31 October 2026)  
**Target:** First public, playable **v1.0**; iterative playable releases along the way  
**Repository:** New GitHub repository; this document is intended to be its planning source of truth  
**Planning rule:** Check off a task only when its acceptance criteria are met and its commit is merged. Update this plan whenever scope or architecture changes.

---

## 0. North star, pillars and boundaries

### Premise

The player is the **spirit of a grotto**—perhaps guardian angel, mischievous *genius loci*, or would-be tyrant. The player influences a small, autonomous community of goblins as they excavate a home, forge social customs, grow food, accumulate treasures, defend against stronger powers, and live through generations. The spirit may guide, cajole, possess, coerce, or allow the goblins to choose for themselves. The game should never prescribe a single moral identity for the player.

The enemies are not just waves of hit points; they have motives, advantages, memories, and things they want. A magnificent stolen axe may win a battle and begin a century-long grudge. A goblin may acquire a legendary reputation with an otherwise unremarkable spoon. The grotto is a home worth defending, not merely an evil lair.

### Non-negotiable design principles

1. **Goblin-centred / perspectival simulation.** Simulate at the resolution goblins can experience. Nearby actors and objects have detail; distant kingdoms have concise summaries, not thousands of hidden agents.
2. **Story before scientific fidelity.** Geology, weather, psychology, economies and history should be legible, evocative, and mechanically meaningful—not exhaustive modern simulations.
3. **Rules create possibilities; goblins enact them.** Player-set policies, designations and priorities determine opportunities; individual Souls and circumstances determine behaviour. Direct micromanagement remains possible.
4. **Understandable, not predictable.** An action should be explainable after the fact, with enough variability for genuine surprises. Avoid arbitrary AI failures.
5. **Warmth inside, danger outside.** Cute, humorous, expressive domestic life contrasted with dark-fairy-tale loss, cruelty, curses and warfare. Serious consequences; no gratuitous cruelty or real-world mental-illness caricatures.
6. **Asymmetric warfare.** Goblins rarely win fair fights through superior manufacture. They win using home ground, traps, stealth, numbers, morale, stolen arms and clever planning.
7. **Treasure has a history.** Distinguish physical possession, personal attachment, legal ownership, ancestral claims and *who knows what*. Named relics can provoke grievances that gold alone cannot extinguish.
8. **Agency has a price.** Chiefs and Shamans can refuse, reinterpret or over-fulfil requests. Spirit-possession can be useful, exhilarating or traumatic; constant intervention can reshape the community.
9. **Continuity, not a fixed ending.** Centuries and generations are possible. Defeating the Overlord is an optional victory milestone followed by continued play.
10. **A playable game at every milestone.** Build and test vertical slices; avoid writing a whole speculative engine before a goblin can dig a tile.

### Explicit non-goals for v1.0

- Dwarf Fortress-scale world history, detailed geological stratigraphy, molecular fluid mechanics, global weather simulation, or thousands of fully simulated off-map people.
- Multiple playable Z-levels, complex vertical navigation, freely rotating camera, or a 3D voxel renderer **in v1.0**. Preserve expansion seams only.
- Physically simulated continents, armies marching tile-by-tile across a world map, or a full tower interior campaign.
- A complete spell school, hundreds of handmade enemy types, dozens of goblin breeds, or unlimited procedural enchantments.
- Multiplayer, accounts, backend servers, monetisation, modding APIs, or native mobile builds at first release.
- A complex ECS, general-purpose scripting language, event-sourcing infrastructure, or bespoke physics engine merely for architectural elegance.

### Scope labels

- **MUST (v1):** Required for first public release and its acceptance test.
- **SHOULD (v1 if safe):** Quality improvement; cut before jeopardising stability.
- **FUTURE:** Important design direction, *not* a promise for v1.
- **SPIKE:** A time-boxed experiment; document the finding and decide, don't indefinitely prototype.

---

## 1. What the first release must feel like

### Player's first ten minutes

1. Start a seeded world and see a tiny goblin settlement in a cave, with a small accessible outside patch of forest/hillside.
2. Meet four named goblins with distinct temperaments, jobs, belongings, and at least one ambition each.
3. Designate diggable rock; goblins choose tasks, path to them, excavate and haul the results.
4. Place a stockpile, beds and a mushroom patch; watch needs and routines influence work.
5. Notice a quarrel, friendship, small theft, delight or memorable mishap recorded in the Chronicle.
6. Set a basic communal rule, inspect the Chief and Shaman, and see how a leader interprets a command.
7. Possess a goblin to perform an urgent task, then see the after-effect on their Soul.
8. Recover a piece of equipment; inspect its shape in an inventory grid and equip it.
9. Meet a traveller, beast or intruder; defend the entrance using spatial planning and simple real-time combat.
10. Save, quit, reload, and find the same grotto, goblins, objects and consequential memories.

### First-release scope contract (v1.0)

| Area | MUST ship | Explicitly later / bounded for v1 |
|---|---|---|
| Map | One playable `z = 0` layer; seeded 64×64+ cave with several chambers and small outdoor region; blocked/diggable/unstable tiles | Further Z-levels, vertical liquids, large surface map |
| Projection | Fixed 2.5D JRPG-style three-quarter view; 32×32 native goblin sprites; consistent tile projection; zoom/pan | Camera rotation, 3D view |
| World | Sand, mud, loose rock, hard stone, bedrock, impenetrable stone; simple ore deposits, fungi, trees, shrubs, stone, water features; simple sun/rain/snow | Real geology, full hydrology, complex meteorology |
| Goblins | Four Humours, compact Soul, bodily needs, mood/morale, traits, attributes, skills, ambitions, limited memories and relationships | Exhaustive psychology, thousands of daily memories |
| Society | Chief, Shaman, meaningful leader response; basic policy/law, common/private property, sharing, disputes, appointments and deposition | Full constitution/justice simulator |
| Life | At least 3 kinds (common goblin, boggart, hobgoblin); clans, kinship, young/adult/elder stages, birth, aging, succession and inheritance | Deep genetics, complicated reproductive biology |
| Work | Digging, hauling, stockpiles, gathering, building, mushroom farming, crafting/smelting, rest and eating; policies and priority queues | Huge production chains |
| Spirit | Commands/designations plus temporary control of any goblin; differential receptivity and costs; Shaman and brew-enhanced berserker exceptions | Unlimited magical power trees |
| Inventory | Per-goblin Diablo-style grid with item sizes, equipment slots, manual equip, auto-equip policy and hauling/scavenging | Hundreds of object families |
| Combat | Real-time fixed ticks, melee animations, collisions/range, opposed attack/defence rolls, hitpoints and morale, retreat/death, simple projectiles | Full body-part combat, tactical turns, extensive spells |
| Enemies | One distinct, playable encounter pattern for each of the six hostile categories; bounded AI and raids | World-scale military campaigns |
| Treasure | Mundane to masterwork to enchanted; small procedural name/effect pool; rare unique relics, provenance, claims, recognition and return | Infinite combinations, deeply simulated metallurgy |
| Narrative | World hooks, event Chronicle, meaningful item history, faction knowledge/grudges and small goblin interpersonal incidents | Pre-simulated millennia of lore |
| Progress | Settlement development, succession over game-years, Overlord threat, possible abstract liberation expedition and victory vignette; continued sandbox afterwards | Playable multi-map tower siege |
| Delivery | Responsive desktop-first UI, accessibility basics, persistence, tested browser build, GitHub Pages/static deployment, help/credits | Cloud sync and native apps |

**Release-scale limits (initial targets, profile and tune):** target 40–80 active goblins in a normal mature settlement; a maximum of ~100 active locally simulated agents including visitors/enemies; bounded inventory/memory/event retention; one locally simulated region; off-map factions aggregated. These are engineering targets, **not** rigid game-world rules.

### Milestone progression

- **v0.1 — A Home in the Rock:** A cave, four goblins, excavation, hauling, beds, stockpile, food, save/load.
- **v0.2 — Goblins with Souls:** Humours, ambitions, memories, relationships, social stories, UI.
- **v0.3 — The Grotto Has a Government:** Chief, Shaman, laws/ownership, leadership interpretation and succession foundations.
- **v0.4 — The Hand of the Spirit:** Possession, costs, resentment/reverence, accessible combat-control prototype.
- **v0.5 — Shiny Things:** Inventory, equipment, crafting, loot, simple real-time battle, animal and adventurer encounters.
- **v0.6 — A Hostile World:** Six faction types, distinctive attacks, morale tactics, local outside area fully integrated.
- **v0.7 — History Has Teeth:** Named relics, provenance, knowledge propagation, diplomacy and uncompromising return/recovery claims.
- **v0.8 — Generations of Goblins:** Breeds, clans, lifecycle, family property/inheritance, faster time and multi-decade continuity.
- **v0.9 — The Tower's Shadow:** Captives/rescues, Overlord escalation, playable endgame goal, post-victory continuation.
- **v1.0 — First Release:** Usability, balance, art, testing, documentation, performance, accessibility and deployment.

These are **feature milestones**, not time estimates. Internal tag names can advance after each gate; don't force calendar deadlines.

---

## 2. World, camera and environmental model

### Coordinate, map and rendering contract

- **World logic:** integer `(x, y, z)` coordinates. `z` is always `0` in v1. APIs accept `z` so later levels won't require changing every data structure.
- **Region:** one active map with connected cave chambers and a small outside edge; no separate physics world for the surface. Beyond its boundaries is abstract regional context.
- **Camera:** fixed three-quarter/2.5D presentation; pan, zoom, click/select, drag and paint designations. Movement uses a **square logical grid**, not screen coordinates.
- **Art decision before production:** SPIKE two projections—(A) 64×32 diamond projected floor with 32×32 actors, (B) more JRPG-like oblique floors—and lock one in an ADR. Neither gameplay nor pathfinding depends on the projection.
- **Render depth:** stable sprite sorting by logical foot position/elevation proxy, wall/roof foreground handling, selection highlights, transparent occluders when necessary.
- **Pixels:** sprites are authored at native pixel dimensions; nearest-neighbour sampling and integer zoom where practical; don't blur pixels accidentally. Equipment icons are independently designed for inventory readability.
- **Tile states:** material, solidity, diggable hardness, stability support, wetness/soil use, deposits, occupant, placed structure, discovered/fog state. Separate terrain from constructed structure and resource deposit.
- **Map edge:** unexcavatable boundary band; designate legal surface/cave entrances and threat ingress routes. Don't trap the player with an unwinnable seed.

### Fiction-first materials

| Terrain | Goblin knowledge and gameplay | Simplification |
|---|---|---|
| Sand | Quick digging, poor support, possible falls/cave-ins | No grain simulation |
| Mud | Wet, slow movement, fertile for some growth | No fluid viscosity |
| Loose Rock | Easy digging, rubble drops, unstable passages | No real rock taxonomy |
| Hard Stone | Slow excavation, reliable walls, stone resource | One generic stone family |
| Bedrock | Very hard, durable, valuable defensive barrier | Not a geological cross-section |
| Impenetrable Stone | Map boundary or special immutable obstacle | Explicit gameplay boundary |

Additional **deposits/overlays**, not dozens of new geologies: iron/copper/gold-bearing patch, gem pocket, fungal soil, water pool/stream, ancient masonry, sealed vault and special/magical stone. Basic furnace recipes abstract raw ore + fuel to usable metal. Dwarven finest steel and elite elven artifice are **not** locally craftable; scavenging, trade, gifting, capture and recovery matter.

### Weather and ecology

- Simple regional weather state such as sunny/clear, rain, snow (optional cloudy transition), with seasons and probabilistic transitions; no meteorological grid.
- Weather affects the outside patch: visibility, movement, forage, fire risk or mood only when clear to the player. Caves remain comparatively sheltered.
- Local trees, edible plants, fungi, animals, burrows, nests and a few ecological pressures. Wildlife appears, forages, seeks shelter, defends territory, can be baited/repelled; domestication is a **SHOULD** at first release.
- World generation is **story-first**: choose seed + setting hooks, then layout, constraints, chambers, paths, deposits, resources, neighbouring factions and secrets; test reachability, food/start survival and route feasibility.
- Author small chamber archetypes: mushroom grove, animal den, ruin, old mine, underground pond, mysterious shrine, treasure vault. They establish possibilities; they must not force scripted outcomes.

### The wider world (abstract)

Store external settlements/factions as summaries: name, culture, rough strength, wealth, location/approach, attitude, unresolved claims, known history and pending actions. Only instantiate named external agents when they visit, raid, negotiate or matter to a story. Persist recurring elites, notable visitors and significant enemies. Distant individuals need not be simulated on every tick; a compact stable event record maintains consistency when they return.

---

## 3. The Goblin model: body, Soul, society and generations

### Character structure

A goblin has separate **identity**, **body**, **Soul**, **inventory**, **activities**, **kinship**, **social standing** and **spatial position**. The player's influence is not identical to its actual wishes. Traits are *influences*, not deterministic scripts.

**Soul (minimal but expressive):**

- **Four Humours:** sanguine (social/impulsive), choleric (assertive/ambitious), melancholic (careful/sentimental), phlegmatic (steady/relaxed). Four independent weighted values, not four exclusive classes; choose reactions contextually.
- **Attributes:** strength, agility, cunning, craft, sociability, courage. **Skills:** mining, hauling, farming, crafting, combat, ritual, leadership (use only skills with meaningful tasks).
- **Needs/mood:** hunger, rest, safety, belonging and enjoyment; temporary morale, fear and stress; physical hitpoints and wounds outside Soul.
- **Ambitions:** one or two active long-term desires; e.g. become Chief, own a golden spoon, befriend someone, build a great mushroom farm, rescue a relative.
- **Memories:** bounded significant events with source event ID, participants, emotional valence, salience and age; events are perceived differently by different goblins. Fade ordinary memories, retain formative ones.
- **Relationships:** sparse directed ties: kinship, trust, affection, friendship, debt, rivalry, resentment, respect. Don't maintain an all-to-all relationship matrix.
- **Possession:** receptivity, stability, devotion/interpretation, stress/identity strain, relevant lived memories; response depends on circumstances and character.

**Body / activities:** kind, age/life stage, injuries, movement speed, stamina, current job, gear, status, sleep/wake, work eligibility. Avoid tying temperament or morality rigidly to goblin kind.

### Goblin kinds, clans and reproduction

- v1 **common goblin**, **boggart**, **hobgoblin**: modest differences in build, movement/carrying ability, needs/aptitudes, presentation and cultural flavour; each capable of a wide range of personalities.
- **Clan** means kinship and tradition, not biological breed. Track family relationships, marriages/partnerships if included, offspring, inheritance, notable ancestors, clans' reputation and heirlooms; don't simulate genetics or reproductive physiology.
- Child, adult, elder; age at configurable game-calendar speed, eventual natural death and occasional childbirth/adoption. Children get safe roles and don't enter combat by default. Population growth is rate-limited and transparent.
- Chief/Shaman can die, resign, be replaced or deposed. Policy determines succession, with a simple selection/election/appointment system initially. The player's chosen candidate may not be universally accepted.
- Persist a **chronicle of significant generations** rather than every decision of every deceased person. Important ancestors remain discoverable in item histories and clan family trees.

### Event, memory and AI rules

1. World/action system emits typed meaningful events (e.g., `TileDug`, `GiftGiven`, `RelicRecognised`, `GoblinWounded`, `PossessionEnded`).
2. Eligible witnesses perceive events; information is **not globally omniscient**. Events may later propagate by speech, rumour or diplomacy.
3. Each perceiver evaluates a compact response using needs, temperament, memories, relationships, ambitions, local context and seeded randomness.
4. Updated Soul/relations may alter future choice weights, trigger a bounded memory, or generate a narrative Chronicle entry.
5. Activities use simple **utility scoring + task claims** and deterministic tie-breaks; reevaluate on meaningful changes or bounded intervals rather than all choices every render frame.
6. Expose a readable **"Why is this goblin doing that?"** panel (job, need, major modifiers); AI must be debug-friendly and understandable.

No real psychiatric labels for status effects. Use evocative in-world descriptions such as shaken, overwhelmed, haunted, distrustful or frenzied; consequences arise from fictional spirit magic, not a parody of mental illness.

---

## 4. Governance, property and the Spirit

### Chief and Shaman

Both offices are held by fully simulated goblins with Souls, reputations and competing desires.

- **Chief:** temporal authority over work/defence priorities, communal property, rationing, dispute mediation, diplomacy, appointments and succession.
- **Shaman:** spiritual authority over rites, ritual brewing, omens, healing, spiritual culture, interpretation of the player's influence, and special receptivity to possession.
- Player commands are **proposals/influences**, not guaranteed leader compliance. Each leader can faithfully implement, resist, reinterpret or enthusiastically over-fulfil them based on disposition, politics and perceived need.
- All deviations must have visible explanations and bounded practical effects. A contrary leader creates an interesting challenge, not an invisible broken user interface.
- The player may persuade, replace or depose leaders; deposition affects trust, clan politics, stability and future willingness to cooperate.
- Traditions may form around notable interventions: a festival, taboo, title of the Spirit, or remembered omen. Start with a small rule-based set, not generated scripture.

### Three control layers

1. **Policies:** standing permissions and conventions (rationing, working hours, loot allocation, armament, private vs communal property, leader authority).
2. **Designations:** mark tiles, buildings, production targets, guard points and stockpiles; goblins choose available tasks.
3. **Direct orders:** select a goblin/squad and request a specific action; it may be refused or deprioritised unless the player **possesses** the actor.

### Overlapping rights and property

An item may be **held by** one goblin, **owned by** another goblin or the grotto, **reserved for** a job/office, **treasured by** its holder, **inherited from** an ancestor, and **claimed by** an external faction. These are separate fields/relations. For v1, support legal owner, holder, reservation, attachment and ancestral claimant; extensible claims collection later. Theft, borrowing, gifts, confiscation, succession, diplomatic restitution and equipment allocation become meaningful actions.

### Spirit possession

- Any living goblin is a potential vessel. The selected goblin remains a person with a Soul before and after control.
- Possession switches input to **direct movement and actions** (mining/using/interacting; melee direction and target; release at any time) while the whole world continues in real time. Camera tracks the vessel. Clear indicator, escape/release key, and pause behavior.
- **Limits:** duration, cooldown or influence cost; vulnerability of unattended grotto; capacity/receptivity and impact on possessed goblin. No infinite free remote-control strategy.
- **Comfort/receptivity:** Shamans and designated mushroom-brew berserkers tolerate possession better; ordinary goblins may feel frightened, violated, honoured or confused. Temperament and history modify interpretation.
- **After-effects:** fatigue, temporary morale/stress changes, friendship/social responses, bounded long-term memory/identity strain under repeated coercion. No predetermined moral status for all possession.
- **Political cost:** repeatedly bypassing leaders may lower their legitimacy, increase communal fear or dependence, and shift traditions; optional earned Spirit epithets, not a mandatory good/evil meter.
- **Player character:** the player's supernatural identity emerges through choices. Avoid hardcoding a karma alignment that makes one playstyle canonical.

---

## 5. Inventory, crafting, artefacts and combat

### Inventory and equipment

- Each goblin has a **Diablo-like occupancy grid** (initial candidate: 6×4 cells, tune from playtests), with real item footprints (1×1 trinket, 1×2 dagger, 1×3 sword, 2×3 armour, etc.).
- Explicit named HTML UI controls; pointer drag/drop with keyboard alternative, tooltips, quick-move, weight/capacity, and no loss/duplication on cancellation.
- Equipment slots: head, body, hands, feet, main hand, off hand, amulet, two rings (trim if art scope demands). Show equipped vs carried vs stored clearly.
- Player can micro-equip favoured goblins; **role-based auto-equip and storage policy** prevents managing dozens of inventories by hand. Goblins may seek preferred possessions or contest ownership.
- Manufacturing is modest: tools, furniture, traps, food, basic armour, crude iron/copper items. Fine dwarven steel, the best human military equipment, unique elven enchants, infernal relics are faction advantages—not ordinary goblin recipe unlocks.

### Item generator and item history

Quality ladder: **crude → ordinary → fine → masterwork → enchanted → named relic** (quality and enchantment can coexist; don't enforce only linear statistical improvement). Each template has type, material, equipment slot/footprint, allowed effects and factions. Curated combinators yield names such as **The Chalice of Storms**, **The Dagger of Withering**, or dwarven **Grudgekeeper**. Magical effects should change play (storm at entrance, withering wound, bravery aura, cursed burden) rather than merely inflate numbers. V1 has a **small balanced set** of effects, with bounded charges/cooldowns and counters.

A unique item has a permanent ID and a concise **history log** of meaningful actions: forged, named, claimed, bestowed, carried, lost, looted, recognised, returned, destroyed, etc. Mundane items don't receive giant biographies unless they become legendary through an extraordinary event. Generate a small consistent backstory for an ancient relic on creation; subsequent events are actual simulation events.

**Knowledge matters:** an elven or dwarven claimant does not automatically know who holds its relic. Scouting, display, battle witnesses, trading, boasting, captured letters or returned survivors can propagate recognition. On credible recognition, a claim may become an active diplomatic demand/grudge. **An item-specific ancestral claim is resolved only if the rightful claimant recovers the exact item or the player returns it through diplomacy**; money, generic reputation or waiting cannot erase it. Non-ancestral relations can still improve independently. Ensure claimant identity and item instance IDs survive saves, transfer and generations.

### Real-time combat

- One fixed-step simulation clock (initial candidate **10–20 ticks/second**, measure before choosing). Rendering is interpolated independently. The game is **not turn-based**; no player-facing turns/AP.
- Agents approach/retreat, check range and clear line-of-sight, wind up attacks, perform a visible hit-frame with collision/reach validation, and cool down. Animation must not alter authoritative outcomes based on frame rate.
- Use **rolled attack vs rolled defence** (seeded RNG). On success, roll weapon damage minus mitigation; apply HP loss plus morale shock to target's Soul. Exact dice formula must be tested for clarity, lethality and gear asymmetry; avoid a huge matrix of body-part injuries.
- Morale depends on hits, allies, fear, leader survival, disposition, magic and relative strength; outcomes include fight, flee, surrender, rout and occasional capture. Thralls have low morale, champions can rally them.
- V1 includes melee, simple ranged projectile motion/impact, and **a few** effect-based magical attacks. Squad/guard designations plus possession provide tactical control; no per-swing player micromanagement requirement.
- Defence emphasises traps, doors, chokepoints, barriers, bait and lure tactics. Trap knowledge and avoidance distinguishes adventurers from ordinary beasts.
- Corpses, loot, recovery, captives, prisoner release and post-battle Soul memories matter. Provide safeguards against death spirals and unwinnable first raids.

### Enemy doctrine — six genuinely different threats

| Foe | Source / intention | Signature advantage | v1 behaviour and goblin response |
|---|---|---|---|
| Adventurers | Reach treasure / beat dungeon | Small elite parties, tactical skills | Enter known routes, disarm simple traps, heal/withdraw, steal and escape; decoys/ambushes counter them |
| Dwarven delvers | Wealth / ancestral claims | Finest steel, shields, engineers | Tunnel/breach from marked border approaches, retrieve named items, hold formation; countermining/chokepoints matter |
| Wild animals | Food / shelter / territory | Local ecology, instinct | Wander, nest, raid food, react to danger; fences, bait, deterrence and limited handling |
| Elven rangers | 'Purify' damaged land | Enchanted arms, stealth/ranged skill | Respond to ecological harm, scout from surface, raid with bows/magic; stewardship/concealment/diplomacy matter |
| Human armies | Eradication or political campaign | Numerous consistently better conventional arms | Supply-based attack waves, limited siege tools, abundant recoverable equipment; logistics/traps/guerrilla defence matter |
| Overlord thralls | Capture free goblins for the tower | Numerous badly equipped low-morale thralls; a dark hero/demon | Kidnap, drag away captives, commander morale effect; release/rescue, counterraids and liberation matter |

**Enemy 'difficulty' comes from tactics, motivation and gear, not only inflated HP.** Keep raids readable with advance warnings and fair counterplay. Enemies may withdraw, negotiate, or change objectives. External factions have stance/strength/knowledge summaries; only visiting combatants are simulated individually.

### Defeating the Overlord

The Overlord's distant tower is an abstract strategic location in v1. Through rescuing captives, weakening raids, obtaining intelligence, establishing alliances and equipping a free-goblin force, the player unlocks a **Liberation Expedition**. It resolves using transparent, seeded strategic calculations and named expedition members, produces a Chronicle entry and short in-engine vignette on victory, and marks the Overlord defeated. **The grotto remains playable afterwards.** A fully playable tower mission is a FUTURE expansion, not required for v1.

---

## 6. Technical architecture and maintainability

### Recommended stack (re-check stable package versions when scaffolding)

- **TypeScript**, strict mode, ES modules; **Vite** (`vanilla-ts`) for dev/build and static hosting.
- **PixiJS** as a dedicated pixel-art 2D renderer, prioritising the production-ready **WebGL** backend. Isometric projection, hit-testing and draw sorting are our own small adapters. Avoid a full scene/physics framework unless a spike proves it necessary.
- **HTML + CSS** for semantic, accessible UI/panels/tooltips/inventory; game canvas for world. No React/Vue dependency in v1 unless complexity genuinely warrants it.
- **Vitest** (headless simulation/unit tests); **Playwright** (browser input, save, UI/accessibility smoke, screenshot regression where stable); ESLint + Prettier or Biome (choose one formatting/linting stack, documented in ADR); `tsc --noEmit` on CI.
- **IndexedDB** for autosaves with import/export of versioned JSON save files; optional compression after profiling. Local-only, offline-capable static game. Make PWA installation a SHOULD, not blocking v1.
- GitHub Actions CI and GitHub Pages preview/release (correct Vite base path and asset paths).
- **PixelLab** for style-consistent goblin, enemy, terrain, effects, UI and equipment assets; curate/edit/validate exported sprites and animations, pin game-ready PNG atlases in repo. Verify service terms and retain asset origin records; don't assume reference artwork or third-party IP is reusable.

**Current docs for tool choices:**

- Vite: https://vite.dev/guide/
- PixiJS: https://pixijs.com/guides/components/renderers/ and https://pixijs.io/docs/
- PixelLab: https://www.pixellab.ai/

### Module boundaries

```text
/
├── PLAN.md                     # This file: scope, gates, milestone checklists
├── README.md                   # Overview, controls, getting started, screenshots
├── LICENSE                     # Choose repository licence explicitly
├── package.json
├── index.html                  # Semantic application shell
├── src/
│   ├── main.ts                 # Bootstrap/composition only
│   ├── app/                    # UI state, input routing, menu/game orchestration
│   ├── core/                   # Pure types, seeded RNG, clock, IDs, event contracts
│   ├── sim/
│   │   ├── world/              # Terrain, chambers, worldgen, weather, pathfinding
│   │   ├── actors/             # Goblins, Souls, needs, AI, memories, generations
│   │   ├── tasks/              # Orders, priorities, reservations, jobs
│   │   ├── society/            # Leaders, laws, property, clans, factions
│   │   ├── economy/            # Items, inventory, production, storage, loot
│   │   ├── combat/             # Hit checks, damage, morale, traps, raids
│   │   ├── spirit/             # Influence, possession, spiritual fallout
│   │   ├── narrative/          # Events, Chronicle, item histories, knowledge
│   │   └── systems/            # Ordered simulation update pipeline
│   ├── render/                 # Pixi adapter, projection, sprites, depth, camera
│   ├── ui/                     # DOM components + CSS, accessible controls
│   ├── persistence/            # Save/load, schema migrations, validation
│   └── data/                   # Typed content: materials, items, roles, encounters
├── public/assets/             # Published curated pixel-art atlases/audio
├── tools/                     # Asset validators, deterministic sim probes
├── tests/                     # Unit/integration/browser fixtures
└── docs/
    ├── adr/                   # Concise architecture decisions (numbered)
    ├── ART_BIBLE.md            # Projection/palette/sprite standards
    ├── BALANCE.md              # Formulae, tuning, max entity counts
    └── RELEASE.md              # Shipping process and manual smoke checklist
```

Adjust folder depth only when a real feature warrants it. Avoid empty placeholder files/packages.

### Simulation contract

- A single **`GameState`** owns deterministic data: seed/PRNG state, calendar/tick, active region, entities, materials/stockpiles, policy state, faction summaries, significant persistent events and UI-relevant notifications.
- An ordered **fixed-step update pipeline** processes commands → reservations/jobs → actor movement/actions → combat/ecology → events/Souls/factions → cleanup. Sorting and RNG use stable deterministic ordering.
- The renderer only **reads snapshots**, subscribes to visual events, and turns player input into commands. It must never decide damage, births, ownership changes, etc.
- UI doesn't mutate simulation state directly: typed `Command` objects cross the boundary. Report accepted/rejected commands (with reason); permit pause/speed changes.
- Distinguish `EntityId`, `ItemId`, `FactionId`, `ClanId`, `EventId`, `JobId`; stable references prevent history and save corruption.
- Store a **bounded global Chronicle** of significant events and limited personal memories; materialise descriptions from structured events so text can be localized/varied later. Don't let a replay/event log grow indefinitely.
- Pathfinding starts with deterministic grid A* and cached/reused flood fill for common routes. Mark changed regions dirty rather than recomputing routes for every actor every tick.
- `Position` includes `z: number` (zero in v1); navigation uses a neighbour service so stairs/vertical links can be added later. Do **not** build vertical AI/pathfinding yet.
- Render smooth sprite interpolation between ticks, cap frame delta on resume, pause on hidden tab or catch up conservatively. Simulation should produce the same outcome when run headlessly.
- Save as **versioned snapshot** plus critical unresolved historical claims; validate and migrate. RNG state, IDs, task reservations, actor states and pending events must survive round-trip. No hard dependence on DOM/Canvas/Date.now() in sim code.

### Testing and performance contracts

- **Unit:** seeded RNG, map reachability, pathfinding, terrain support, task/reservation exclusivity, needs & AI decisions, memory limits, ancestry, inheritance, item grid collision, equipment rules, combat, morale, leader deviation, claim recognition, save migration.
- **Integration:** 4 goblins survive/dig/build/eat/rest for simulated days; no dupe/loss of items after haul/equip/save; 50+ agents can work/raid coherently; grave events persist after years; possession start/end and release work.
- **Property/invariant tests:** no double-held item, no negative inventory cell, no two tasks reserving a unique resource simultaneously, no invalid actor coordinates, no broken faction claim after transfer, no dangling ancestral IDs without tombstones/records.
- **Determinism:** same version + seed + command sequence yields same canonical state hash in headless replay. Separate cosmetic randomness; save RNG explicitly.
- **Performance:** profile ~96×96 region with 60 goblins + 30 active visitors and normal object count; target 60 FPS rendering on representative mid-range desktop and enough fixed-step headroom to avoid falling behind. Record actual environment/metrics; don't claim success from empty scenes.
- **Browser:** Chromium + Firefox + WebKit where practical; keyboard and mouse; clear errors when WebGL unavailable; basic focus, contrast, reduced motion and screen-reader access to menus/status panels.

### Version control discipline

1. `main` is always runnable and green. Work on **one small issue/branch at a time** (`feat/gg-032-pathfinding`, `fix/gg-071-item-transfer`). Merge via PR where practical, even for a solo project.
2. Each checklist ID below should usually produce **one focused commit or short PR** (a test + implementation + docs together is ideal). Split only if acceptance remains verifiable; don't combine unrelated tasks.
3. Commit convention: `type(scope): action`—e.g., `feat(world): add seeded cave chambers`, `test(sim): cover duplicated resource reservations`, `docs(plan): record projection decision`.
4. Before merge: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run build`; browser smoke when rendering/input/persistence changes. Add scripts only when implemented.
5. Every completed milestone creates a `v0.x.0` Git tag, short changelog, screenshot/video and known-issues note. Prefer small fix tags `v0.x.y` without feature churn.
6. Each nontrivial design change gets a brief `docs/adr/NNNN-*.md`: context, decision, rejected alternative, consequences. Record art/licensing provenance and generated seeds for reproduction.
7. Check off a task *in the same PR* that completes it. Do not check off work based on scaffolding alone. Review v1 **MUST/SHOULD/FUTURE** boundaries after each tag.
8. No enormous "implement simulation" commits; no untested direct edits to saves; avoid auto-generated source or assets that aren't reproducible/documented.

---
## 7. Incremental implementation roadmap

**How to use:** Every `GG-###` item is intended as a focused GitHub issue/commit or small PR. Work in order unless a stated prerequisite is already met. A checked item means the feature is actually usable **and tested**, not just that files exist. Tests and docs belong to the same change wherever possible. Milestone gates are **release acceptance conditions**; don't tag a version until its gate passes.

### M00 — Repository and simulation foundation

**Goal:** A clean, reproducible, testable TypeScript project, able to run a headless seeded tick loop. **Prerequisite:** none.

- [x] **GG-001 — Initialise repository.** Add `PLAN.md`, basic `README.md`, `.gitignore`, licence decision, `.editorconfig`, branch protection guidance and issue templates. **Done:** fresh clone shows clear setup instructions and no accidental generated files.
- [x] **GG-002 — Scaffold Vite + strict TypeScript.** Use `vanilla-ts`, pin a lockfile and supported Node version (`.nvmrc` or `engines`). **Done:** `npm install`, `npm run dev` and `npm run build` succeed in a clean clone.
- [x] **GG-003 — Configure code quality.** Choose a single linter/formatter stack; add `typecheck`, `lint`, `format:check`. **Done:** CI-quality checks run locally and reject a known bad fixture.
- [x] **GG-004 — Add unit test harness.** Configure Vitest, headless mode and minimal test helpers. **Done:** `npm run test` runs at least one real assertion without browser APIs.
- [x] **GG-005 — Introduce stable identifiers and common types.** Branded or clearly distinct IDs; `Position {x,y,z}`, time/tick, directions, result/error. **Done:** no entity identity depends on array index or display name.
- [x] **GG-006 — Add deterministic random generator.** Seed, serialisable state, weighted choice and range helpers; separate cosmetic RNG. **Done:** same seed produces repeatable sequences and restored stream continues exactly.
- [x] **GG-007 — Implement fixed-step headless clock.** Step, pause, speed multiplier, deterministic scheduler and max catch-up policy. **Done:** 1000 headless steps produce the same state independent of render rate.
- [x] **GG-008 — Define `GameState` and command boundary.** `createGame(seed)`, `dispatch(command)`, `step()`; typed accepted/rejected results. **Done:** simulation cannot import PixiJS, HTML or DOM globals.
- [x] **GG-009 — Implement typed event bus and Chronicle foundations.** Strongly typed events, event IDs, game timestamps and bounded retention. **Done:** a command produces a verifiable event; malformed references are rejected.
- [ ] **GG-010 — Add canonical snapshot hashing/replay fixture.** Record seed and commands, compare serialisable state. **Done:** same inputs = same checksum; different command produces explainable difference.
- [ ] **GG-011 — Wire GitHub Actions.** Install, typecheck, lint, test and build on PR/push; cache dependencies without committing generated output. **Done:** intentional failure blocks merge.
- [ ] **GG-012 — Record architecture decisions.** Initial ADRs for fixed-step sim, renderer separation, no framework UI and save strategy. **Done:** each ADR lists alternatives and trade-offs, not just conclusions.

**Gate M00:** A contributor can clone and run a deterministic headless game loop; CI is green. No gameplay is required yet.

### M01 — Camera, projection, pixel-art UI and input

**Goal:** The player can navigate and select a simple single-level grotto. **Depends on:** M00.

- [ ] **GG-013 — SPIKE projection with two miniature scenes.** Compare JRPG oblique vs 64×32 isometric floor for 32×32 goblins; include walls, overlap and item click tests. **Done:** screenshots and pros/cons documented; choose one in ADR/ART_BIBLE.
- [ ] **GG-014 — Integrate PixiJS WebGL.** Resize-aware canvas, nearest-neighbour pixel art, lost-context/error state. **Done:** demo renders on desktop and fails helpfully without usable WebGL.
- [ ] **GG-015 — Build logical-to-screen projection adapter.** Project/unproject and tile hit-testing separated from world coordinates. **Done:** roundtrip tests cover edges, negative values and camera zoom.
- [ ] **GG-016 — Implement camera controls.** Pan/drag, wheel/keyboard zoom, bounds, reset and focus-on-entity. **Done:** navigation remains stable after resize and pause.
- [ ] **GG-017 — Render a simple tile field.** Solid/floor tiles, visible grid and hover. **Done:** a 64×64 map is visible without per-tile HTML elements.
- [ ] **GG-018 — Implement depth and occlusion.** Sort by logical feet/structure depth, fade selected foreground walls, preserve correct click targets. **Done:** a goblin behind walls remains selectable by deliberate reveal mode.
- [ ] **GG-019 — Add scene/entity selection.** Click tiles, goblins and structures; consistent selected/hovered highlights. **Done:** selection is independent of sprite transparency and zoom.
- [ ] **GG-020 — Build semantic UI shell.** Top resource/status bar, tool rail, right inspector, Chronicle drawer, help and pause controls in HTML/CSS. **Done:** keyboard tab navigation works outside canvas.
- [ ] **GG-021 — Add interaction state machine.** Inspect/dig/build/stockpile/guard/possess tool modes; only inspect enabled at this stage. **Done:** Escape exits modes safely and pointer state cannot stick.
- [ ] **GG-022 — Create first PixelLab art bible.** Palette, 32×32 character footprint, orientations, origin points, frame timing, floor projection, outlines, light/shadow, icon scale and export rules. **Done:** `docs/ART_BIBLE.md` includes actual reference sprites and validation checklist.
- [ ] **GG-023 — Import first curated art atlas.** Goblin idle/walk placeholders, six terrain visuals, entrance, mushroom, tree; no copyrighted third-party assets. **Done:** manifest resolves without missing assets and supports hot art swaps.
- [ ] **GG-024 — Add rendering/browser smoke.** Playwright opens scene, selects tile, pans/zooms and detects no uncaught errors. **Done:** CI includes one real graphical interaction test.

**Gate M01:** A coherent, beautiful-enough **single-level map viewer** with reliable pointer/keyboard controls. No simulation-to-render circular dependency.

### M02 — Story-first cavern generation and nearby surface

**Goal:** Generate interesting and playable goblin homes, not geological textbooks. **Depends on:** M01 + `GG-006`.

- [ ] **GG-025 — Define typed terrain material registry.** Sand, mud, loose rock, hard stone, bedrock and impenetrable stone; hardness/stability/drop/movement rules. **Done:** gameplay queries use properties, never material-name string comparisons.
- [x] **GG-026 — Split tile data into terrain, deposit, constructed structure and visibility.** **Done:** placing a chair does not replace the underlying floor material.
- [x] **GG-027 — Generate seeded caverns.** At least two irregular connected rooms, tunnels, rock walls, a safe starting area and an entrance. **Done:** reproducible world hashes and all starting goblins can reach food/exit.
- [ ] **GG-028 — Place chamber archetypes and discoveries.** Fungal grove, beast den, ruins, old mine, water feature or shrine chosen by seed. **Done:** each generated site has flavour text/visible affordance and does not trap the start.
- [x] **GG-029 — Generate compact outdoors.** Small hillside/forest strip accessible from entrance: trees, undergrowth, stones, traveller approach and boundary. **Done:** goblins can path from starting cavern to a surface forage location.
- [ ] **GG-030 — Add resource/deposit overlays.** Iron/copper/gold, gems, wood, edible fungi, forage and occasional ancient masonry. **Done:** deposits are inspectable without defining dozens of rock types.
- [ ] **GG-031 — Add fog of war / discovery.** Unknown chambers, discovered features and known terrain tracked per settlement. **Done:** player does not see unrevealed relics, but known paths remain visible.
- [ ] **GG-032 — Add material strength/support rules.** Loose materials next to excavations may create a small, telegraphed cave-in; no particle-based physics. **Done:** supports/collapses are deterministic and avoid instant unfair colony wipe.
- [ ] **GG-033 — Build reachability and validation pass.** Connected spawn, legal buildable floor, food access, entrances, meaningful resource placement. **Done:** automated batch of 1,000 seeds meets invariants, reports failing seed.
- [ ] **GG-034 — Add simple calendar/weather state.** Seasons and clear/rain/snow probabilities with outside-only modest effects. **Done:** repeatable weather transitions and visible indicator; no detailed atmosphere grid.
- [ ] **GG-035 — Implement region-level pathfinding service.** A* or suitable grid search, obstacles, occupied-cell tolerance and cached paths on terrain changes. **Done:** navigation tests cover cave tunnel, exterior entrance and newly dug shortcut.
- [ ] **GG-036 — Add new-world seed/config UI.** Choose seed, generate, restart and display seed for bug reporting. **Done:** same seed/config reproduces layout across reload.

**Gate M02:** Multiple seeds give distinctive, accessible, believable caves and a modest outside world; no modern geological classifications appear in goblin-facing UI.

### M03 — Autonomous goblin locomotion and basic labour

**Goal:** Four individual goblins can be given useful work. **Depends on:** M02.

- [ ] **GG-037 — Spawn four stable goblin entities.** Names, kinds, basic sprite directions, position and IDs. **Done:** they persist independently of selection/renderer.
- [ ] **GG-038 — Implement walking and occupancy.** Path following, obstruction/replan, smooth interpolation and four-direction (or art-consistent) walk cycles. **Done:** no walking through sealed stone or stacking at the entrance indefinitely.
- [x] **GG-039 — Define task/job data model.** Designation → open job → eligibility → reservation → progress → completion/cancellation. **Done:** tasks have status and failure reason in inspector.
- [ ] **GG-040 — Implement task priorities and utility selection.** Proximity, suitability, urgency, needs and small seeded variation. **Done:** workers distribute rather than all pursuing one job; explain major choices.
- [ ] **GG-041 — Implement tile excavation.** Player paints dig designations, miners approach, progress by hardness and remove tile. **Done:** hard stone is slower, impenetrable stone rejects designation.
- [x] **GG-042 — Spawn rubble/ore drops.** A tile may yield one or several resource stacks and history event. **Done:** drops have independent object IDs and no duplication across replays.
- [x] **GG-043 — Implement resource carrying.** Pick up, move and put down one/small stack, correct ownership/holder transitions. **Done:** an interrupted haul returns item to a recoverable state.
- [ ] **GG-044 — Implement stockpile designation.** Mark floor area, accept/filter goods, trigger hauling opportunities. **Done:** inventory of world objects and stockpile quantities match after moving.
- [ ] **GG-045 — Make work interruptible.** Pause, direct cancel, danger, blocked path and urgent needs release reservations. **Done:** no indefinitely locked item or tile.
- [ ] **GG-046 — Add direct non-possession order.** Select goblin and request dig/haul/go-to; acceptance visible. **Done:** it respects legality, capability and task reservation.
- [ ] **GG-047 — Add basic sprite task animations.** Walk, idle, mine, haul; correct facing and action event timing. **Done:** animation does not advance jobs without sim ticks.
- [ ] **GG-048 — Build job/worker inspector and debug overlay.** Show pending work, chosen task, reason, nav target, path failures. **Done:** a stuck worker can be diagnosed in-game.

**Gate M03:** Designating a tunnel causes autonomous goblins to excavate and move mined materials into a stockpile without per-goblin micro.

### M04 — Shelter, food, economy and persistent game (**v0.1**)

**Goal:** A genuine, small colony loop, saved and resumed. **Depends on:** M03.

- [ ] **GG-049 — Add needs (hunger, fatigue, safety).** Bounded values, recovery/decay and clear feedback; effects on decisions. **Done:** needs influence AI and are visible.
- [ ] **GG-050 — Implement sleeping and beds.** Buildable simple beds, reservation, rest at night/when exhausted; fallback sleeping on floor. **Done:** no infinite simultaneous claims to one bed.
- [x] **GG-051 — Add forage gathering and eating.** Outdoor edible plants and underground mushrooms, carried/stored food, hunger reduction. **Done:** goblins can feed themselves when food and path exist.
- [x] **GG-052 — Implement mushroom patch.** Assign fertile patch; growth timer, harvest, replant/maintenance. **Done:** a stable, understandable food cycle sustains four goblins.
- [ ] **GG-053 — Build simple structures.** Blueprint, material reservation, construction progress; entrance door, bed, stockpile container and basic wall. **Done:** missing resources display clearly; refund/release on cancel.
- [x] **GG-054 — Add starter workshop and recipes.** Convert rock/wood into a few furnishings/tools; job selection integrates with labour. **Done:** at least one full gather → craft → use loop.
- [x] **GG-055 — Add minimal resource dashboard.** Food, wood, loose stone, ore and items in storage; no invisible double counting. **Done:** quantities reflect actual stockpiles and carried/staged items.
- [ ] **GG-056 — Build save schema/version.** Serialize world, seed, RNG, goblins, tasks, resources, calendar, reservations, event IDs. **Done:** save is pure validated data, not a Pixi snapshot.
- [ ] **GG-057 — Implement save/load in IndexedDB.** Manual slots, autosave interval, save errors and migration placeholder. **Done:** reload restores running tasks and no items disappear/duplicate.
- [ ] **GG-058 — Export/import human-portable saves.** Version identification, validation, helpful unsupported version message. **Done:** exported save imports in a fresh browser profile.
- [ ] **GG-059 — Add game-speed and basic onboarding.** Pause/1×/2×/4×, simple guided hints, help overlay. **Done:** player can learn to dig and eat without documentation.
- [x] **GG-060 — Run headless colony endurance test.** Simulate days with four goblins on several fixed seeds. **Done:** no deadlock, runaway hunger with adequate supplies, or invalid entities.
- [ ] **GG-061 — Package and tag v0.1.0.** Update README, controls, limitations, screenshot/GIF, changelog, hosted preview. **Done:** an outsider can make a four-goblin settlement and reload it.

**Gate v0.1:** **A Home in the Rock** is fun for 10–20 minutes: dig, build, feed, rest, automate hauling, save/reload. Bugs are reproducible by seed + save.

### M05 — Souls, ambitions, relationships and stories (**v0.2**)

**Goal:** Goblins are recognisable people, not identical workforce tokens. **Depends on:** v0.1.

- [ ] **GG-062 — Define Soul component and four-humour model.** Independent sanguine/choleric/melancholic/phlegmatic tendencies and basic attributes. **Done:** generated goblins show differing but intelligible choices.
- [ ] **GG-063 — Add traits and skills.** Handful of traits; skill practice improves actual job performance with caps. **Done:** no hidden random bonuses without UI explanation.
- [ ] **GG-064 — Add belonging/enjoyment and mood.** Food/rest/safety remain distinct; local ambience and social interaction affect wellbeing. **Done:** observable behaviour changes, not just decorative numbers.
- [ ] **GG-065 — Add bounded needs-driven leisure.** Conversation, play, celebration/rest and preference for comfortable spaces. **Done:** non-working behaviour exists without starving the colony.
- [ ] **GG-066 — Generate one or two ambitions per goblin.** Want a trinket, become renowned, master a skill, befriend another, build a home. **Done:** aspirations motivate tangible choices and can be fulfilled.
- [ ] **GG-067 — Add sparse social relationships.** Trust/liking/rivalry/kinship with directed edges and no all-pairs tick. **Done:** social choices change after meaningful events.
- [ ] **GG-068 — Add perception/witness rules.** Nearby sight/hearing and shared conversations determine who knows about an event. **Done:** sleeping goblins do not magically remember an unseen theft.
- [ ] **GG-069 — Add salience-bounded memories.** Record significant personal events, interpret by temperament and relationships, fade minor records. **Done:** memory counts stay within configured limits over simulated years.
- [ ] **GG-070 — Implement social incidents.** Theft, jokes, favours, arguments, gifts, gratitude and grudges from simple rules. **Done:** at least three story types arise naturally from different seeds.
- [ ] **GG-071 — Build goblin character panel.** Portrait, Soul, humours, abilities, needs, mood, relationships, memories and ambitions. **Done:** tooltips explain behaviours without jargon.
- [ ] **GG-072 — Build chronological story journal.** Events filtered by character, clan, item, location and faction when identifiers exist. **Done:** entries persist and link back to still-existing entities or historical records.
- [ ] **GG-073 — Add Soul determinism/story tests.** Different temperament weights change outcomes; same seed and orders remain repeatable. **Done:** no all-knowing rumours; no unbounded memory growth.
- [ ] **GG-074 — Tag v0.2.0.** Document emerging stories and player-facing needs; fix confusing AI explanations before release. **Done:** playtesters can tell goblins apart and recall a story.

**Gate v0.2:** At least one organic, non-scripted personal story occurs in a 30-minute playtest; the player can understand why.

### M06 — Chief, Shaman, property and institutional resistance (**v0.3**)

**Goal:** A living community with real governance and meaningful personal property. **Depends on:** v0.2.

- [ ] **GG-075 — Add offices and eligibility.** Chief and Shaman are existing goblin entities, with office powers and vacancies. **Done:** office follows named living goblin, not a separate omnipotent NPC.
- [ ] **GG-076 — Add basic office selection/appointment.** Initial Chief/Shaman plus simple community acceptance/legitimacy. **Done:** empty office can be filled without creating duplicate goblins.
- [ ] **GG-077 — Define policy registry.** Rations, labour, equipment allocation, private/common goods, guard priorities, stewardship. **Done:** switching policy changes legal possibilities immediately and visibly.
- [ ] **GG-078 — Add leader evaluation of proposals.** Comply/resist/reinterpret/over-fulfil bounded commands using Soul, situation and legitimacy. **Done:** UI displays what actually happened and why; never silently ignores commands.
- [ ] **GG-079 — Add leader-deviation event cases.** Risky food export, too many militia, an overenthusiastic fortification, a modified festival or rite. **Done:** at least one case for each reaction mode is tested.
- [ ] **GG-080 — Implement personal/communal ownership rights.** Owner, holder, reservation, attachment, claimant all distinct. **Done:** a reserved shared sword is not automatically owned by its bearer.
- [ ] **GG-081 — Add gifts, borrowing and theft.** Legal transfer, illicit take, knowledge/witness and Soul responses. **Done:** recoverable stolen objects don't duplicate across inventories.
- [ ] **GG-082 — Add simple property disputes.** Chief mediates or refuses; outcome affects attitudes and trust. **Done:** conflicts generate traceable events and consequences.
- [ ] **GG-083 — Add deposition/replacement.** Player can remove either office-holder with unrest/acceptance consequences. **Done:** no state corruption on deposition during a job or illness.
- [ ] **GG-084 — Implement first shamanic rite/interpretation.** Shaman interprets an omen or significant event as a tradition/ritual opportunity. **Done:** the rite affects a small genuine mechanic and Chronicle.
- [ ] **GG-085 — Add governance/ownership panels.** Policies, office-holders, legitimacy, estate stores and disputed items; inspect why an order changed. **Done:** consequences are announced, not hidden.
- [ ] **GG-086 — Test authority and title invariants.** One Chief, one Shaman, legitimate transfer, law changes, contentious property, save round-trip. **Done:** no holder/owner confusion.
- [ ] **GG-087 — Tag v0.3.0.** Demonstrate at least one leader refusing/reinterpreting and one property dispute in reproducible seed. **Done:** the grotto has politics, not merely job assignments.

**Gate v0.3:** Player guidance competes with leaders' judgement; deposition has a cost. Goblin possessions can cause meaningful disputes.

### M07 — Spirit possession and spiritual cost (**v0.4**)

**Goal:** Possession is a satisfying, tempting alternative to delegation. **Depends on:** v0.3, character Soul, input layer.

- [ ] **GG-088 — Define possession state and command rules.** Target, duration, cost/cooldown, interrupt/release, safety validation and save semantics. **Done:** only one local vessel at a time; release restores normal autonomy.
- [ ] **GG-089 — Add click/select/possess and direct movement.** Camera follow, keyboard movement and clear input-mode indicator. **Done:** release/Escape/pause works even when action is underway.
- [ ] **GG-090 — Implement possessed work interaction.** Approach, dig, gather, haul or use object using the same simulation rules as AI. **Done:** no free instant work and no bypass of collision/material cost.
- [ ] **GG-091 — Add Soul response on entry/exit.** Receptivity, devotion, stability, fatigue, immediate mood and possession memory. **Done:** two goblins react differently with the same player action.
- [ ] **GG-092 — Implement forced/repeated possession strain.** Temporary shaken/frightened/haunted effects and long-term significant history under abuse. **Done:** costs stack within caps, decay/recover with time where appropriate.
- [ ] **GG-093 — Add Shaman receptivity.** Role/training reduces stress and may create visions/ritual opportunities. **Done:** benefit is noticeable but doesn't make Shaman an invincible pawn.
- [ ] **GG-094 — Add mushroom-brew berserker ritual.** Obtain/build brew; willingly receptive combat state with temporary courage and post-effect exhaustion. **Done:** drink is consumable and consequences are legible.
- [ ] **GG-095 — Implement peer/leader reaction.** Witnessed possession alters trust, reverence, alarm or leadership legitimacy. **Done:** repeated bypassing of authority has a social signal.
- [ ] **GG-096 — Add accessible possession overlay.** Timer/cost/release/controls, reduced camera motion option and visible hazards. **Done:** mode can't be confused with ordinary orders.
- [ ] **GG-097 — Handle edge cases.** Death/unconsciousness while possessed, save/load, rapid swaps, blocked path, inaccessible target, lost canvas focus. **Done:** no stranded control state.
- [ ] **GG-098 — Test coercion and autonomy recovery.** Headless scripted possession plus browser input tests. **Done:** nonpossessed AI keeps acting; former vessel resumes sane task selection.
- [ ] **GG-099 — Tag v0.4.0.** Produce a tiny story of useful intervention and adverse psychological/social effect. **Done:** the Spirit feels powerful but not cost-free.

**Gate v0.4:** Player can personally move and work through a goblin without breaking the colony simulation, and the event changes that goblin's lived experience.

### M08 — Item economy, equipment and Diablo-style inventory (part of **v0.5**)

**Goal:** Objects become physical, desirable possessions that goblins carry, equip and fight over. **Depends on:** ownership and work loops.

- [ ] **GG-100 — Build item registry and stable instances.** Templates vs instances, material, quality, footprint, weight, slots, durability, attributes and optional effect ID. **Done:** one template yields multiple distinct object IDs.
- [ ] **GG-101 — Implement 2D inventory occupancy.** Place, rotate **only if supported and useful**, move, merge/split stacks, quick-transfer; no overlap/out-of-bounds. **Done:** exhaustive small-grid packing tests pass.
- [ ] **GG-102 — Add per-goblin inventory persistence.** Held, carried, equipped and stockpiled object relationships share one authoritative ownership/holding API. **Done:** transfers don't make duplicate item instances.
- [ ] **GG-103 — Build attractive inventory panel.** Diablo-like grid, paper-doll/equipment silhouette, item icons, tooltip/stats, drag/drop and keyboard controls. **Done:** mouse and keyboard both equip a sword reliably.
- [ ] **GG-104 — Add functional armour/weapons slots.** Legal hands/shields, gear bonuses, restrictions by physical form, visual equipment state. **Done:** illegal combinations reject with reason.
- [ ] **GG-105 — Implement auto-equipping policies.** By work/role (militia/worker/guard) and quality thresholds; protect manually locked treasured items. **Done:** outfitting a small guard squad doesn't require individual clicks.
- [ ] **GG-106 — Add simple forge/furnace and recipes.** Fuel + common ore → basic ingot → crude weapon/tool; dwarven elite steel remains unobtainable via standard recipe. **Done:** one crafting pipeline produces equippable gear.
- [ ] **GG-107 — Add degradation/repair and resource salvage.** Tiny number of wear states, repair recipes and salvage on recovery. **Done:** equipment is neither infinitely indestructible nor irritatingly fragile.
- [ ] **GG-108 — Implement item claiming and preferences.** Personal trinkets, communal arms, gifts, refusal to surrender cherished item; integrate with disputes. **Done:** owner, holder and claimant stay distinct through every transfer.
- [ ] **GG-109 — Add battle-loot pickup and scavenger task.** Collect from dead or abandoned gear, carry to stockpile, equip under policy. **Done:** equipment doesn't instantly teleport to the player.
- [ ] **GG-110 — Create PixelLab equipment/UI asset set.** Consistent icons for 10–20 starter items, weapon/armour presentation, UI border/panel kit. **Done:** no fuzzy scaling, missing anchor data or untracked licenses.
- [ ] **GG-111 — Run inventory integrity tests.** Exhaustive equip/unequip, stolen item, save/load, overweight and full-grid failure. **Done:** no impossible object states under repeated quick moves.

**Gate M08:** Select a goblin, inspect their belongings, give them armour and a weapon, see the same physical item stored, carried and equipped.

### M09 — Real-time combat, defence and morale (**v0.5**)

**Goal:** A first satisfying encounter: outthink an intruder with traps and desperate goblins. **Depends on:** M08 + Spirit input.

- [ ] **GG-112 — Implement combatant capability model.** HP, reach, accuracy, defence, armour, cooldowns, morale, stance and target. **Done:** combat data independent of sprite animation files.
- [ ] **GG-113 — Add attack intent and windup/cooldown.** Real-time fixed ticks, action legality and readable swings. **Done:** attack frequency independent of render FPS.
- [ ] **GG-114 — Implement seeded opposed attack/defence rolls.** Clear hit/miss/damage log and balance constants file. **Done:** reproducible combat tests from seed.
- [ ] **GG-115 — Add physical collision/target range.** Spatial body occupancy, valid melee contact and walls blocking attacks. **Done:** no striking through bedrock or across the region.
- [ ] **GG-116 — Apply HP damage and Soul morale shock.** Armour mitigates; fear and ally/leader events influence morale, distinct from health. **Done:** an unharmed but frightened combatant may flee.
- [ ] **GG-117 — Build combat behaviour FSM.** Patrol/approach/attack/retreat/flee/surrender with bounded target evaluation. **Done:** no immediate target switching every tick.
- [ ] **GG-118 — Add militia/guard policy and rally positions.** Designate defenders, guard points, avoidance/engagement priorities. **Done:** unassigned workers can seek shelter during an alert.
- [ ] **GG-119 — Add traps and simple defences.** Spike pit, barricade/door, trigger state, disarmability and repair. **Done:** an enemy can be lured into a useful choke.
- [ ] **GG-120 — Add projectiles.** Bow/sling throw with visible travel, blocked trajectory and authoritative hit resolution. **Done:** no double-impact, through-wall missile or frame-rate bias.
- [ ] **GG-121 — Add possession combat controls.** Select target/aim, move and attack as vessel, obey same windup/damage rules. **Done:** possession grants precision, not invulnerability.
- [ ] **GG-122 — Add death, incapacitation, flee and loot.** Safe entity removal, item drops, significant memories and Chronicle event. **Done:** death mid-haul/possession/office leaves no dangling reservation.
- [ ] **GG-123 — Build battle UI and warning.** Incoming danger, health/morale, orders, arrows/impact feedback and readable combat log. **Done:** player can understand why a goblin fled or was wounded.
- [ ] **GG-124 — Introduce beast + adventurer encounters.** One animal intrusion and one small adventurer party; intruders can target food/treasure and retreat. **Done:** the two types pursue different objectives.
- [ ] **GG-125 — Balance/tutorial encounter.** First enemy telegraphed with enough time to respond; demonstrate lure/trap/guard. **Done:** victory via tactics; losses do not automatically cascade to instant total collapse.
- [ ] **GG-126 — Tag v0.5.0.** End-to-end scenario: goblins craft/equip weapons, meet intruder, suffer morale effects, loot gear, update personal memories. **Done:** combat + possessions + scavenging playable in one session.

**Gate v0.5:** A weak goblin militia survives a stronger intruder through sensible preparation; combat is real-time, readable and deterministic when replayed.

### M10 — Asymmetric factions, local ecology and threat scheduling (**v0.6**)

**Goal:** All six hostile categories have distinct, interesting motives and a countermeasure. **Depends on:** combat, equipment, factions summaries, environment.

- [ ] **GG-127 — Define faction data/attitudes.** Identity, known hostility, local approach, capabilities, trade/diplomacy hooks, strengths and unresolved issues. **Done:** external population is an abstract number, not thousands of agents.
- [ ] **GG-128 — Implement attention/threat director.** Wealth, ecology damage, notoriety, population, claims and prior history influence **telegraphed** encounters with caps/cooldowns. **Done:** a wealthy/violent grotto attracts different attention from a hidden/stewardly one.
- [ ] **GG-129 — Add traveller/merchant/rumour visits.** Outside path, encounter resolution and faction information exchange. **Done:** visiting agent may become a remembered recurring character.
- [ ] **GG-130 — Implement basic wild-beast ecology.** Hunger, den, territory, shelter seeking, bait and fence responses. **Done:** animals do not behave like soldiers.
- [ ] **GG-131 — Implement adventurer dungeon raiding.** Small elite parties, disarm/avoid traps, seek treasure, heal/withdraw and escape with loot. **Done:** treasure can physically leave map; raid's outcome recorded.
- [ ] **GG-132 — Implement dwarven delver raid.** Heavy gear, shield cooperation, marked breach/tunnel approach and recovery objective. **Done:** wall breach is a real terrain change, not teleportation.
- [ ] **GG-133 — Implement elven ranger incursion.** Ranged advantage, modest stealth, magical gear, ecology-based motivation. **Done:** woodland damage changes likelihood/relations and defenders can counter it.
- [ ] **GG-134 — Implement human campaign wave.** Better conventional mass gear, larger numbers, supply/withdraw logic and crude siege pressure. **Done:** human equipment is scavengable and their objectives differ from dwarves.
- [ ] **GG-135 — Implement Overlord thrall kidnapping raid.** Many low-morale weakly armed goblins, a dominant dark hero or limited demon, grab/carry prisoner/retreat. **Done:** captured goblin remains a persistent off-map record.
- [ ] **GG-136 — Add surrender, prisoner release, ransom/rescue interface.** Small event/expedition mechanic; temporary captives can later be recovered. **Done:** rescued goblin retains original Soul/ID and kidnapping memories.
- [ ] **GG-137 — Add limited negotiation paths.** Basic trade or safe passage, voluntary withdrawal and ceasefire; not all faction hostility must be slaughtered away. **Done:** at least one peaceful resolution besides combat.
- [ ] **GG-138 — Extend faction gear templates.** Dwarven masterwork steel, elven magic, human reliable mass arms, Overlord crude arms + infernal champion items. **Done:** stat/tactic differences are visible and not simply HP inflation.
- [ ] **GG-139 — Add threat-response signals.** Scout report, sighting, entrance alarm and raid approach/direction; no omniscient info for unseen forces. **Done:** player gets fair warning and can muster defenders.
- [ ] **GG-140 — Integration tests for all six encounter contracts.** Repro seeds for objective, retreat, loot, morale and a countermeasure per faction. **Done:** every category behaves distinctively; no raids in unreachable cells.
- [ ] **GG-141 — Tag v0.6.0.** Player can meet all six threats during curated scenarios/normal play. **Done:** the faction matrix is recognisable without tooltips.

**Gate v0.6:** Different enemies force genuinely different defensive and diplomatic choices. Faction activity feels like the result of a world with motives, not arbitrary difficulty scaling.

### M11 — Magic items, provenance, recognition and grudges (**v0.7**)

**Goal:** Individual treasures acquire identity and political consequences. **Depends on:** events, inventory, faction knowledge, combat.

- [ ] **GG-142 — Define relic taxonomy and curated effect registry.** Rare names, eligible item types, origin, craftsmanship, enchantment, drawbacks, charges/cooldowns. **Done:** generated combinations are mechanically compatible and readable.
- [ ] **GG-143 — Add seeded relic naming and backstory.** E.g., *Chalice of Storms*, *Dagger of Withering*, *Grudgekeeper* with origin faction and 1–3 coherent founding facts. **Done:** each generated instance is unique and repeatable from seed.
- [ ] **GG-144 — Implement small meaningful magic effects.** Withering debuff, courage aura, storm/weather intervention, limited healing or ward, infernal drawback. **Done:** effects use simulation events and are reproducible.
- [ ] **GG-145 — Persist named item provenance.** Forged/discovered/stolen/wielded/returned milestones with holder history; promote remarkable ordinary objects to named items. **Done:** history survives death, transfer and reload.
- [ ] **GG-146 — Add public display/Hall of Shinies.** Place personal/communal relics in display spots, admire, inspect and protect. **Done:** a visible display can confer joy/prestige but increases recognition risk.
- [ ] **GG-147 — Define item-specific external claims.** Claimant faction, unique item ID, immutable origin/restitution rule. **Done:** two axes and two claimants don't collide in identifiers.
- [ ] **GG-148 — Implement information propagation.** Witnessed equipment use, visiting merchant, scout, boast, battle survivor; each faction has known/rumoured/verified facts. **Done:** a faction can't demand a relic it has no plausible knowledge of.
- [ ] **GG-149 — Activate claims/demands on recognition.** Formal demand event, diplomacy option and hostility shift. **Done:** demand references exactly the item held or displayed.
- [ ] **GG-150 — Enforce genuine restitution.** Grudge is only resolved when that **specific item** is physically returned or forcibly recovered by claimant. **Done:** money, waiting, renamed item, transferring to another goblin cannot bypass this condition.
- [ ] **GG-151 — Integrate contested ownership with Souls and offices.** Chief may order return; owner may resist; Shaman may reinterpret significance. **Done:** a relic dispute can trigger personal and diplomatic consequences.
- [ ] **GG-152 — Create legendary item UI.** Attractive icons, effects, owner/holder/claimant, provenance timeline, known/unknown status. **Done:** readable keyboard-accessible history, no invented absolute knowledge in player view.
- [ ] **GG-153 — Add relic persistence/replay/recognition tests.** Item transfers, enemy takes item, faction forgets rumour but retains verified claim, succession, save version. **Done:** no duplicate relic and no phantom grudge resolution.
- [ ] **GG-154 — Tag v0.7.0.** Repro scenario: loot dwarven relic, it gets recognised, demand arrives, return/recovery resolves. **Done:** "treasure creates history" is demonstrably playable.

**Gate v0.7:** A named artefact has a consequential history, can become famous to distant people through evidence, and may cause a dispute no amount of generic gold can settle.

### M12 — Breeds, clans, generations and long-range continuity (**v0.8**)

**Goal:** The settlement survives beyond the original cast, and history shapes descendants. **Depends on:** Souls, offices, items, save, Chronicle.

- [ ] **GG-155 — Add goblin kind definitions.** Common goblin, boggart, hobgoblin body/visual/aptitude variations, without personality determinism. **Done:** each plays under the same Soul and social rules.
- [ ] **GG-156 — Add clan/kinship IDs.** Parents, siblings, descendants, clan membership, adoption/partnership if used. **Done:** no cycles or impossible relationships under succession.
- [ ] **GG-157 — Define game-calendar pacing.** Day/night, seasons, years, adjustable time speed, population/economy-compatible maturation rates. **Done:** decades are feasible without hours of idle simulation; annual play remains legible.
- [ ] **GG-158 — Implement lifecycle stages.** Birth/arrival, youth, adulthood, elders and death from age; safe youth restrictions, eventual role succession. **Done:** player can watch a cohort mature without manual operations.
- [ ] **GG-159 — Implement population growth/arrivals.** Family expansion, immigration and growth cap/rate balancing; food/space influences outcomes. **Done:** population neither explodes nor becomes irreversibly extinct in normal play.
- [ ] **GG-160 — Add inheritance of personal items.** Heir selection/basic law, communal fallback and disputed heirlooms. **Done:** a named axe can pass through two generations while keeping its history.
- [ ] **GG-161 — Add office succession.** Vacancy triggers rule-based candidate/election/Chief appointment; Shaman tradition and legitimacy effects. **Done:** world does not crash or lose leadership when offices change during crisis.
- [ ] **GG-162 — Add ancestor/family views.** Compact clan tree, deceased goblin memorial and important family relics. **Done:** a dead goblin is not erased from an item's history or a relative's memory.
- [ ] **GG-163 — Bound long-lived data.** Condense old ordinary events, archive significant figures, prune faded minor memories and tombstone used IDs. **Done:** 200 simulated years don't cause unbounded state growth.
- [ ] **GG-164 — Add long-run headless soak.** Fixed seeds with multi-generational labour, raids, deaths and inheritance; validate all invariants. **Done:** a simulated century completes in controlled test runtime with documented findings.
- [ ] **GG-165 — Tag v0.8.0.** Demonstrate grandmother → parent → child, office change, inherited relic and readable Chronicle. **Done:** long-running settlement is a feature, not just a large year number.

**Gate v0.8:** At least three successive generations can exist in one save, with meaningful continuity of people, offices, property and grudges.

### M13 — The Overlord, liberation and endless sandbox (**v0.9**)

**Goal:** A meaningful long-term objective without an imposed game-ending screen. **Depends on:** six factions, raids/captives, governance, relics and generations.

- [ ] **GG-166 — Create distant tower/Overlord summary.** Named dark power, military strength, raiding pressure, captive records, lieutenants and political status. **Done:** don't physically simulate tower inhabitants offscreen.
- [ ] **GG-167 — Add escalation/intelligence steps.** Captured documents, rescued kin, scout reports, raider interrogation and discovered weaknesses. **Done:** progress is based on play, not an arbitrary timer.
- [ ] **GG-168 — Implement liberation of enslaved goblins.** Rescue outcome restores persistent individuals or recruits new free goblins, with memories, kinship and gratitude. **Done:** a known kidnapped goblin can actually return.
- [ ] **GG-169 — Add confederation/alliance support.** Basic ability to win support of a free grotto or neighbouring faction through aid/diplomacy. **Done:** political preparation improves liberation chances.
- [ ] **GG-170 — Define strategic expedition mechanics.** Name squad, equipment, supplies, allies, intelligence and transparent risk; seeded outcomes/casualties. **Done:** expedition doesn't require fully rendered far-off country.
- [ ] **GG-171 — Add climactic liberation operation.** Launch expedition when eligible, resolve outcome, record named sacrifices/treasure/returnees. **Done:** Overlord can be defeated through achievable and well-communicated gameplay.
- [ ] **GG-172 — Create short ending vignette.** Pixel-art/typographic sequence, Chronicle entry, free-goblins celebration. **Done:** accessible skip/replay and no hard requirement for long rendered cinematic.
- [ ] **GG-173 — Continue after victory.** Return to the same live grotto with changed world relations, less slave raiding and new ordinary possibilities. **Done:** all saves, jobs, characters and items remain playable.
- [ ] **GG-174 — Provide recovery for losing colonies.** Historical summary plus viable restart/import/new settler option; don't hard-lock the only available save. **Done:** game handles extinction gracefully without erasing history by default.
- [ ] **GG-175 — Tag v0.9.0.** An outside tester can play or accelerate from small grotto to endgame, defeat Overlord and keep building. **Done:** victory is optional and internally consistent.

**Gate v0.9:** The game contains the full intended narrative arc, even if balance, polish and content variety still require work.

### M14 — First-release content, UX, balance and delivery (**v1.0**)

**Goal:** A stable, charming, legible and replayable first public game. **Depends on:** v0.9.

- [ ] **GG-176 — Complete visual/style consistency pass.** Goblins, 3 kinds, six foe types, rooms, items, UI frames and key animations share palette/scale/perspective. **Done:** final assets curated, no unexplained placeholder art in first-hour path.
- [ ] **GG-177 — Complete readable UI/UX pass.** Unified inspect/action patterns, tooltips, short feedback loops, task indicators, event links and clear rejected-command reasons. **Done:** first-time user can dig/build/equip/possess without outside help.
- [ ] **GG-178 — Improve input accessibility.** Keyboard access for menu/inventory, configurable bindings where reasonable, focus management, reduced motion, high contrast and non-colour indicators. **Done:** navigation is possible without drag-only interactions.
- [ ] **GG-179 — Add information honesty pass.** Show uncertainty for rumoured outside information; distinguish player-known, goblin-known and actual sim data. **Done:** no invisible omniscience about named relics or distant armies.
- [ ] **GG-180 — Tune first-hour pacing.** Resource access, job selection, early social incidents, hunger, raid ramp and combat lethality. **Done:** repeated fresh-seed playtests have understandable recovery paths.
- [ ] **GG-181 — Tune century-scale pacing.** Births, deaths, memory pruning, clan succession, item loss and long-term event pressure. **Done:** 100+ game-years remain playable without exponential growth or total stagnation.
- [ ] **GG-182 — Balance asymmetric equipment.** Dwarf/elf/human advantages noticeable; goblin traps and tactics credible counters. **Done:** no faction trivialises others through a generic power progression.
- [ ] **GG-183 — Add optional in-game tutorial/scenario seeds.** Guided first excavation, first inventory, first possession, first relic dispute and Overlord teaser. **Done:** hints can be disabled; normal sandbox unforced.
- [ ] **GG-184 — Add sound/music controls.** A small original/licensed ambient and UI sound set, volume toggles and mute; silent play supported. **Done:** rights documented and no unexpectedly loud autoplay.
- [ ] **GG-185 — Verify asset provenance/licensing.** PixelLab-generated, hand-edited, borrowed fonts/audio attribution, commercial-use review and clean source records. **Done:** distributable assets only; no Dwarf Fortress/Dungeon Keeper/Diablo protected art in repo.
- [ ] **GG-186 — Harden save migrations and corruption handling.** Backup autosave, import validation, upgrade fixtures from every released milestone where feasible. **Done:** v0.1+ sample saves are upgraded or a clear supported-compatibility policy is published.
- [ ] **GG-187 — Profile and optimise.** Target 96×96 with ~60 goblins + 30 visitors, normal raids and inventory loads; cull/dirtied tile chunks, reduce nav replan, avoid UI reflows. **Done:** documented FPS and tick timings on representative hardware.
- [ ] **GG-188 — Run automated browser and headless stress suites.** Seed sweep, long-run sim, combat regression, item/grudge invariants, all six factions, replay and save roundtrip. **Done:** no high-severity failures in release candidate.
- [ ] **GG-189 — Security and compatibility audit.** No unescaped text injection in event log/player names/imported saves; no arbitrary code eval; static deploy CSP where practical; cross-browser smoke. **Done:** malformed names/files fail safely.
- [ ] **GG-190 — Accessibility and manual playtest.** At least one keyboard-centric pass and several clean-install playthroughs, including an early wipe and optional win. **Done:** documented issues are triaged; blockers fixed.
- [ ] **GG-191 — Complete README and player reference.** Installation, browser requirements, keybindings, systems, screenshots, credits, save locations, known limitations. **Done:** user can install/run without developer assistance.
- [ ] **GG-192 — Configure production deployment.** Correct Vite base/assets paths, cache invalidation, GitHub Pages workflow, downloadable static build/zip if desired. **Done:** hosted URL loads assets, starts game and reloads saves.
- [ ] **GG-193 — Freeze release candidate and fix only blockers.** Version stamp, changelog, manual QA checklist and sampled save fixtures. **Done:** no new major features after RC.
- [ ] **GG-194 — Publish v1.0.0.** GitHub release, tag, public build, screenshots/trailer/gif, licences/credits, known issues and feedback route. **Done:** an outsider can play, finish optional victory and continue sandbox.

**Gate v1.0:** The first public release delivers the full small-scale Goblin Grotto identity: delightful autonomous goblins; visible Spirit influence and possession; Chief and Shaman; meaningful personal property; tactical dungeon defence; six asymmetric enemy categories; named treasures with real histories; an optional Overlord victory; and an ongoing, reliable sandbox.

---

## 8. Content dependencies and critical path

The primary path is:

```text
Deterministic core (M00)
  → projection + input (M01)
  → connected tile world + navigation (M02)
  → autonomous goblins + jobs (M03)
  → food / shelter / storage / saves (M04) → FIRST PLAYABLE v0.1
  → Souls + events + relationships (M05)
  → offices + policies + ownership (M06)
  → possession + after-effects (M07)
  → persistent items + equipment (M08)
  → combat + morale + traps (M09)
  → local factions/raids (M10)
  → unique relics + faction claims (M11)
  → kinship/centuries (M12)
  → Overlord liberation (M13)
  → QA/content/polish/shipping (M14) → v1.0
```

**Cross-system dependencies to respect:**

- Item claims require stable item IDs, ownership/holder separation, faction IDs, credible information flow and reliable event history **before** restitution UI.
- Leader resistance requires understandable command feedback and goblin Souls **before** adding player deposition.
- Possession requires direct input routing, body actions, Soul changes and safe actor teardown **before** combat possession.
- Captive rescue requires entity persistence beyond active map; don't delete kidnapped goblins when they leave view.
- Long-range generations require calendar pacing, ancestry/inheritance and historical tombstones **before** any save is advertised as centuries-safe.
- Fixed-perspective art production requires a projection decision and anchor standards **before** generating hundreds of PixelLab sprites.
- Outdoor raids and environmental diplomacy require an actual small outside region and an abstract external world **before** creating faction-specific AI.
- Named item effects require event-driven simulation and balance telemetry; avoid effects that bypass job permissions or item movement guarantees.

**Parallel-safe work:** PixelLab art, UI mockups, written event snippets and narrative naming tables can proceed alongside headless simulation after `GG-013`/`GG-022`. Core state model, renderer and persistence contracts should not evolve in incompatible branches simultaneously.

---

## 9. Definition of Done (for every task)

A task is complete only if:

- The game still starts and existing saves are preserved or consciously migrated.
- It has a focused test for pure logic or a repeatable browser/manual case for interaction/art; fixed seed supplied for nontrivial bug reproduction.
- It runs without TypeScript errors, lint failures, test regressions or an accidental performance cliff.
- Any new player-visible behaviour is communicated through UI, event log or relevant tooltip; no silent administrative failure.
- Its new data has clear ownership and serialization rules; no hidden renderer/DOM mutation of game state.
- Its PR has a brief **what changed / how tested / risks / screenshot or GIF** description when relevant.
- It updates the task checkbox, milestone gate (if achieved), and appropriate README/ADR/art/data reference in the same merge.

**Ship blocker classes:** data loss, save corruption, softlock, unstoppable simulation clock, duplicate/disappearing items, catastrophic performance, unreadable first-play controls, broken possession release, inaccessible inventory, unpreventable early colony wipe, completely undifferentiated enemy faction, relic-grudge state inconsistency, nonfunctional published URL.

---

## 10. Asset production playbook (PixelLab)

1. Create a small **style reference sheet** first: dark blue/purple cavern stone; earthy brown/olive; teal glowing fungi; amber lamps; warm faces; restrained blood/violence; storybook ornament and readable silhouettes.
2. Lock camera/projection and character anchor points. Author **32×32 goblin body sprites** at native resolution; use a larger animation canvas only for effects or weapons extending past the body. Choose a consistent 4- or 8-direction standard after the projection spike.
3. Build one reusable base goblin and variations (face, ears, skin shade, outfit, size, kind), then a few clean pose sheets: idle, walk, mine, haul, work, eat, rest, attack, hurt, flee, celebrate, die. Don't demand every animation for first prototype.
4. Produce tilesets in families: material walls/floors, transitions, shadow edges, outside vegetation, mushrooms, water, structures, traps, entrance and props. Validate seam behaviour and collision outlines in the live renderer.
5. Produce distinct silhouettes for adventurers, dwarves, beasts, elves, humans and enslaved goblins, plus elite dark champion/demon; differences must read at gameplay scale, not only in descriptions.
6. Produce small equipment/item icons independently of world sprites. Unique relics warrant distinctive iconography, visible provenance accents and sensible placement inside inventory cells.
7. Export PNGs/atlases with alpha, explicit frame dimensions, origins, animation naming, palette/variation metadata and licensing/provenance notes. Normalize output through a small validation script; keep curated final art in `public/assets/` and source/prompt records in `docs/` or `art-source/` only as useful.
8. Check every batch in-game at **native integer scales** and under dim cavern lighting, not merely in an isolated image gallery. Correct inconsistent style with inpainting/manual edits before adding more varieties.
9. Prefer charming purposeful animation (ears, blinking, idle fidget, rummaging, carrying an oversized item) to excessive sprite detail. Preserve UI readability and performance.

---

## 11. Risk register and intentional trade-offs

| Risk | Symptom | Mitigation / scope decision |
|---|---|---|
| Overbuilding simulation | Months of invisible systems, no playable loop | Ship v0.1 at M04; reject any feature not on milestone critical path |
| Sprite/projection mismatch | Wall overlaps wrong, wrong item direction | `GG-013` projection spike and ART_BIBLE before mass asset creation |
| Goblins seem stupid | Endless job switching, path deadlocks | Job reservations, bounded utility scoring, explain-why panel, seed tests |
| Goblins feel robotic | Different stats but same stories | Memories/ambitions/relationships actually modify decisions |
| Unfair leader resistance | Orders silently fail | Accept/reject/modify feedback, readable motives, limited deviation |
| Possession is dominant | Player directly controls every important worker | Duration/cost/stress, Shaman/brew exceptions, AI competence and social consequences |
| Spirit consequences feel moralising | Benevolent possession always punished | Circumstance-dependent reception, benefits and nuanced non-binary outcomes |
| Legendary loot becomes stat inflation | Hundreds of meaningless buffs | Rare curated powers, provenance/claims, memorable consequences |
| Factions feel like reskins | Same AI with larger HP | Unique objective, approach, tactics, gear, morale and countermeasure per faction |
| Broken ownership/claims | Duplicated sword or grudge clears wrongly | Central item transfer service, stable IDs, property tests, exact-item restitution |
| Century simulation bloats | RAM/save size grows without bound | Significant event retention, sparse relationships, aggregate off-map, soak tests |
| Procedural world is unfair | No food/entrance or inaccessible start | Reachability validation, seed sweep, generous first-hour recovery |
| Too many features before public build | No release ever happens | MUST/SHOULD/FUTURE scope; 0.x tags, release gates, postpone deep content |
| Tool-generated art inconsistent | Different pixels/lighting/scale | Reference sheet, native sprite constraints, manual curation and in-game review |
| Magic breaks low-fantasy mood | Every goblin fires lightning bolts | Magic concentrated in rare relics, shamans, brews and unusual elite enemies |

---

## 12. After v1.0 — deliberately postponed expansion backlog

These ideas are part of the **long-range creative vision**, not required to complete the first public release. Promote them only after playtesting indicates value.

- **Multiple Z-levels:** stairs, shafts, cave bridges, underground rivers/lakes, stacked buildings, multi-level raiders, collapses between levels; begin with vertical traversal links in the navigation service, not a rewrite of renderer logic.
- **Optional 3D diorama:** reuse world state and assets where practical; no obligation to bundle copyrighted Dwarf Fortress art, no requirement to reproduce DF's renderer.
- **Greater natural ecology:** tame or ride beetles, cave spiders and other beasts; habitats, migrations, ecological retaliation, weather effects and seasonal food preservation.
- **Deeper cultures and traditions:** emergent festivals, taboos, inherited rites, shamanic visions, negotiated constitutions, rebel cliques, chieftain dynasties and cults of the Spirit.
- **Advanced enemy tactics:** returning named adventurers who remember traps, dwarven countermining sieges, elven ecological restoration, human logistics/encampments, free-grotto politics, larger Overlord warbands.
- **Full expedition / tower assault map:** playable offsite locations, retreat/recovery, siege mechanics, dark sorcery and direct confrontation with the Overlord.
- **Advanced magic and enchantments:** a deeper artefact pool, curses with social consequences, ritual brewing, ritual sites, competing spirit presences and faction-specific craft traditions.
- **Finer combat:** formations, mounted beetle cavalry, weapon reach/grappling, siege engines, battle aftermath, captured adventurers and prisoner diplomacy.
- **Deeper kinship and economics:** expanded inheritance, clan feuds, trade networks, apprentices, libraries of item provenance and intricate private property/custom law.
- **New Goblin Soul reactions:** more vivid comedy, tale-like ambitions, dream/omen events and long memories without a dense modern psychological model.
- **Quality-of-life:** mobile/tablet controls, installable PWA, cloud saves by opt-in, configurable difficulty and scenario editor, data-driven community modding.

---

## 13. Open decisions — decide at the smallest responsible moment

Not all decisions need to be made now. Record them as ADRs when implementation reaches the dependency.

| Question | Proposed default | Decide by |
|---|---|---|
| Exact 2.5D projection | Fixed three-quarter view with square logical grid; compare iso 64×32 vs JRPG oblique | `GG-013` |
| Sprite direction count | Four directions for early animation, expand only if necessary | `GG-022` |
| Tick rate and game-year duration | 10–20 fixed ticks/sec; years accelerated relative to real time | `GG-007`, then `GG-157` |
| Goblin starting population | Four; at least 3 kinds by v0.8 | `GG-037` |
| Initial room/map footprint | 64×64 starter, profile up to 96×96 | `GG-027` |
| Memory capacity | Small fixed ordinary-memory budget plus unbounded-in-principle but summarised landmark events | `GG-069` |
| Possession cost | Time/cooldown + context-sensitive spiritual strain rather than arbitrary large magic meter | `GG-088` |
| Relationship semantics | Sparse directional trust/affection/resentment, not dozens of values | `GG-067` |
| Chief/Shaman succession law | Simple elective/appointive default, later laws can alter it | `GG-076` |
| Inventory dimensions | Try 6×4, tune with item art and actual UI usability | `GG-101` |
| Combat dice | One easy-to-explain opposed roll, equipment affects precision/mitigation | `GG-114` |
| Magic balance | Few meaningful effects, mostly relics/rituals, low frequency | `GG-142` |
| Hard survival failure | Archive colony with restart/re-settlement option | `GG-174` |
| Release hosting | GitHub Pages, static client-only build, local save/export | `GG-192` |

---

## 14. First GitHub session: exactly where to start

1. Create the repository (`goblin-grotto` is a suitable short name), add this `PLAN.md`, create README and choose a licence. Commit: `docs(plan): add master game plan`.
2. Open **GG-001 → GG-012** as small initial issues. Scaffold Vite + strict TypeScript, deterministic headless core, lint/tests and GitHub Actions. Nothing graphical needs to exist yet.
3. Perform **GG-013** as a fast visual experiment before committing to a major PixelLab sprite library. Archive both screenshots and write the projection ADR.
4. Then implement **GG-014 → GG-024** and **GG-025 → GG-036**. Only after input, terrain and world navigation are correct should we populate a small grotto with autonomous workers.
5. Keep **v0.1** ruthlessly small: four goblins, a lovely cave, dig/haul/food/bed/craft loop, speed controls and save/load. We can fall in love with the inhabitants after we can first watch them live.

### Suggested first commit sequence

```text
docs(plan): add Goblin Grotto master plan
chore(repo): initialise Vite TypeScript project
chore(quality): add lint format and typecheck scripts
test(core): initialise headless Vitest suite
feat(core): introduce entity IDs and grid positions
feat(core): add seeded serialisable random generator
feat(sim): add deterministic fixed-step clock
feat(sim): add command and GameState boundaries
feat(events): add typed event and chronicle contracts
test(sim): add deterministic replay checks
ci: validate types tests lint and production build
docs(adr): record foundational architecture decisions
```

**Final design test:** When considering any new feature, ask: *What can a goblin perceive? What interesting decision does it create? Which individual or institution can respond? What might be remembered a generation later?* If we cannot answer, simplify it—or leave it for a later release.

---

*This document is deliberately ambitious in destination but conservative in execution. The plan succeeds when each incremental commit creates or protects a small piece of a delightful, living game—not when we have completed a vast theoretical simulation.*
