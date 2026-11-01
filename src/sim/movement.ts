import { adjacentWork } from "./labour";
import { directions, type Position } from "../core/types";
import { facingFor } from "../core/facing";
import {
  type GameState,
  type Goblin,
  position,
  same,
  walkable,
  tileAt,
} from "./model";
import { path, movementTicks } from "./navigation";
export type MovementResult =
  | "arrived"
  | "moved"
  | "waiting"
  | "cooldown"
  | "blocked";
function relocate(s: GameState, g: Goblin, p: Position): void {
  g.facing = facingFor(p.x - g.position.x, p.y - g.position.y, g.facing);
  g.position = { ...p };
  g.nextMoveAt = s.tick + movementTicks(s, p);
  const item = s.items.find((i) => i.id === g.carrying);
  if (item) item.position = { ...p };
}
function workRoute(s: GameState, g: Goblin): Position[] | null {
  const j = s.jobs.find((j) => j.id === g.job && j.status === "active");
  if (!j) return null;
  const target =
    j.kind === "haul" && !g.carrying
      ? s.items.find((i) => i.id === j.item)?.position
      : j.target;
  return target ? path(s, g.position, target, adjacentWork(j, s), true) : null;
}
/** A tick-driven step. Detours avoid occupants; narrow passages allow cooperative passing. */
export function advance(
  s: GameState,
  g: Goblin,
  target: Position,
  adjacent = false,
): MovementResult {
  if (g.drop || g.workAction) return "waiting";
  const route = path(s, g.position, target, adjacent, true);
  if (!route) return "blocked";
  if (!route.length) return "arrived";
  if (s.tick < g.nextMoveAt) return "cooldown";
  const occupied = new Set(
    s.goblins
      .filter((o) => o.id !== g.id)
      .map((o) => o.position.y * s.width + o.position.x),
  );
  // Consider the full remaining route. Checking only its first cell can make an
  // actor turn back toward a cheaper occupied corridor halfway through a detour.
  if (route.some((p) => occupied.has(p.y * s.width + p.x))) {
    const detour = path(s, g.position, target, adjacent, true, occupied);
    if (detour?.length) {
      relocate(s, g, detour[0]);
      return "moved";
    }
  }
  const next = route[0],
    other = s.goblins.find((o) => o.id !== g.id && same(o.position, next));
  if (!other) {
    relocate(s, g, next);
    return "moved";
  }
  if (
    s.tick < other.nextMoveAt ||
    other.activity === "Sleeping" ||
    other.drop ||
    other.workAction
  )
    return "waiting";
  // Idle workers step out of the route where a free side space exists.
  if (!other.job) {
    if (makeRoom(s, other, route, g.name)) {
      relocate(s, g, next);
      return "moved";
    }
  }

  const otherRoute = workRoute(s, other);
  if (!other.job || (otherRoute?.length && same(otherRoute[0], g.position))) {
    // Exchange two adjacent walkable cells atomically; neither actor shares a tile.
    const previous = { ...g.position };
    relocate(s, g, next);
    relocate(s, other, previous);
    if (!other.job) other.activity = `Making room for ${g.name}`;
    return "moved";
  }
  return "waiting";
}

/** Ask an idle neighbour to vacate a passage or a construction site. */
export function makeRoom(
  s: GameState,
  g: Goblin,
  avoid: Position[],
  requester: string,
): boolean {
  if (
    g.job ||
    g.drop ||
    g.workAction ||
    g.activity === "Sleeping" ||
    s.tick < g.nextMoveAt
  )
    return false;
  const side = directions
    .map((d) => position(g.position.x + d.x, g.position.y + d.y))
    .find(
      (p) =>
        walkable(tileAt(s, p)) &&
        tileAt(s, p)?.discovered &&
        !s.goblins.some((o) => same(o.position, p)) &&
        !avoid.some((r) => same(r, p)),
    );
  if (!side) return false;
  relocate(s, g, side);
  g.activity = `Making room for ${requester}`;
  return true;
}
