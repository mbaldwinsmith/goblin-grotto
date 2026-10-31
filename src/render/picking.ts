import type { ActorId, Position } from "../core/types";
import { type GameState, tileAt } from "../sim/model";
import { project, unproject } from "./projection";
export interface Selection {
  position: Position;
  actor: ActorId | null;
}
export function actorDepth(p: Position): number {
  return (p.y * 24 + 17) * 4096 + p.x;
}
export function objectDepth(p: Position, wall = false): number {
  return (p.y * 24 + (wall ? 24 : 14)) * 4096 + p.x;
}
export function inspectPoint(
  s: GameState,
  x: number,
  y: number,
  reveal: boolean,
): Selection {
  const floor = unproject(x, y);
  const actor = s.goblins
    .filter((g) => {
      const a = project(g.position);
      return (
        tileAt(s, g.position)?.discovered &&
        x >= a.x - 16 &&
        x < a.x + 16 &&
        y >= a.y - 12 &&
        y < a.y + 20
      );
    })
    .sort((a, b) => actorDepth(b.position) - actorDepth(a.position))[0];
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
      x >= a.x - 16 &&
      x < a.x + 16 &&
      y >= a.y - 14 &&
      y < a.y + 24
    )
      walls.push(p);
  }
  const wall = walls.sort(
    (a, b) => objectDepth(b, true) - objectDepth(a, true),
  )[0];
  if (
    actor &&
    (reveal || !wall || actorDepth(actor.position) > objectDepth(wall, true))
  )
    return { position: { ...actor.position }, actor: actor.id };
  return { position: wall ?? floor, actor: null };
}
