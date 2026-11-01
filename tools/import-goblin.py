"""Copy curated cardinal PNGs unchanged from the owner's versioned source ZIPs."""
from pathlib import Path
from zipfile import ZipFile
import hashlib, json, struct

root = Path('public/assets/goblin/base')
sources = {
    'base': Path('public/assets/goblin/archive/Goblin-Base-37ad2ad.zip'),
    'hauling': Path('public/assets/goblin/archive/Goblin-Hauling-37ad2ad.zip'),
    'pick': Path('public/assets/goblin/archive/Goblin-Pick-890b554.zip'),
    'axe': Path('public/assets/goblin/archive/Goblin-Axe-890b554.zip'),
}
directions = ['south', 'east', 'north', 'west']
clips = {'idle': 8, 'walk': 8, 'haul-idle': 8, 'haul-walk': 8, 'drop': 9, 'pick-idle': 8, 'mine': 8, 'axe-idle': 8, 'axe-walk': 8, 'chop': 9}
counts = {clip: {d: count for d in directions} for clip, count in clips.items()}
counts['axe-idle']['west'] = 1
counts['chop'].update(south=8,east=8,west=8)
contacts = {'mine': {'south':5,'east':4,'north':5,'west':5},'chop': {'south':4,'east':3,'north':4,'west':4}}
frames = []
for source_id, archive in sources.items():
    with ZipFile(archive) as source:
        folder = {'base':'Base','hauling':'Hauling','pick':'Pick','axe':'Axe'}[source_id]
        character = json.loads(source.read('metadata.json'))['states'][0]['character']
        assert character['size'] == {'width': 32, 'height': 32}
        for direction in directions:
            pose = {'base':'idle','hauling':'haul-pose','pick':'pick-pose','axe':'axe-pose'}[source_id]
            members = [(f'{pose}-{direction}', f'{folder}/rotations/{direction}.png', f'{pose}/{direction}.png')]
            actions = {'base':[('idle','Idle'),('walk','Walking')], 'hauling':[('haul-idle','idle_breathing'),('haul-walk','Walking'),('drop','Chucking')], 'pick':[('pick-idle','idle_breathing'),('mine','Mining')], 'axe':[('axe-idle','Idle'),('axe-walk','Walking'),('chop','Attack')]}[source_id]
            for clip, animation in actions:
                variant = 'west-6b9bf452' if source_id == 'base' and clip == 'walk' and direction == 'west' else direction
                if source_id == 'axe' and clip == 'axe-idle' and direction == 'west':
                    members.append(('axe-idle-west-000','Axe/rotations/west.png','axe-idle/west/000.png'))
                    continue
                members += [(f'{clip}-{direction}-{i:03}', f'{folder}/animations/{animation}/{variant}/frame_{i:03}.png', f'{clip}/{direction}/{i:03}.png') for i in range(counts[clip][direction])]
            for name, member, destination in members:
                data = source.read(member)
                assert data[:8] == b'\x89PNG\r\n\x1a\n'
                width, height = struct.unpack('>II', data[16:24])
                assert width == height and width in (32, 40, 44, 48)
                target = root / destination
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
                frames.append({'id': name, 'file': destination, 'width': width, 'height': height, 'footX': width // 2, 'footY': (height - 32) // 2 + 30, 'archive': source_id, 'source': member, 'sha256': hashlib.sha256(data).hexdigest()})
manifest = {
    'bodySize': 32, 'frameDurationTicks': 2, 'dropReleaseFrame': 5,
    'directions': directions, 'clips': clips, 'directionFrameCounts':counts, 'contactFrames':contacts, 'frames': frames,
    'provenance': {
        'source': 'Owner-supplied base, hauling, pick and axe archives',
        'commit': '37ad2ad93408991f2ad286e7254f9cf3c52972d3',
        'archives': [{'id': key, 'file': str(path.relative_to(root.parent)), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'commit': '890b554136289a5e3888bec3677d5b500976655d' if key in ('pick','axe') else '37ad2ad93408991f2ad286e7254f9cf3c52972d3'} for key, path in sources.items()],
        'westVariant': 'west-6b9bf452',
        'note': 'Original PNG bytes; native padding and 32px body. Other directions and alternate takes stay in the ZIPs. Axe Attack is curated as tree chopping; no combat is added. West axe idle uses its unmodified static pose. Creative assets follow ASSETS-LICENSE.md.'
    }
}
(root / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(f'Imported {len(frames)} original cardinal goblin frames.')
# A static viewer uses the same original PNGs; tool playback in-game aligns directional contacts.
viewer = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Goblin Grotto — Cardinal animations</title><style>body{background:#152327;color:#d7e0c9;font:15px system-ui;padding:24px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}article{background:#26383a;padding:16px;border:1px solid #4d6651}h2{font-size:17px;font-weight:400}.stage{position:relative;width:144px;height:144px;background:repeating-conic-gradient(#23373a 0% 25%,#1c2d30 0% 50%) 50%/18px 18px}.stage img{position:absolute;image-rendering:pixelated}button,input{font:inherit}p{color:#b8c7af}</style></head><body><h1>Four directions. Plenty of mischief.</h1><p>Original 32px bodies and padded PNGs at 3×. Native frames and static west axe idle. Drop releases on frame 5; mining/chopping contacts are aligned by the game simulation.</p><button id="pause">Pause</button> <label>Frame <input id="frame" type="range" min="0" max="8" value="0"></label><main></main><script type="module">
const manifest=await (await fetch('assets/goblin/base/manifest.json')).json();
const cards=[];const main=document.querySelector('main');
for(const clip of Object.keys(manifest.clips))for(const direction of manifest.directions){const card=document.createElement('article');const title=document.createElement('h2');title.textContent=`${clip} · ${direction}`;const stage=document.createElement('div');stage.className='stage';const img=document.createElement('img');img.alt=`${clip} ${direction}`;stage.append(img);card.append(title,stage);main.append(card);cards.push({clip,direction,img});}
let frame=0,paused=false,last=0;
function draw(){for(const {clip,direction,img} of cards){const i=frame%manifest.directionFrameCounts[clip][direction];const f=manifest.frames.find(f=>f.id===`${clip}-${direction}-${String(i).padStart(3,'0')}`);img.src='assets/goblin/base/'+f.file;img.width=f.width*3;img.height=f.height*3;img.style.left=(72-f.footX*3)+'px';img.style.top=(126-f.footY*3)+'px';}document.querySelector('#frame').value=String(frame%9);}
document.querySelector('#pause').onclick=()=>{paused=!paused;document.querySelector('#pause').textContent=paused?'Play':'Pause';};document.querySelector('#frame').oninput=e=>{paused=true;document.querySelector('#pause').textContent='Play';frame=Number(e.target.value);draw();};function animate(now){if(!paused&&now-last>=200){frame++;last=now;draw();}requestAnimationFrame(animate);}draw();requestAnimationFrame(animate);
</script></body></html>'''
Path('public/goblin-preview.html').write_text(viewer)
