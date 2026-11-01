# 0009 — Native scenery, tree roots and cosmetic variants

Status: accepted for prototype.14, pending merge.

Use the owner's extracted 185 original PNGs through the existing source catalog.
Keep native bytes, padding, alpha and scale. The role selector is a pure rendering
module; a coordinate/identity hash of the existing seed chooses stable alternatives
without touching simulation RNG or introducing save fields. Terrain top/face roles
are separate sprites. Wall sources provide faces and corresponding floor sources
provide raised tops. Existing references cover unsupplied grass, mud floors,
impenetrable boundaries and bed-kit markers. Ruins and constructed wall tops use
dwarven stone. All nine tree variants are available at native 96×96.

The owner specifies a tree's bottom-middle 32×32 square as its anchor. Source
(32,64)..(64,96) maps exactly to the logical root tile. Therefore the image origin
is tile origin minus (32,64), while depth remains root feet +28. Canopies may
cover adjacent cells without changing navigation or work reservations. Inspection
and Gather clicks on the canopy resolve to the root. Foreground depth still wins;
Reveal bypasses canopy occlusion for actors, and selected actors fade intersecting
foreground trees. A hidden or chopped root has no visible canopy.

The owner also specifies two farm images per growth stage. Visual curation pairs
01/04 as young, 03/05 as growing and 02/06 as mature. Young is 0–199 growth ticks,
growing 200–599, and mature begins at the existing harvest threshold of 600.
The same hash bit chooses the first/second alternative across all stages.

Ground resources use native piles or picked mushroom baskets. Held cargo and
items represented by the drop animation remain suppressed; their IDs, quantities
and storage rules are unchanged. Generic ore art covers existing metal types;
precise identity remains in the inspector. Decorative logconks/redcaps stay within
the existing undergrowth feature, adding no unplanned food rules.

Schema 9 stays current: this change is presentation and picking. A packed atlas
remains open under GG-023; separate source textures preserve a simple swap seam.


Supplied terrain PNGs have transparent gaps, especially the sparse sand overlays.
Native reference tiles provide solid backing beneath ground, tops and faces,
preserving source alpha and a continuous surface. Wall reveal hides these
backings while fading the supplied face/top.


The owner subsequently requests perspective lighting. Apply two shared 32-step gradient textures in the renderer: a slight upper-face highlight fading into foot shade,
and dark roof texture fading to black away from the exposed front edge. Interior
top tiles merge into black. Keep shading in the existing cached props Graphics;
include reveal/fade state in its cache signature. Fading a wall removes lighting
and backing so the roof cannot mask revealed actors. Excavation clears the props.

The wall lighting reuses two 32-step nearest-sampled gradient textures; each
exposed wall adds two simple rectangles to its cached props, avoiding per-row
geometry or per-wall gradient allocation.

Scenery updates/rendering are limited to the camera region, retaining a margin
for tree roots whose 96px canopies extend into view. A regression checks all
intersecting canopies at map edges and multiple zoom levels.
