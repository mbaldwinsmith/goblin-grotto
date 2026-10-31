import type { Position } from "../core/types";
import {
  features,
  type FeatureKind,
  type GameState,
  position,
  tileAt,
} from "./model";
/** Bresenham sight rays stop at walls; the blocking face itself can be discovered. */
function visible(s: GameState, from: Position, to: Position): boolean {
  let x = from.x,
    y = from.y;
  const dx = Math.abs(to.x - x),
    dy = -Math.abs(to.y - y),
    sx = x < to.x ? 1 : -1,
    sy = y < to.y ? 1 : -1;
  let err = dx + dy;
  while (x !== to.x || y !== to.y) {
    if (
      (x !== from.x || y !== from.y) &&
      (tileAt(s, position(x, y))?.solid ||
        tileAt(s, position(x, y))?.structure === "wall")
    )
      return false;
    const e = 2 * err;
    if (e >= dy) {
      err += dy;
      x += sx;
    }
    if (e <= dx) {
      err += dx;
      y += sy;
    }
  }
  return true;
}
export function revealFrom(
  s: GameState,
  from: Position,
  radius = 4,
): FeatureKind[] {
  const found: FeatureKind[] = [];
  for (
    let y = Math.max(0, from.y - radius);
    y <= Math.min(s.height - 1, from.y + radius);
    y++
  )
    for (
      let x = Math.max(0, from.x - radius);
      x <= Math.min(s.width - 1, from.x + radius);
      x++
    ) {
      const p = position(x, y),
        t = tileAt(s, p)!;
      if (
        t.discovered ||
        (x - from.x) ** 2 + (y - from.y) ** 2 > radius ** 2 ||
        !visible(s, from, p)
      )
        continue;
      t.discovered = true;
      if (t.feature && features[t.feature].landmark) found.push(t.feature);
    }
  return found;
}
