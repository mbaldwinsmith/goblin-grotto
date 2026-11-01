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

Updated base/hauling ZIPs arrived in owner commit `37ad2ad`. The importer reads
version-pinned copies in `public/assets/goblin/archive/`, preserving incoming ZIPs.
It copies 172 original PNGs: four static poses per pack, four eight-frame clips per
direction (empty idle/walk and loaded idle/walk), and a nine-frame put-down clip.
The manifest records archive/member hashes, dimensions and foot anchors. Base
west walking uses `west-6b9bf452`; other takes and attack clips stay archived.

Frames last two 10 Hz simulation ticks. Idle breathing runs while stationary;
sleeping uses a static pose. Carrying state selects the loaded sprites. Pause,
dialogs and hidden tabs freeze animation. Normal deliveries put down their item on
frame 5 (zero based) and finish the follow-through on tick 18; interruption drops
release immediately and show the last four frames. These events are simulation
rules, never triggered by rendering. See ADR 0005 for save and item semantics.

The padded canvases are margins, not larger goblins. Never shrink a 48×48 frame
into 32×32, trim its canvas, move its foot anchor independently or stretch it.
Feet use (width/2, (height−32)/2+30), with nearest sampling at scale 1. Sprite
selection and depth use displayed positions. Mining animation remains GG-047;
attack art is not silently repurposed as mining.

`/goblin-preview.html` shows all 20 clips at 3× with pause and frame controls.
See [cardinal gallery](screenshots/cardinal-animations.png),
[hauling](screenshots/hauling.png) and [drop](screenshots/drop.png).
