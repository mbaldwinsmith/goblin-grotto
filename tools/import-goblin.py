"""Import the owner's original PNG bytes, retaining padded animation canvases."""
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, struct
archive = Path('public/assets/goblin/Goblin-Base.zip')
root = archive.parent / 'base'
directions = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west']
frames = []
with ZipFile(archive) as source:
    metadata = json.loads(source.read('metadata.json'))
    character = metadata['states'][0]['character']
    assert character['size'] == {'width': 32, 'height': 32}
    for direction in directions:
        members = [(f'idle-{direction}', f'Base/rotations/{direction}.png', f'idle/{direction}.png')]
        # This west take matches the owner's Base_v3_walking_west.gif preview.
        walking = 'west-6b9bf452' if direction == 'west' else direction
        members += [(f'walk-{direction}-{i:03}', f'Base/animations/Walking/{walking}/frame_{i:03}.png', f'walk/{direction}/{i:03}.png') for i in range(8)]
        for name, member, destination in members:
            data = source.read(member)
            assert data[:8] == b'\x89PNG\r\n\x1a\n'
            width, height = struct.unpack('>II', data[16:24])
            assert width == height and width in (32, 40, 44)
            target = root / destination
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
            frames.append({'id': name, 'file': destination, 'width': width, 'height': height, 'footX': width // 2, 'footY': (height - 32) // 2 + 30, 'source': member, 'sha256': hashlib.sha256(data).hexdigest()})
manifest = {'bodySize': 32, 'frameDurationTicks': 2, 'directions': directions, 'frames': frames, 'provenance': {'source': 'Owner-supplied Goblin-Base.zip', 'commit': '54733942f321de07ad064e1cd03688507760b39e', 'archiveSha256': hashlib.sha256(archive.read_bytes()).hexdigest(), 'view': character['view'], 'westVariant': 'west-6b9bf452', 'note': 'Original frames copied byte-for-byte. Alternate west take retained in the ZIP. Creative assets follow ASSETS-LICENSE.md.'}}
(root / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Imported {len(frames)} original goblin frames.')

# Author-facing preview: original GIFs alongside the canonical idle poses.
cards = []
for direction in directions:
    height = 44 if direction in ('north', 'south') else 40
    idle = f'<div class="stage"><img alt="{direction} idle" width="96" height="96" style="left:18px;top:20px" src="assets/goblin/base/idle/{direction}.png"></div>'
    walk = f'<div class="stage"><img alt="{direction} walking" width="{height*3}" height="{height*3}" style="left:{66-height*1.5}px;top:{110-((height-32)/2+30)*3}px" src="assets/goblin/Base_v3_walking_{direction}.gif"></div>'
    cards.append(f'<article><h2>{direction}</h2><div class="poses">{idle}{walk}</div><p>32px body · idle / walking at 3×</p></article>')
Path('public/goblin-preview.html').write_text('<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Goblin Grotto — Base goblin</title><style>body{background:#152327;color:#d7e0c9;font:14px system-ui;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}article{background:#26383a;padding:16px;border:1px solid #4d6651}h2{font-weight:400;text-transform:capitalize}.poses{display:flex;gap:16px}.stage{position:relative;width:132px;height:132px;background:repeating-conic-gradient(#23373a 0% 25%,#1c2d30 0% 50%) 50%/18px 18px}.stage img{position:absolute;image-rendering:pixelated}p{color:#b8c7af}</style></head><body><h1>The new grotto goblin</h1><p>Owner-supplied eight-direction base and original walk previews. Padding is retained; every body stays at its native pixel scale.</p><main>'+''.join(cards)+'</main></body></html>')
