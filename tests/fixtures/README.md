# Migration fixture

`v1-active-colony.json.gz` was produced with the simulation at commit
`13edf3dec66f565fd50cc9517f8ab38ca6d671aa` (prototype.3), before the discovery changes.
Seed: `v1-active-colony`. Command: build a farm at (30,29,0); then advance 15 ticks.
The compressed JSON keeps an actual version-1 colony with active construction,
including all tile knowledge, task reservations, RNG state, items and identities.

The migration test compares every original field after removing only the new
schema-2/schema-3 fields; the browser test imports it and finishes construction. Compression
keeps the full 64×64 fixture small without replacing it with a synthetic partial save.


`v2-active-colony.json.gz` was produced with the simulation at commit
`e0d46628f5b5a5372d50ee4dfd4308dc28a3571d` (prototype.6), before ceiling/weather changes.
Seed: `v2-active-colony`. Command: build a farm at (30,29,0); then advance 15 ticks.
The migration test compares all original fields after removing only schema-3
weather and collapse timers. Existing maps acquire no pending collapses.


`v3-active-colony.json.gz` was produced at commit
`69202550fb512cef96af2724e226e1d4b9f361a0` (prototype.7). Seed: `v3-active-colony`.
Build a farm at (30,29,0), then advance 15 ticks. Migration strips only the new
kind/facing/movement fields for an exact comparison with the original schema-3 snapshot.
