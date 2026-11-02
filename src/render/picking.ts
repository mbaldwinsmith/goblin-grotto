import { treeAtPoint } from "./scenery";
import { TILE_SIZE, HALF_TILE, WALL_HEIGHT, ACTOR_FEET } from "./metrics";
import type { ActorId, Position } from "../core/types";
import { type GameState, tileAt } from "../sim/model";
import { project, unproject } from "./projection";
export interface Selection {
  position: Position;
  actor: ActorId | null;
}
export function actorDepth(p: Position): number {
  return (p.y * TILE_SIZE + ACTOR_FEET) * 4096 + p.x;
}
export function objectDepth(p: Position, wall = false): number {
  return (p.y * TILE_SIZE + (wall ? TILE_SIZE : ACTOR_FEET)) * 4096 + p.x;
}
export function inspectPoint(
  s: GameState,
  x: number,
  y: number,
  reveal: boolean,
  renderPositions?: ReadonlyMap<ActorId, Position>,
): Selection {
  const floor = unproject(x, y);
  const actor = s.goblins
    .filter((g) => {
      const a = project(renderPositions?.get(g.id) ?? g.position);
      return (
        tileAt(s, g.position)?.discovered &&
        x >= a.x - HALF_TILE &&
        x < a.x + HALF_TILE &&
        y >= a.y + ACTOR_FEET - TILE_SIZE &&
        y < a.y + ACTOR_FEET
      );
    })
    .sort(
      (a, b) =>
        actorDepth(renderPositions?.get(b.id) ?? b.position) -
        actorDepth(renderPositions?.get(a.id) ?? a.position),
    )[0];
  const walls: Position[] = [];
  for (
    let row = Math.max(0, floor.y);
    row <= Math.min(s.height - 1, floor.y + 1);
    row++
  ) {
    const p = { x: floor.x, y: row, z: 0 as const },
      t = tileAt(s, p),
      a = project(p);
    if (
      t?.discovered &&
      (t.solid || t.structure === "wall" || t.structure === "door") &&
      x >= a.x - HALF_TILE &&
      x < a.x + HALF_TILE &&
      y >= a.y - WALL_HEIGHT &&
      y < a.y + TILE_SIZE
    )
      walls.push(p);
  }
  const wall = walls.sort(
    (a, b) => objectDepth(b, true) - objectDepth(a, true),
  )[0];
  const tree = treeAtPoint(s, x, y);
  const foreground =
    tree && (!wall || objectDepth(tree) > objectDepth(wall, true))
      ? tree
      : wall;
  const depth =
    foreground === tree && tree
      ? objectDepth(tree)
      : wall
        ? objectDepth(wall, true)
        : -Infinity;
  if (
    actor &&
    (reveal ||
      !foreground ||
      actorDepth(renderPositions?.get(actor.id) ?? actor.position) >= depth)
  )
    return { position: { ...actor.position }, actor: actor.id };
  return { position: foreground ?? floor, actor: null };
}
