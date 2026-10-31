# Migration fixture

`v1-active-colony.json.gz` was produced with the simulation at commit
`13edf3dec66f565fd50cc9517f8ab38ca6d671aa` (prototype.3), before the discovery changes.
Seed: `v1-active-colony`. Command: build a farm at (30,29,0); then advance 15 ticks.
The compressed JSON keeps an actual version-1 colony with active construction,
including all tile knowledge, task reservations, RNG state, items and identities.

The migration test compares every original field after removing only the new
schema-2 fields; the browser test imports it and finishes construction. Compression
keeps the full 64×64 fixture small without replacing it with a synthetic partial save.
