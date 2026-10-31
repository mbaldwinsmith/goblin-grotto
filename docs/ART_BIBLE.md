# Prototype art reference — native 32×32

The owner's required presentation is a fixed three-quarter JRPG view. Every floor,
wall top, wall side, goblin and plant is a **separate 32×32 RGBA PNG**. The square
gameplay grid projects to 32×32 screen pixels at the default 1× view. Camera zoom
scales the whole scene uniformly; the source art remains 32×32.

## Layers and anchors

- Floors: top-left at the logical cell's top-left, 32×32.
- Wall tops: their own 32×32 texture, raised one tile (32 pixels) above the cell.
- Wall sides: their own 32×32 texture, at the cell origin. Render the front face
  where a discovered open cell lies to the south; adjacent solid tiles join at
  their tops. Tops and sides use independent sprites, opacity and textures.
- Goblins: untrimmed 32×32 transparent canvases, bottom anchor (16,32), positioned
  at the cell's horizontal centre and logical foot offset 28. Four coat variants.
- Plants: untrimmed 32×32 transparent canvases at the cell origin. Separate tree,
  edible mushroom, grove, undergrowth and young/ripe mushroom-patch images.

Depth follows logical feet with stable column ties. Reveal walls changes opacity
and inspection priority, never world solidity or navigation. Unknown tiles and
plants stay hidden. All drawing coordinates are integer pixels. Use nearest-neighbour
sampling; no per-sprite stretching, smoothing, atlas trimming or automatic cropping.

## Files and reproduction

`public/assets/prototype/manifest.json` lists 29 individual sprites and their native
dimensions. Six terrain families each have a floor, wall-top and wall-side image;
grass, four goblins and six plant images complete the set.

Run `node tools/generate-pixel-art.mjs` to reproduce the original pixel art. No
external game images, fonts or audio were imported. Source art and generated
creative assets follow ASSETS-LICENSE.md; the manifest records their origin.

The art preview is served at `/art-preview.html`, showing
all separate tiles at 3×. See [preview screenshot](screenshots/art-preview.png) and
[in-game reference](screenshots/prototype.png).

Validation: every manifest file must decode, remain 32×32, preserve alpha and use
nearest sampling. Tests verify file dimensions and browser decoding, projection,
picking, wall reveal, painting and camera controls. Keep floor edges aligned with
the grid at native size.

This is an original prototype reference set. GG-022/GG-023 remain open for the full
production art bible, directional idle/walk animation standards and curated atlas.
Landmark props still use original code-drawn markers in `src/render/features.ts`.
