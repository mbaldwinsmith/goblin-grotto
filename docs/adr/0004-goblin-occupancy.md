# 0004 — Persistent goblins and cooperative occupancy

Status: accepted for prototype.8/.9, pending merge.

Each initial goblin has a stable ID, name, common kind, tile position and facing in
simulation data. The eight-direction facing calculation is shared with rendering;
render history is cosmetic. Other kinds and their aptitudes remain GG-155.

Terrain A* treats other goblins as transient occupants. Before moving into an
occupied cell, the movement system searches a fresh route excluding other actors;
these detours do not enter the terrain cache. If no route exists, an idle neighbour
can step into a free side cell. In a one-cell passage, an idle blocker or opposing
worker can exchange adjacent walkable positions atomically. This bounded passing
rule allows the small colony to use chokepoints without indefinite entrance stacks.
Rendered bodies can briefly cross while passing; logical positions remain unique.
Sleeping or currently working actors can cause a temporary wait. Each actor's
persistent next-move tick prevents repeated moves within one terrain interval,
including cooperative moves. Worker evaluation rotates by tick for fairness.

Walls are built from an adjacent tile after occupants clear the site. Carried
items follow their holder on every move. Existing tick-driven interpolation and
the owner's sprites remain unchanged.

Schema 4 introduced kind/facing, defaulting old actors to common/south. Schema 5
adds movement cooldowns. During older-save migration, overlapping actors and actors
standing on walls are separated by deterministic breadth-first search through
known walkable neighbours; unique valid positions are reserved first. IDs and
work remain unchanged, and carried coordinates are aligned to holders. If no
space exists, import fails clearly. Schema-5 saves reject overlaps, blocked actor
positions and movement timestamps beyond the maximum terrain/weather interval.

Full collision physics, large-crowd performance, bed reservations and direct-order
UI are separate tasks. No new art is generated or substituted in this change.
