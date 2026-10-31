import type { Position } from "../core/types";
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
export function project(p: Position): { x: number; y: number } {
  // Rectangular floors viewed from above, with upright front-facing sprites.
  return { x: p.x * 32 + 16, y: p.y * 24 };
}
export function unproject(x: number, y: number): Position {
  return {
    x: Math.floor(x / 32),
    y: Math.floor(y / 24),
    z: 0,
  };
}
