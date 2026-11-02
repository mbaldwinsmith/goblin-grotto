# Source sprite library

The active library contains **153 PNGs from 19 owner-supplied PixelLab ZIPs**, extracted
beside the corresponding ZIPs. Archives and PNG bytes remain unchanged; the
catalog preserves source art; `src/render/scenery.ts` selects runtime roles.

## Naming convention

Use lowercase kebab-case names with a **two-digit, one-based variant** suffix:

| Kind | Pattern | Example |
| --- | --- | --- |
| Floor | `floor-<material>-<variant>.png` | `floor-rough-stone-01.png` |
| Wall surface | `wall-<material>-<variant>.png` | `wall-dirt-07.png` |
| Item | `item-<resource>-<variant>.png` | `item-gems-03.png` |
| Mushroom | `<species>-<state>-<variant>.png` | `lanterncap-picked-02.png` |
| Other foliage | `<kind>-<variant>.png` | `undergrowth-06.png` |
| Tree | `tree-<species>-<variant>.png` | `tree-silver-birch-01.png` |

Keep files directly in their existing family folders. Original folder spellings
such as `roughstone` are retained; new filenames use `rough-stone`. Variant numbers follow the source metadata's
export order, restarting for each family/species. Keep existing numbers when
curating future variants. A number identifies an alternative image, **not** a
rotation, animation frame, growth stage, resource quantity or quality tier.
The runtime separately curates farm stage pairs: young 01/04, growing 03/05,
mature 02/06.
Trees are grouped into larch, silver birch and pine using their source prompts.
Other family names follow the owner's folders, including logconks and redcaps.

Wall exports are used as front faces; corresponding floor families provide
separate raised tops. Dirt uses the native reference floor and top, with the new
supplied dirt faces.

## Inventory

Paths below are relative to `public/assets/`. Each folder also retains its ZIP
and contains `source-metadata.json`, an unchanged copy of the ZIP's metadata.

| Folder | PNGs | Native size | Filename stem |
| --- | ---: | --- | --- |
| `floors/bedrock/` | 8 | 32×32 | `floor-bedrock` |
| `floors/dwarvenstone/` | 8 | 32×32 | `floor-dwarven-stone` |
| `floors/roughstone/` | 8 | 32×32 | `floor-rough-stone` |
| `floors/smoothstone/` | 8 | 32×32 | `floor-smooth-stone` |
| `walls/bedrock/` | 8 | 32×32 | `wall-bedrock` |
| `walls/dirt/` | 8 | 32×32 | `wall-dirt` |
| `walls/roughstone/` | 16 | 32×32 | `wall-rough-stone` |
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

Totals: 32 floors, 40 walls, 32 items and 49 foliage sprites.
**144 are 32×32; nine trees are 96×96.** Original dimensions, padding, alpha and
pixel data are preserved. Trees have not been shrunk to the game's 32px tile size;
the image’s bottom-middle source square is scaled to align with its root tile. See
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


Most source archives originate at owner commit `81b42da802f4d23674759469086e607b1c25bad8`.
The eight dirt walls come from `04ed6d9ff994cd7d0d1a08912aa1783fafdf657e`,
where the source archive was `walls/mud/pixellab-8-objects-2026-11-01.zip`.
It is moved unchanged to `walls/dirt/`; SHA-256:
`7afa6b0a107e1fc4fc28063ec6daaa83c3c3bd84ffb5aed53dc0e28d64016738`.
At the owner’s request these replace the old 16-wall family, and all sand sources
are removed from the active library. Retired files remain in Git history.

## Display scale revision — prototype.16

The display grid is now 48×48. Original source PNGs, dimensions, padding, hashes
and native anchors remain unchanged. Existing 32px art displays uniformly at 1.5×;
96px trees display at 144px, keeping their bottom-middle square on the 48px root
tile. Native 48px terrain will fit at scale 1 once imported. Source galleries
continue to show original dimensions, independently of the game’s display grid.
