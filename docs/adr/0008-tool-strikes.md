# 0008 — Cardinal tool swings and simulation work

Status: accepted for prototype.13, pending merge.

The owner supplied pick/axe archives in commit 890b554 and directed their use for
mining/chopping. Import original cardinal PNGs and padding without mirroring,
resizing or cropping. The Axe/Attack clip represents tree chopping, adding no
combat. Its north clip has nine frames; all other tool swings have eight. Missing
west axe idle uses the supplied static rotation; missing pick walking uses the
existing empty walk. The manifest records directional lengths and contact frames.

A goblin stores a small work action: mine/chop, start tick and whether impact has
happened. After arrival has settled, an 18-tick swing starts. At elapsed tick 10,
the simulation applies 18 work exactly once. Hardness/work requirements remain
unchanged; completion is quantized to strikes. This preserves average throughput
without giving nine-frame north chopping a different speed. Frames remain in
source order but are sampled before/after the curated contact so every direction
lands on the same impact tick. Rendering reads the timeline and cannot advance it.

Tree cutters work from adjacent cells and face the tree. Workers finish recovery
before moving or being reassigned, including after a job finishes at impact. Tool
actors cannot be pushed. Cancellation/direct guidance/urgent needs release the
pending action; an interrupted wind-up grants no work. An already applied strike
is never undone or repeated. Existing gathering of mushrooms uses its old work rule.

Schema 9 saves the action phase, validates the elapsed interval, impact flag and
active job during wind-up, and migrates versions 1–8 with null work actions.
An actual schema-8 active mine fixture preserves progress and resumes under the
new strike cadence. Tests compare continued worlds before/after impact and prove
render samples, pause and loading cannot produce extra work or cloned resources.
