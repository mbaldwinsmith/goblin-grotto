import { FillGradient, type Graphics } from "pixi.js";
import { TILE_SIZE, HALF_TILE, WALL_HEIGHT } from "./metrics";
let lighting: { top: FillGradient; face: FillGradient } | undefined;
function gradient(
  colorStops: { offset: number; color: string }[],
): FillGradient {
  const fill = new FillGradient({
    type: "linear",
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
    textureSpace: "local",
    textureSize: TILE_SIZE,
    colorStops,
  });
  fill.buildGradient();
  fill.texture.source.scaleMode = "nearest";
  return fill;
}
/** Two shared native-resolution ramps keep each exposed wall to two simple rectangles. */
export function drawWallShading(
  g: Graphics,
  origin: { x: number; y: number },
  exposed: boolean,
): void {
  const x = origin.x - HALF_TILE;
  if (!exposed) {
    g.rect(x, origin.y - WALL_HEIGHT, TILE_SIZE, TILE_SIZE).fill(0x000000);
    return;
  }
  lighting ??= {
    top: gradient([
      { offset: 0, color: "rgba(0,0,0,1)" },
      { offset: 0.05, color: "rgba(0,0,0,1)" },
      { offset: 0.5, color: "rgba(0,0,0,0.565)" },
      { offset: 1, color: "rgba(0,0,0,0.3)" },
    ]),
    face: gradient([
      { offset: 0, color: "rgba(255,255,255,0.1)" },
      { offset: 0.25, color: "rgba(255,255,255,0)" },
      { offset: 1, color: "rgba(0,0,0,0.22)" },
    ]),
  };
  g.rect(x, origin.y - WALL_HEIGHT, TILE_SIZE, TILE_SIZE).fill(lighting.top);
  g.rect(x, origin.y, TILE_SIZE, TILE_SIZE).fill(lighting.face);
}
