"""Copy the owner's terrain/item/foliage PNGs unchanged beside their source ZIPs.

Run from anywhere: python tools/extract-scenery.py [--check]
This prepares source art only; it does not modify the renderer or runtime manifests.
"""
import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path, PurePosixPath
import struct
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1] / 'public/assets'
SOURCE_COMMIT = '81b42da802f4d23674759469086e607b1c25bad8'
# Preserve the owner's folder layout. Use kebab-case only for the extracted names.
FAMILIES = {
    'floors/bedrock': 'floor-bedrock',
    'floors/dwarvenstone': 'floor-dwarven-stone',
    'floors/roughstone': 'floor-rough-stone',
    'floors/sandOverlay': 'floor-sand-overlay',
    'floors/smoothstone': 'floor-smooth-stone',
    'walls/bedrock': 'wall-bedrock',
    'walls/mud': 'wall-mud',
    'walls/roughstone': 'wall-rough-stone',
    'walls/sand': 'wall-sand',
    'walls/smoothstone': 'wall-smooth-stone',
    'foliage/lanterncaps/farm': 'lanterncap-farm',
    'foliage/lanterncaps/picked': 'lanterncap-picked',
    'foliage/lanterncaps/wild': 'lanterncap-wild',
    'foliage/logconks': 'logconk',
    'foliage/redcaps': 'redcap',
    'foliage/undergrowth': 'undergrowth',
    'foliage/trees': 'tree',
    'items/gems': 'item-gems',
    'items/ore': 'item-ore',
    'items/stone': 'item-stone',
    'items/wood': 'item-wood',
}


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def collect():
    outputs, archives, sprites = {}, [], []
    for family, stem in sorted(FAMILIES.items()):
        folder = ROOT / family
        sources = sorted(folder.glob('*.zip'))
        if len(sources) != 1:
            raise ValueError(f'{family}: expected one source ZIP, found {len(sources)}')
        archive = sources[0]
        archive_path = archive.relative_to(ROOT).as_posix()
        metadata_path = f'{family}/source-metadata.json'
        with ZipFile(archive) as z:
            metadata_bytes = z.read('metadata.json')
            metadata = json.loads(metadata_bytes)
            outputs[metadata_path] = metadata_bytes
            archives.append({
                'file': archive_path, 'sha256': sha256(archive.read_bytes()),
                'sourceCommit': SOURCE_COMMIT, 'metadataFile': metadata_path,
                'metadataSha256': sha256(metadata_bytes),
            })
            folders = {o['id']: g['folder'] for g in metadata['groups'] for o in g['objects']}
            counts, imported = Counter(), set()
            for obj in metadata['objects']:
                if len(obj['rotations']) != 1 or obj['animations']:
                    raise ValueError(f'{archive_path}: expected static, single-view scenery')
                rotation = next(iter(obj['rotations'].values()))
                member = str(PurePosixPath(folders[obj['id']]) / rotation)
                if member in imported:
                    raise ValueError(f'Duplicate source member: {member}')
                imported.add(member)
                data = z.read(member)
                if data[:8] != b'\x89PNG\r\n\x1a\n':
                    raise ValueError(f'Not a PNG: {member}')
                width, height = struct.unpack('>II', data[16:24])
                expected = (96, 96) if stem == 'tree' else (32, 32)
                if (width, height) != expected:
                    raise ValueError(f'Unexpected native size: {member}: {width}x{height}')
                name = stem
                if stem == 'tree':
                    prompt = obj['prompt'].lower()
                    species = next((s for s in ['larch', 'silver birch', 'pine'] if s in prompt), None)
                    if species is None:
                        raise ValueError(f'Unknown tree species: {member}')
                    name = f'tree-{species.replace(" ", "-")}'
                counts[name] += 1
                variant = counts[name]
                sprite_id = f'{name}-{variant:02}'
                destination = f'{family}/{sprite_id}.png'
                if destination in outputs:
                    raise ValueError(f'Output collision: {destination}')
                outputs[destination] = data
                sprites.append({
                    'id': sprite_id, 'file': destination, 'family': family,
                    'variant': variant, 'width': width, 'height': height,
                    'sha256': sha256(data), 'sourceArchive': archive_path,
                    'sourceMember': member, 'sourceObjectId': obj['id'],
                })
            pngs = {n for n in z.namelist() if n.lower().endswith('.png')}
            if imported != pngs:
                raise ValueError(f'{archive_path}: source PNG coverage does not match metadata')
    if len({sprite['id'] for sprite in sprites}) != len(sprites):
        raise ValueError('Sprite IDs must be unique across the catalog')
    catalog = {
        'formatVersion': 1, 'status': 'extracted-source-art',
        'source': 'Owner-supplied PixelLab exports', 'license': 'ASSETS-LICENSE.md',
        'archives': archives, 'sprites': sprites,
    }
    outputs['sprite-catalog.json'] = (json.dumps(catalog, indent=2) + '\n').encode()
    return outputs, archives, sprites


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify all outputs without writing files')
    args = parser.parse_args()
    outputs, archives, sprites = collect()
    # Preflight every destination before writing; never overwrite edited art.
    for file, data in outputs.items():
        target = ROOT / file
        if target.exists() and target.read_bytes() != data:
            raise ValueError(f'{file} differs from its source; preserve/review the edit before regenerating')
        if args.check and not target.is_file():
            raise ValueError(f'Missing output: {file}')
    if not args.check:
        for file, data in outputs.items():
            (ROOT / file).write_bytes(data)
    mode = 'Verified' if args.check else 'Extracted'
    print(f'{mode} {len(sprites)} unchanged PNGs from {len(archives)} archives.')
    print('Native sizes: ' + ', '.join(f'{n} at {w}x{h}' for (w, h), n in sorted(Counter((s['width'], s['height']) for s in sprites).items())))


if __name__ == '__main__':
    main()
