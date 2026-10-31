# Prototype art reference

Fixed three-quarter JRPG view: rectangular 32×24 floors and upright 32×32 actors,
raised wall tops with vertical front faces, square gameplay grid; no camera rotation.
The [projection comparison](screenshots/projection-study.png) records the historical experiment; ADR 0002 records the owner-corrected JRPG choice.
Goblin sprites are original 32×32 pixel drawings in `src/render/scene.ts`, with
feet at approximately (16,29), nearest-neighbour sampling, olive skin, warm coats,
and teal mushrooms against blue-grey stone. See [in-game reference](screenshots/prototype.png).

These are temporary code-drawn references, not PixelLab production atlases.
GG-022 (full animation/orientation/export standards) and GG-023 (curated atlas)
remain open. No external artwork, fonts, or audio was imported.

Depth sorting uses logical feet with stable column ties. Wall reveal changes only
visual opacity and inspection priority, never world solidity or navigation.

Landmarks use original code-drawn markers in `src/render/features.ts`. Resource
veins use distinct iron/copper/gold/gem colours; decorative vegetation, entrances
and approach markers stay within the fixed JRPG projection. Fog suppresses their
rendering until discovered. These remain temporary references, not production art.
