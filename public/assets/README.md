# Source sprite library

The owner supplied 21 PixelLab scenery/item ZIPs in commit
`81b42da802f4d23674759469086e607b1c25bad8`. Their **185 PNGs** are extracted
beside the corresponding ZIPs. Archives and PNG bytes remain unchanged; the
catalog preserves source art; `src/render/scenery.ts` selects runtime roles.

## Naming convention

Use lowercase kebab-case names with a **two-digit, one-based variant** suffix:

| Kind | Pattern | Example |
| --- | --- | --- |
| Floor | `floor-<material>-<variant>.png` | `floor-rough-stone-01.png` |
| Wall surface | `wall-<material>-<variant>.png` | `wall-mud-12.png` |
| Item | `item-<resource>-<variant>.png` | `item-gems-03.png` |
| Mushroom | `<species>-<state>-<variant>.png` | `lanterncap-picked-02.png` |
| Other foliage | `<kind>-<variant>.png` | `undergrowth-06.png` |
| Tree | `tree-<species>-<variant>.png` | `tree-silver-birch-01.png` |

Keep files directly in their existing family folders. Original folder spellings
such as `roughstone` and `sandOverlay` are retained; new filenames use
`rough-stone` and `sand-overlay`. Variant numbers follow the source metadata's
export order, restarting for each family/species. Keep existing numbers when
curating future variants. A number identifies an alternative image, **not** a
rotation, animation frame, growth stage, resource quantity or quality tier.
The runtime separately curates farm stage pairs: young 01/04, growing 03/05,
mature 02/06.
Trees are grouped into larch, silver birch and pine using their source prompts.
Other family names follow the owner's folders, including logconks and redcaps.

Wall exports are used as front faces; corresponding floor families provide
separate raised tops. The `sand-overlay` name preserves the owner's folder category;
it does not assert that the exported image contains transparency.

## Inventory

Paths below are relative to `public/assets/`. Each folder also retains its ZIP
and contains `source-metadata.json`, an unchanged copy of the ZIP's metadata.

| Folder | PNGs | Native size | Filename stem |
| --- | ---: | --- | --- |
| `floors/bedrock/` | 8 | 32×32 | `floor-bedrock` |
| `floors/dwarvenstone/` | 8 | 32×32 | `floor-dwarven-stone` |
| `floors/roughstone/` | 8 | 32×32 | `floor-rough-stone` |
| `floors/sandOverlay/` | 8 | 32×32 | `floor-sand-overlay` |
| `floors/smoothstone/` | 8 | 32×32 | `floor-smooth-stone` |
| `walls/bedrock/` | 8 | 32×32 | `wall-bedrock` |
| `walls/mud/` | 16 | 32×32 | `wall-mud` |
| `walls/roughstone/` | 16 | 32×32 | `wall-rough-stone` |
| `walls/sand/` | 16 | 32×32 | `wall-sand` |
| `walls/smoothstone/` | 8 | 32×32 | `wall-smooth-stone` |
| `items/gems/` | 8 | 32×32 | `item-gems` |
| `items/ore/` | 8 | 32×32 | `item-ore` |
| `items/stone/` | 8 | 32×32 | `item-stone` |
| `items/wood/` | 8 | 32×32 | `item-wood` |
| `foliage/lanterncaps/farm/` | 6 | 32×32 | `lanterncap-farm` |
| `foliage/lanterncaps/picked/` | 8 | 32×32 | `lanterncap-picked` |
| `foliage/lanterncaps/wild/` | 10 | 32×32 | `lanterncap-wild` |
| `foliage/logconks/` | 4 | 32×32 | `logconk` |
| `foliage/redcaps/` | 4 | 32×32 | `redcap` |
| `foliage/undergrowth/` | 8 | 32×32 | `undergrowth` |
| `foliage/trees/` | 9 | 96×96 | `tree-larch`, `tree-silver-birch`, `tree-pine` (3 each) |

Totals: 40 floors, 64 walls, 32 items and 49 foliage sprites.
**176 are 32×32; nine trees are 96×96.** Original dimensions, padding, alpha and
pixel data are preserved. Trees have not been shrunk to the game's 32px tile size;
the image’s bottom-middle 32×32 square is aligned with its root tile. See
`docs/ART_BIBLE.md` for placement and depth rules.

## Provenance and reproduction

[sprite-catalog.json](sprite-catalog.json) maps every renamed PNG to its source
ZIP, original member path and PixelLab object ID. It records native dimensions,
file SHA-256, original archive SHA-256, metadata SHA-256 and owner source commit.
`source-metadata.json` retains the original prompts and export/group metadata;
its embedded paths refer to entries **inside the original ZIP**, not the renamed
files. Use the catalog's `file` paths for the extracted copies.

From the repository root:

```sh
python tools/extract-scenery.py
python tools/extract-scenery.py --check
```

The importer preflights every destination, refuses to overwrite edited art,
checks one-to-one coverage of all archived PNGs and preserves bytes exactly.
`--check` verifies the catalog, metadata and every extracted PNG without writing.
To curate another export, review its metadata and update the importer family/source
mapping deliberately. Goblin animation imports remain in `tools/import-goblin.py`.

These creative assets follow [ASSETS-LICENSE.md](../../ASSETS-LICENSE.md) at the
repository root; source code's MIT licence does not relicense the artwork.


The reviewed 16-sprite mud batch is pinned at
`walls/mud/archive/pixellab-16-objects-81b42da.zip`. A later incoming eight-image
mud ZIP remains untouched in `walls/mud/`; it is awaiting a separate curation pass.
The runtime catalog and extractor use the pinned batch, keeping the reviewed
185-sprite set reproducible when the incoming export is replaced.
