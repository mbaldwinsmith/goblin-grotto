# Owner-supplied cardinal goblin animations

Source: the owner's `Goblin-Base.zip` and `Goblin-Hauling.zip` in commit
`37ad2ad93408991f2ad286e7254f9cf3c52972d3`. Version-pinned copies live in
`../archive/Goblin-Base-37ad2ad.zip` and `../archive/Goblin-Hauling-37ad2ad.zip`.
Incoming top-level ZIPs remain unchanged. The original `5473394` base is archived.

`manifest.json` records both archive hashes, exact member paths and the SHA-256 of
every imported PNG. `python tools/import-goblin.py` copies 172 frames unchanged:
four static poses per pack, four eight-frame clips per direction (idle, walk,
loaded idle and loaded walk) and the nine-frame Chucking/put-down clip. The
canonical base west walk remains `west-6b9bf452`; alternatives and uncurated attack
clips stay in the source ZIPs. Legacy diagonal files are retained but not loaded.

The body stays at native 32×32 scale. Original animation canvases are
40×40/44×44/48×48, never resized, trimmed, cropped or mirrored. Feet use
(width/2, (height−32)/2+30). Frames last two game ticks; normal item release is
at frame 5 (zero based), after the swing when the bag leaves the goblin's hands.
Interruptions free the item immediately and show the release/follow-through.

Creative assets follow ASSETS-LICENSE.md and are not relicensed under MIT.
