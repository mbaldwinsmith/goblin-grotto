# 0010 — Dirt replaces soft earth; gathering reuses Base/Attack

Status: accepted for prototype.15, pending merge.

The owner explicitly removes sand and replaces the previous walls with the new
dirt export. This revises the material scope in GG-025 and the terrain count in
GG-023, superseding the corresponding material choices in earlier ADRs. Rename
mud to dirt and keep its existing hardness, stability, movement and drop rules.
Do not invent a replacement sand mechanic. New generation uses five materials.

Save schema 10 maps both legacy sand and mud to dirt after previous migrations.
Preserve positions, geometry, knowledge, RNG, identities, hazards, job progress
and ongoing swings. Existing saves may therefore retain a pending cave-in on a
converted tile; migration must not silently cancel it. Reject legacy tokens in
new schema-10 data. Keep historical fixture bytes intact and normalize only
expected snapshots.

The eight-image ZIP at owner commit 04ed6d9 replaces the prior 16-wall family.
Move it unchanged from walls/mud to walls/dirt and catalog every native PNG with
its source hash. Remove retired sand and mud assets from the active library;
Git history preserves them. The resulting library has 153 PNGs in 19 archives.
Separate wall tops, wall sides, perspective gradients and native tree/farm rules
from ADR 0009 still apply.

At the owner’s request, use Base/Attack as the mushroom picking motion, without
adding combat. Import eight frames in each cardinal direction unchanged. Visual
curation chooses source frame 4 as contact. Extend ADR 0008’s saved 18-tick
work stroke with a gather action and hands tool; contact remains tick 10,
applying 18 work once. Wild harvest and automatic farm harvest share this path,
including adjacent approach, facing, cancellation, urgent needs and recovery.
Farm harvesting remains automatic; do not add a manual farm designation.
Completing a harvest creates exactly one food stack through existing job rules.
