# Prototype art reference — native 32×32

The owner's required presentation is a fixed three-quarter JRPG view. Every floor,
wall top, wall side and plant uses a **separate 32×32 RGBA PNG**. The owner-supplied
goblin has a 32×32 native body, 32×32 static poses and padded 40×40/44×44/48×48 animation canvases. The square
gameplay grid projects to 32×32 screen pixels at the default 1× view. Camera zoom
scales the whole scene uniformly; the tile/body scale remains 32 pixels.

## Layers and anchors

- Floors: top-left at the logical cell's top-left, 32×32.
- Wall tops: their own 32×32 texture, raised one tile (32 pixels) above the cell.
- Wall sides: their own 32×32 texture, at the cell origin. Render the front face
  where a discovered open cell lies to the south; adjacent solid tiles join at
  their tops. Tops and sides use independent sprites, opacity and textures.
- Goblins: original owner-supplied PNGs, never resized or trimmed. Idle foot anchor
  is (16,30). Every animation foot anchor is (width/2, (height−32)/2+30). Both are placed
  at the cell centre and logical foot offset 28, retaining the same body scale.
- Plants: untrimmed 32×32 transparent canvases at the cell origin. Separate tree,
  edible mushroom, grove, undergrowth and young/ripe mushroom-patch images.

Depth follows logical feet with stable column ties. Reveal walls changes opacity
and inspection priority, never world solidity or navigation. Unknown tiles and
plants stay hidden. Source art uses native integer pixels; render interpolation moves the sprite without changing its scale. Use nearest-neighbour
sampling; no per-sprite stretching, smoothing, atlas trimming or automatic cropping.

## Files and reproduction

`public/assets/prototype/manifest.json` lists 29 individual sprites and their native
dimensions. Six terrain families each have a floor, wall-top and wall-side image;
grass, four legacy placeholder goblins and six plant images complete the set. The
live game loads the supplied base instead of those four placeholder textures.

Run `node tools/generate-pixel-art.mjs` to reproduce the original pixel art. No
external game images, fonts or audio were imported. Source art and generated
creative assets follow ASSETS-LICENSE.md; the manifest records their origin.

The art preview is served at `/art-preview.html`, showing
all separate tiles at 3×. See [preview screenshot](screenshots/art-preview.png) and
[in-game reference](screenshots/prototype.png).

Validation: terrain/plant files must decode at 32×32; supplied goblin frames must
retain their manifest dimensions and hashes. All preserve alpha and use
nearest sampling. Tests verify file dimensions and browser decoding, projection,
picking, wall reveal, painting and camera controls. Keep floor edges aligned with
the grid at native size.

This is an original prototype reference set. GG-022/GG-023 remain open for the full
production art bible, directional idle/walk animation standards and curated atlas.
Landmark props still use original code-drawn markers in `src/render/features.ts`.

## Owner-supplied cardinal goblins

The owner now requests **four cardinal directions**: south, east, north and west.
Grid navigation already uses four neighbours. Work-facing chooses the dominant
axis; vertical wins a tie. Diagonal poses remain legacy references and are not
loaded. Do not mirror a cardinal clip to invent another direction.

Base/hauling ZIPs are pinned to owner commit `37ad2ad`; pick ZIP to `890b554` and latest axe ZIP to `8c96e74`.
The importer reads unchanged copies in `public/assets/goblin/archive/` and copies
327 original PNGs. The manifest records archive/member hashes, dimensions, foot
anchors, per-direction frame counts and curated contact frames. Base west walking
uses `west-6b9bf452`; other takes stay archived.

Idle and walking frames last two 10 Hz simulation ticks. Sleeping uses a static
pose; carrying selects loaded sprites. Normal delivery releases on frame 5 and
finishes on tick 18; interrupted delivery frees cargo immediately (ADR 0005).
Pick Mining and Axe Attack are curated for mining and tree chopping, per the
owner's instruction; this adds no combat. Tool frames remain in source order but
are sampled across an 18-tick cycle so their directional contact aligns with tick
10. The north chop has nine frames; other swings have eight. Each impact applies
18 work once, independent of renderer calls (ADR 0008). Missing east/west axe idle cycles
use the supplied static poses; pick approach uses the base walk because no
pick walking clip exists. Neither fallback invents or mirrors art.

Pause, dialogs and hidden tabs freeze every clip. Swing/drop timelines live in
simulation saves; renderer interpolation changes only displayed position.

The padded canvases are margins, not larger goblins. Never shrink a 48×48 frame
into 32×32, trim its canvas, move its foot anchor independently or stretch it.
Feet use (width/2, (height−32)/2+30), with nearest sampling at scale 1. Sprite
selection and depth use displayed positions.

`/goblin-preview.html` shows all 40 directional clips at 3× with pause and frame controls.
See [cardinal gallery](screenshots/cardinal-animations.png),
[mining/chopping](screenshots/mining-chopping.png), [hauling](screenshots/hauling.png) and [drop](screenshots/drop.png).


## Prepared terrain, item and foliage source sprites

The owner’s 21 exports from commit `81b42da` are extracted alongside their ZIPs
under `public/assets/floors/`, `walls/`, `items/` and `foliage/`. This prepares
185 source PNGs with documented names and provenance; runtime curation remains
GG-022/GG-023. See the [inventory and naming convention](../public/assets/README.md)
and [source catalog](../public/assets/sprite-catalog.json).

Use lowercase kebab-case filenames with a two-digit, one-based variant suffix:
`floor-bedrock-01.png`, `wall-rough-stone-01.png`, `item-wood-01.png`,
`lanterncap-farm-01.png`, `tree-silver-birch-01.png`. Keep the owner's existing
family directories. Numbers represent source alternatives, not animation frames,
rotation, growth or quantity. Wall surface exports have not yet been assigned
separate top/side roles.

All 176 non-tree images retain 32×32 canvases; all nine tree source images retain
96×96 canvases. This is a source-art exception to the current 32×32 runtime plant
reference, not a change to the tile grid. Future tree placement/foot anchors need
curation before integration. Preserve all original PNG bytes, alpha and padding;
never automatically resize or crop these sources to fit the prototype renderer.

Reproduce with `python tools/extract-scenery.py`; validate with `--check`.
The catalog records exact original member paths, IDs, dimensions and SHA-256s.
Every family includes unchanged `source-metadata.json`; embedded original paths
refer to its ZIP, while the catalog provides the extracted file paths. Original
ZIPs remain in place. Creative rights follow ASSETS-LICENSE.md.
