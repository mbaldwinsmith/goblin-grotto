import { Assets, type Texture } from "pixi.js";
import catalog from "../../public/assets/sprite-catalog.json";
import manifest from "../../public/assets/prototype/manifest.json";
export async function loadArt(): Promise<Record<string, Texture>> {
  const textures = await Assets.load<Record<string, Texture>>([
    ...catalog.sprites.map((s) => ({
      alias: s.id,
      src: `${import.meta.env.BASE_URL}assets/${s.file}`,
    })),
    ...manifest.assets
      .filter((asset) => !asset.id.startsWith("goblin-"))
      .map((asset) => ({
        alias: asset.id,
        src: `${import.meta.env.BASE_URL}assets/prototype/${asset.file}`,
      })),
  ]);
  for (const texture of Object.values(textures))
    texture.source.scaleMode = "nearest";
  return textures;
}
