import { TILE_SIZE, HALF_TILE } from "./metrics";
import type { Position } from "../core/types";
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
export function project(p: Position): { x: number; y: number } {
  // Square native tiles viewed in a fixed three-quarter JRPG presentation.
  return { x: p.x * TILE_SIZE + HALF_TILE, y: p.y * TILE_SIZE };
}
export function unproject(x: number, y: number): Position {
  return {
    x: Math.floor(x / TILE_SIZE),
    y: Math.floor(y / TILE_SIZE),
    z: 0,
  };
}
