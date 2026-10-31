import { TILE_SIZE, HALF_TILE } from "./metrics";
import type { Position } from "../core/types";
import { type Camera, project } from "./projection";
export interface MapSize {
  width: number;
  height: number;
}
const clamp = (n: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, n));
/** Keep at least half a viewport over the region, including at low zoom. */
export function boundCamera(c: Camera, map: MapSize): void {
  c.zoom = clamp(c.zoom, 0.6, 4);
  c.x = clamp(c.x, -map.width * TILE_SIZE * c.zoom, 0);
  c.y = clamp(c.y, -map.height * TILE_SIZE * c.zoom, 0);
}
export function cameraFocus(c: Camera, p: Position, map: MapSize): void {
  const a = project(p);
  c.x = -a.x * c.zoom;
  c.y = -(a.y + HALF_TILE) * c.zoom;
  boundCamera(c, map);
}
export function cameraPan(
  c: Camera,
  dx: number,
  dy: number,
  map: MapSize,
): void {
  c.x += dx;
  c.y += dy;
  boundCamera(c, map);
}
/** Zoom around the pointer, or around the viewport centre for keyboard zoom. */
export function cameraZoom(
  c: Camera,
  factor: number,
  map: MapSize,
  anchor = { x: 0, y: 0 },
): void {
  const old = c.zoom;
  const next = clamp(old * factor, 0.6, 4);
  c.x = anchor.x - ((anchor.x - c.x) * next) / old;
  c.y = anchor.y - ((anchor.y - c.y) * next) / old;
  c.zoom = next;
  boundCamera(c, map);
}
