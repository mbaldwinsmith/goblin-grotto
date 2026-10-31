import type { Position } from "../core/types";
export interface Camera {
  x: number;
  y: number;
  zoom: number;
}
export function project(p: Position): { x: number; y: number } {
  return { x: (p.x - p.y) * 16, y: (p.x + p.y) * 8 };
}
export function unproject(x: number, y: number): Position {
  return {
    x: Math.floor((x / 16 + y / 8) / 2),
    y: Math.floor((y / 8 - x / 16) / 2),
    z: 0,
  };
}
