# Migration fixture

`v1-active-colony.json.gz` was produced with the simulation at commit
`13edf3dec66f565fd50cc9517f8ab38ca6d671aa` (prototype.3), before the discovery changes.
Seed: `v1-active-colony`. Command: build a farm at (30,29,0); then advance 15 ticks.
The compressed JSON keeps an actual version-1 colony with active construction,
including all tile knowledge, task reservations, RNG state, items and identities.

The migration test compares every original field after removing only the new
fields introduced by schemas 2–7; the browser test imports it and finishes construction. Compression
keeps the full 64×64 fixture small without replacing it with a synthetic partial save.


`v2-active-colony.json.gz` was produced with the simulation at commit
`e0d46628f5b5a5372d50ee4dfd4308dc28a3571d` (prototype.6), before ceiling/weather changes.
Seed: `v2-active-colony`. Command: build a farm at (30,29,0); then advance 15 ticks.
The migration test compares all original fields after removing the weather, collapse, goblin metadata and action fields added
by later schemas. Existing maps acquire no pending collapses.


`v3-active-colony.json.gz` was produced at commit
`69202550fb512cef96af2724e226e1d4b9f361a0` (prototype.7). Seed: `v3-active-colony`.
Build a farm at (30,29,0), then advance 15 ticks. Migration strips only the new
kind/facing/movement/drop/preference fields for an exact comparison with the original schema-3 snapshot.


`v5-active-haul.json.gz` was produced at commit
`509f221082eb2a86336f11a8dde3199a81d0eaa1` (prototype.9). Seed: `v5-haul`.
Add a loose stack of three stone at (28,29,0), then advance until its first pickup.
Set the carrying worker's valid legacy facing to north-east. Schema-6 migration
preserves all fields except the documented cardinal facing conversion and new
nullable drop state; the resumed worker completes its delivery.


`v6-drop-windup.json.gz` was produced at commit
`e31105bd5f0a59b3c151bf8ad7e329932f3d5462` (prototype.10). Seed: `v6-windup`.
Add three loose stone at (28,29,0), advance until a delivery starts, then four more
ticks. Schema-7 migration adds only Normal task priorities and null work preferences;
the snapshot comparison preserves its held item, reservation and drop timeline.
