# 0002 — Fixed three-quarter JRPG view (GG-013)

**Decision updated by owner direction:** use a three-quarter JRPG presentation.
The original implementation chose isometric after comparing two scenes. That
choice did not match the intended art direction and is superseded here.

The owner subsequently specified a 32×32 native tile standard. Floors now project
to square 32×32 screen pixels at 1×. East/west movement is horizontal and north/south
movement is vertical. Wall tops and wall sides are separate 32×32 PNGs and separate
sprites: tops are raised 32 pixels, while exposed front faces occupy the wall cell.
Upright 32×32 goblins and all plant sprites retain their untrimmed native canvases.
Camera pan/zoom never rotates the world into a diamond.

This approach provides familiar JRPG room layouts and direct tile picking. It
trades the diamond view's diagonal depth cues for clear floor/wall layering.
Actor depth follows the logical row, with a stable column tie-break. Walls, items and actors now interleave by their logical foot depth (GG-018).
Selecting a goblin fades nearby foreground walls; Reveal walls deliberately
prioritizes actor silhouettes for picking through those walls.

The historical comparison at `/projection-study.html` remains an experiment,
not a selection of the isometric option. See the current
[in-game screenshot](../screenshots/prototype.png) for the chosen view.
Projection remains isolated from simulation and saves. Production atlas creation
still waits for GG-022/GG-023, using this JRPG perspective as the requirement.
