import { Assets, type Texture } from "pixi.js";
import manifest from "../../public/assets/goblin/base/manifest.json";
export interface GoblinFrame {
  id: string;
  file: string;
  width: number;
  height: number;
  footX: number;
  footY: number;
}
export const goblinFrames = new Map<string, GoblinFrame>(
  manifest.frames.map((frame) => [frame.id, frame]),
);
export async function loadGoblinArt(): Promise<Record<string, Texture>> {
  const textures = await Assets.load<Record<string, Texture>>(
    manifest.frames.map((frame) => ({
      alias: `base-${frame.id}`,
      src: `${import.meta.env.BASE_URL}assets/goblin/base/${frame.file}`,
    })),
  );
  for (const texture of Object.values(textures))
    texture.source.scaleMode = "nearest";
  return textures;
}
