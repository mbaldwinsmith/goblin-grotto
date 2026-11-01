# 0005 — Cardinal animation and physical drop timing

Status: accepted for prototype.10, pending merge.

The owner requests four cardinal directions. Navigation already follows four
neighbours; facing now uses the dominant axis, with vertical winning ties. Old
diagonal facing migrates northward or southward. Only cardinal clips are loaded.
The updated base/hauling exports are pinned to owner commit 37ad2ad, copied
unchanged with hashes and original padding; attack clips remain uncurated.

Rendering chooses empty/loaded idle/walk from physical carrying state. Idle
breathing and gait use simulation ticks; interpolation only changes visual
positions. Sleeping uses a static pose. Drop playback reads a small authoritative
actor action (item ID, starting tick and delivery/interrupt flag).

A normal delivery waits until the actor's last movement interval completes,
then plays nine frames at two ticks per frame. The item remains held until frame
5 (tick 10); the simulation releases it and completes the haul exactly once.
The actor finishes follow-through at tick 18 before taking new work. The item
remains one physical object. Its generic ground marker is hidden while the same
bag is visible in the drop clip at that tile.

Cancel, blocked route and urgent needs keep immediate reservation/item release
from GG-043. These drops start at frame 5 and show the remaining follow-through.
Actors doing a drop cannot be pushed or start walking. Needs still decay during
this short action. Rendering never transfers items or progresses work.

Schema 6 stores the drop action, validates the held/released phase and supports
versions 1–5. A released item may be consumed by another actor during follow-through;
its short-lived action reference then identifies a historical item until the clip
ends. Save/load resumes the authoritative phase without replaying the transfer.
Mining presentation remains incomplete under GG-047.
