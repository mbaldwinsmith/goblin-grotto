# 0002 — Fixed isometric view for the prototype (GG-013)

Compared 64×32 isometric floors with JRPG oblique rectangular floors using 32×32
actors, wall overlaps, an item and floor picking. Reproduce at
`/projection-study.html`; the browser test checks both inverse tile picks.
See [comparison](../screenshots/projection-study.png).

Choose isometric: the cave reads as a spatial home, corners and tunnels are clear,
and the silhouette remains readable at small sizes. Oblique makes click mapping
simpler and offers more floor area, but looks flatter and walls cover more of the
actor. The cost of isometric is depth sorting and foreground occlusion; GG-018
remains open until a reveal mode and correct interleaving are verified.

Runtime floors are 32×16 logical screen units scaled by the camera; 32×32 goblins
are deliberately oversized and expressive. Projection is isolated from square-grid
simulation. Production atlas creation still waits for GG-022 and GG-023.
