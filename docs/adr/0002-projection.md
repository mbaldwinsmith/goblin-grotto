# 0002 — Fixed three-quarter JRPG view (GG-013)

**Decision updated by owner direction:** use a three-quarter JRPG presentation.
The original implementation chose isometric after comparing two scenes. That
choice did not match the intended art direction and is superseded here.

Floors are rectangular, 32×24 screen units, on a square logical grid. East/west
movement is horizontal and north/south movement is vertical. Wall tops are raised
14 pixels with vertical front faces; upright 32×32 sprites show characters from
the front and above. Camera pan/zoom never rotates the world into a diamond.

This approach provides familiar JRPG room layouts and direct tile picking. It
trades the diamond view's diagonal depth cues for clear floor/wall layering.
Actor depth follows the logical row, with a stable column tie-break. Full
wall/actor interleaving and reveal behavior still belong to GG-018.

The historical comparison at `/projection-study.html` remains an experiment,
not a selection of the isometric option. See the current
[in-game screenshot](../screenshots/prototype.png) for the chosen view.
Projection remains isolated from simulation and saves. Production atlas creation
still waits for GG-022/GG-023, using this JRPG perspective as the requirement.
