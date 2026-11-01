# Prototype art reference — native 32×32

The owner's required presentation is a fixed three-quarter JRPG view. Every floor,
wall top, wall side and plant uses a **separate 32×32 RGBA PNG**. The owner-supplied
goblin has a 32×32 native body with 32×32 idle and padded 40×40/44×44 walk canvases. The square
gameplay grid projects to 32×32 screen pixels at the default 1× view. Camera zoom
scales the whole scene uniformly; the tile/body scale remains 32 pixels.

## Layers and anchors

- Floors: top-left at the logical cell's top-left, 32×32.
- Wall tops: their own 32×32 texture, raised one tile (32 pixels) above the cell.
- Wall sides: their own 32×32 texture, at the cell origin. Render the front face
  where a discovered open cell lies to the south; adjacent solid tiles join at
  their tops. Tops and sides use independent sprites, opacity and textures.
- Goblins: original owner-supplied PNGs, never resized or trimmed. Idle foot anchor
  is (16,30). Walking foot anchor is (width/2, (height−32)/2+30). Both are placed
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

## Owner-supplied goblin base

The original ZIP and GIFs were supplied in owner commit `5473394`. The imported
base is pinned to `public/assets/goblin/archive/Goblin-Base-5473394.zip`; the
manifest records this path and hash. Newer incoming base/hauling ZIPs at the top
level remain unchanged until their animations are curated.
`python tools/import-goblin.py` copies eight idle poses and eight frames per facing
into `base/`, recording provenance, source member names, hashes and anchors in its
manifest. It selects `west-6b9bf452`, which matches the west GIF; the alternate take
remains in the original ZIP. No source image was altered.

Eight facings are supported. Existing grid navigation remains cardinal; idle/work
facing can use diagonal poses. Frames last two 10 Hz simulation ticks (200 ms at
1×). Walking runs only while visually traversing between simulation positions;
stationary goblins use the matching idle direction. Pause and dialogs freeze the
animation. Rendering never advances work or changes authoritative state.

The padded canvases are presentation margins, not larger goblins. Do not shrink a
44×44 walk frame to a 32×32 box or recompute a different foot anchor per frame.
Use nearest-neighbour sampling at scale 1 and retain the supplied pixels. The
renderer resets cosmetic history after world replacement and picks the displayed
body during interpolation. Specialised mining/hauling poses remain future work.

See `/goblin-preview.html`, [integration screenshot](screenshots/goblin-integration.png)
and `public/assets/goblin/base/PROVENANCE.md`.
