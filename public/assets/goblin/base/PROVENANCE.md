# Owner-supplied cardinal goblin animations

Base/hauling source: owner commit `37ad2ad93408991f2ad286e7254f9cf3c52972d3`.
Pick source: owner commit `890b554136289a5e3888bec3677d5b500976655d`.
Axe source: owner commit `8c96e74` (latest update; east/west idle cycles absent).
Version-pinned copies of all four ZIPs live in `../archive/`; incoming top-level
ZIPs remain unchanged. The original `5473394` base is archived too.

`manifest.json` records each archive hash/commit, exact member paths and every
PNG SHA-256. `python tools/import-goblin.py` copies 359 frames unchanged: the
previous 172 base/haul frames, 68 pick frames, 87 axe frames and 32 Base/Attack frames. This includes
static poses, empty/loaded idle and walk, put-down, pick idle/mining and axe
idle/walk/chopping. Axe/Attack is used for tree chopping at the owner's request,
not combat. Base/Attack supplies eight mushroom-gathering frames per cardinal
direction, with contact on source frame 4. The gallery contains 44 directional clips.
Base west walk uses `west-6b9bf452`. East/west axe idle cycles are absent
from the source: their original static rotations provide one-frame fallbacks.
No pick walking clip exists: gameplay uses the base walk while approaching.
Other takes and legacy diagonal files are retained but not loaded.

Bodies stay at native 32px scale. Original 32/40/44/48px PNG canvases are never
resized, trimmed, cropped or mirrored. Feet use (width/2, (height−32)/2+30).
Idle/walk/drop frames last two ticks; drop releases on frame 5. Tool playback
samples source frames in order across 18 ticks, aligning direction-specific
contact frames with tick 10. Work is applied by the simulation, never the renderer.
The nine-frame north chop has the same strike rate as the eight-frame directions.

Creative assets follow ASSETS-LICENSE.md and are not relicensed under MIT.
