# Owner-supplied base goblin

Source: `../Goblin-Base.zip`, added in repository commit
`54733942f321de07ad064e1cd03688507760b39e` by the project owner, who requested
integration. Original ZIP, metadata and GIF previews remain intact.

`manifest.json` records the archive hash, exact member path and SHA-256 of every
imported PNG. `python tools/import-goblin.py` copies the 8 idle rotations and 64
canonical walking frames byte-for-byte. The west take `west-6b9bf452` matches the
supplied west GIF; the alternate take stays in the ZIP.

The archive describes a 32×32 low-top-down character with eight directions.
Idle frames are 32×32. Walk frames use 40×40 or 44×44 padded canvases. They are not
resized, trimmed or cropped. Feet are anchored at (width/2, padding+30), where
padding=(height-32)/2, so the body remains at native scale. Two simulation ticks
per frame match the previews' 200 ms at the 10 Hz game clock.

These creative assets follow the project's ASSETS-LICENSE.md; their inclusion
here does not relicense them under the source-code MIT licence. The metadata does
not establish additional third-party licensing terms or authorship claims.
