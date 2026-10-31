# 🍄 Goblin Grotto

> **Dig deep. Hoard shinies. Cause trouble.**

**Goblin Grotto** is a work-in-progress, dark-fairy-tale colony simulator and dungeon-defence game. Guide a society of eccentric goblins as they dig out a home, grow mushrooms, squabble over treasure, defend themselves against far better-equipped enemies, and make history across generations.

Think **the Brothers Grimm meet slapstick**: a cosy little grotto in a world that can be funny, strange, beautiful, and genuinely dangerous.

**Built for the browser with TypeScript and pixel art.** The planned presentation is a fixed, JRPG-style **2.5D view** with expressive **32×32-pixel goblins**, charming pixel-art interfaces, and grid-based personal inventories.

> [!IMPORTANT]
> **Project status: pre-production / early development.** This repository begins with a design and milestone plan, not a finished or necessarily runnable game. The authoritative roadmap is [PLAN.md](PLAN.md). The installation commands below apply **after** the initial TypeScript project has been scaffolded.

## The premise

You are the **Spirit of the Grotto**: perhaps a guardian angel, a mischievous *genius loci*, or a tyrant in the making.

You don't control a faceless workforce. You guide a community of goblins who have **Souls of their own**. Establish rules, mark out tunnels, appoint leaders, nurture families, prepare defences, and occasionally possess a goblin to get something done yourself. Goblins may interpret your wishes creatively, resist them, or obey with alarming enthusiasm.

How much freedom will you give them? How much control will you take?

The game never tells you what kind of Spirit you must become.

## What makes it different?

- **Goblin-centred simulation.** Simulate what goblins can experience and understand, not invisible geological, meteorological, or demographic detail. A distant dwarven kingdom is a faction with a history—not thousands of individually ticking dwarves.
- **A grotto with a personality.** Every goblin has a compact Soul: a mixture of the **Four Humours**, attributes, needs, memories, relationships, and ambitions. Simple systems combine to produce surprising stories.
- **Guidance rather than absolute control.** Set priorities, policies, work designations, and equipment rules. Goblins autonomously act on the opportunities available to them. Step in directly when you want to.
- **Chief and Shaman.** The grotto's temporal and spiritual leaders may cooperate with your intentions, reinterpret them, or oppose them. Deposing an inconvenient leader is possible—but what kind of society does that create?
- **Possession with consequences.** Temporarily control any goblin, including in real-time combat. Shamans and mushroom-brew-fuelled berserkers may welcome it; others may feel exhausted, unsettled, revered, or violated.
- **Cleverness beats steel.** Enemies often outclass goblins in conventional warfare. Win through traps, tunnels, morale, ambushes, scavenged gear, and cunning.
- **Treasure has a past.** Magical items and named relics have provenance, claims, and recorded histories. Steal a dwarven heirloom and its former owners may recognise it—and demand the *specific item* back.
- **Generations, not just raids.** Goblin kinds, clans, inheritance, leadership succession, and an evolving Chronicle let a settlement grow through decades or even centuries.
- **A sandbox that keeps going.** Liberating goblins from the Overlord and defeating him is an optional victory; life in the grotto continues afterwards.

## The grotto and its world

The initial world will have **one playable Z-level**, with architecture that leaves room for additional levels later. It combines a procedurally generated cavern network with a **small, accessible outdoor area** containing trees, wild animals, travellers, and forageable plants.

Geology is deliberately storybook-simple: **sand, mud, loose rock, hard stone, bedrock, and impenetrable stone**. There are ore deposits, fungi, underground pools, ancient ruins, hidden chambers, and meaningful discoveries—but no modern mineralogical taxonomy or planetary weather simulation.

The surrounding kingdoms and wilderness exist as an **abstract wider world** until visitors, raiders, emissaries, or stories bring them into the grotto's immediate experience.

### Those who come knocking

| Threat | Why they come | What makes them dangerous |
| --- | --- | --- |
| **Adventurers** | Glory, monsters, and treasure | Skilled small parties, trapsmiths, spells, and stolen loot |
| **Dwarven delvers** | Wealth, ancestral relics, and old grudges | Finest steel, countermining, discipline, and fortifications |
| **Wild animals** | Food, territory, and shelter | Instinct, ambush, ecological pressure, and dangerous beasts |
| **Elven rangers** | To purify or defend the land | Stealth, enchantments, archery, and woodland allies |
| **Human armies** | To cleanse away the goblin threat | Numbers, logistics, and good mass-produced equipment |
| **The Overlord's goblins** | To kidnap free goblins into bondage | Waves of ill-equipped thralls backed by dark heroes and demons |

Each faction should have **different goals, behaviour, equipment, and morale**—not just different statistics. Capturing or recovering superior equipment helps your goblins survive, but may also create political consequences.

## How it plays

**Build.** Dig tunnels, designate rooms, establish stockpiles, grow mushrooms, gather resources, build workshops, smelt basic ores, and make a comfortable home.

**Observe.** Watch goblins choose work, form friendships and grudges, pursue ambitions, collect possessions, develop traditions, and remember significant events.

**Intervene.** Set community policy, resolve disputes, appoint or depose the Chief and Shaman, equip individual goblins, or temporarily possess one to work or fight directly.

**Defend.** Design an effective dungeon. Traps, terrain, positioning, morale, scavenged weapons, and selective retreat matter more than winning a fair fight.

**Remember.** Read the Chronicle, inspect heirlooms, trace item ownership, and see how a little grotto acquires legends of its own.

### Equipment and relics

Individual goblins will have **Diablo-style, shape-based inventory grids**, equipment slots, and both manual and automatic equipment assignment. The item system is intended to support ordinary tools, crafted arms, fine foreign weapons, rare enchantments, and unique relics such as **the Chalice of Storms** or **the Dagger of Withering**.

A legendary object isn't merely a higher damage number. It may change battles, influence a goblin's ambitions, or provoke a diplomatic crisis. Item provenance and **who actually knows about an item's location** are part of the simulation.

## Development roadmap

The game will be built in **small, testable, version-controlled steps**. Each milestone should produce or protect something playable. Version numbers represent **feature gates, not deadlines**.

| Milestone | Focus |
| --- | --- |
| **v0.1 — A Home in the Rock** | One cave, four autonomous goblins, digging, hauling, food, shelter, and saves |
| **v0.2 — Goblins with Souls** | Four Humours, ambitions, memories, relationships, emergent incidents |
| **v0.3 — The Grotto Has a Government** | Chief, Shaman, communal and personal ownership, policies, resistance |
| **v0.4 — The Hand of the Spirit** | Possession, direct intervention, psychological and social consequences |
| **v0.5 — Shiny Things** | Grid inventory, equipment, crafting, scavenging, real-time combat |
| **v0.6 — A Hostile World** | Distinct enemy factions, raids, local ecology, asymmetric warfare |
| **v0.7 — History Has Teeth** | Relics, provenance, recognition, claims, diplomacy, grudges |
| **v0.8 — Generations of Goblins** | Goblin kinds, clans, family life, succession, inheritance, long histories |
| **v0.9 — The Tower's Shadow** | Captives, liberation, Overlord threat, optional victory and continued play |
| **v1.0 — First Public Release** | Cohesive art and audio, accessibility, balancing, performance, documentation, deployment |

For the granular implementation checklist, dependencies, acceptance criteria, and suggested commit sequence, see **[PLAN.md](PLAN.md)**. Work begins with **GG-001**, the repository foundation, and proceeds in order through the smallest viable changes.

## Technology (planned)

| Area | Approach |
| --- | --- |
| Language | **TypeScript**, strict mode |
| Build/dev server | **Vite** |
| Rendering | **PixiJS**, WebGL-first, fixed 2.5D projection |
| Simulation | **Pure TypeScript**, deterministic fixed-step game loop, seeded randomness |
| Unit tests | **Vitest** |
| Browser tests | **Playwright** |
| Quality | Type checking, linting/formatting, GitHub Actions CI |
| Saves | Versioned local saves, with import/export planned |
| Hosting | Static build, with **GitHub Pages** as an initial deployment target |
| Art pipeline | **PixelLab**-assisted pixel art, curated and edited for consistent sprites and tilesets |

**Architectural rule:** The simulation must not depend on PixiJS, the DOM, or the camera. Gameplay coordinates, world state, and outcomes belong to the simulation; visuals merely present them. The initial game uses `z = 0`, while core spatial types can accommodate additional levels later.

The exact art projection will be chosen by a short comparison of JRPG-style oblique and isometric views **before** creating a large sprite library.

## Getting started

### Right now: help establish the repository

The first tasks are documented under **M00** and **M01** in [PLAN.md](PLAN.md):

1. Add the plan, README, licences, `.gitignore`, and basic project conventions.
2. Scaffold **Vite + strict TypeScript** and commit the package lockfile.
3. Add formatting, linting, type checking, and headless tests.
4. Build the smallest deterministic simulation loop and command interface.
5. Compare two fixed 2.5D projections, document the choice, then build the first map renderer.

Don't begin by building the entire game engine or generating hundreds of assets. **First make one goblin move, dig, and carry something.**

### Once the project has been scaffolded

Install a Node.js version supported by the repository's eventual `engines` field / `.nvmrc`, then run:

```bash
npm install
npm run dev
```

When the corresponding scripts are added, the expected local quality checks will be:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

> These commands are **planned project commands**, not a claim that the repository already contains `package.json` or a working application. Consult the scripts in `package.json` once scaffolding is complete.

## Working on the game

Contributions, experiments, and feedback are welcome, especially when they help us reach a **small playable milestone** rather than expanding scope prematurely.

- **Choose one task** identified in [PLAN.md](PLAN.md) (for example, `GG-014`). Implement the smallest coherent slice and include acceptance tests where appropriate.
- **Keep commits focused.** Use descriptive conventional commit subjects, such as `feat(world): add seeded cave chambers` or `test(sim): cover task reservations`.
- **Keep the simulation deterministic.** Use seeded randomness, fixed simulation ticks, and typed commands/events. Rendering should never change gameplay outcomes.
- **Document important decisions.** Record projection and architecture choices in short ADRs; update `PLAN.md` when dependencies or scope change.
- **Do not commit third-party game art.** Make original, consistently styled assets and record the provenance/licence of any external material.
- **Treat the player and their goblins fairly.** If an order is resisted, a task cannot be completed, or a raid occurs, the game should give intelligible reasons.

The current focus is **desktop-browser play**. Mobile optimisation, multiple Z-levels, a rotatable 3D view, enormous off-map simulations, and a fully playable Overlord tower are **not required for v1.0**.

## Screenshots and builds

No screenshots or public playable builds are available at this initial planning stage. This section will be updated with the first in-engine images and hosted demo when the relevant milestones land.

## Licence and assets

**Source code:** [MIT License](LICENSE.md) — copyright © 2026 Mark Baldwin-Smith.

**Creative assets:** [ASSETS-LICENSE.md](ASSETS-LICENSE.md) — original art, music, narrative material, and branding are **not automatically MIT-licensed**; applicable rights are reserved unless separately stated. The asset notice includes limited permission for personal, non-commercial local building and evaluation, but **does not generally authorise redistribution of asset-containing builds**.

**Third-party materials:** Remain subject to their own licences and attribution requirements. PixelLab-assisted creations will be curated, and their provenance documented. Please discuss rights and permissions before submitting new art or audio.

---

*Every grotto has a story. Some of them even survive to tell it.*
