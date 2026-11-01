# 0003 — Warned ceilings, seasonal weather and cached routes

Status: accepted for prototype.7, pending merge.

Weak material excavated beside at least three open neighbours can develop a
300-tick ceiling warning. Initial terrain and migrated maps acquire no pending
falls. A walkable support costs one wood and one stone and protects a Manhattan
radius of two. Falls postpone while a goblin occupies the tile; a blocking fall
must preserve connections between goblins and available food. Otherwise stones
fall while leaving a passage. This creates a support decision without introducing
damage, injuries, detailed geology or an immediate colony wipe.

Calendar state derives from simulation ticks: 2,400 ticks per day, five days per
season. Every 600 ticks, seeded selection chooses clear skies (55%) or seasonal
precipitation (45%); winter precipitation is snow. Rain adds one movement tick
outside and snow adds two. Caves are unaffected. Schema 3 persists weather and
warning deadlines; versions 1 and 2 migrate in place with clear skies and no
pending collapses.

Routes use deterministic A* with terrain/weather costs and a warning penalty.
Other goblins remain transient occupants rather than walls; full congestion rules
are still GG-038. A per-state cache holds at most 256 routes, returns defensive
copies and is derived rather than saved. Terrain/structure, discovery, warning and
weather mutations must call `invalidateNavigation`; imported states start with an
empty cache. A route failure releases work and carried-item reservations, while
GG-045 remains open for its full interruption requirements.
