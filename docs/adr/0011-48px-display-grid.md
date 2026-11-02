# 0011 — 48px display cells with preserved source art

Status: accepted for prototype.16, pending merge.

The owner has purchased a tileset bundle and explicitly revises the grid to
48×48. This supersedes the 32px display contract in ADRs 0002 and 0009 and the
corresponding GG-022 art criteria. Keep the fixed three-quarter JRPG projection
and four cardinal directions. Do not change logical map coordinates or saves.

Project cells and wall height at 48px. Fit single-cell floor/top/face/plant/item
textures to 48×48, allowing either existing 32px sources (scale 1.5) or future
48px sources (scale 1). Preserve original PNGs, archive hashes, alpha and padding.
Do not destructively resample the source library.

Scale existing goblin bodies and complete padded canvases uniformly by 1.5.
Multiply source foot anchors by the same factor and use display foot offset 42.
Native 96px trees display at 144px; the original bottom-middle 32px square maps
to the 48px root cell. Update picking and camera/culling geometry accordingly.
Legacy vector props and overlay markers retain their 32px design coordinates
inside a 1.5 drawing transform. Wall shading uses the 48px display geometry.

Fractional enlargement means some original source pixels occupy one display
pixel and others two; nearest sampling keeps edges sharp but is not new native
48px detail. Use supplied native 48px terrain when available. The purchased
archives have not been supplied, and this change imports none of their content.
Logical positions, animation ticks and schema 10 remain unchanged.
