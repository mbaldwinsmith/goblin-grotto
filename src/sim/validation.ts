import { directions } from "../core/types";
import {
  deposits,
  features,
  type GameState,
  position,
  tileAt,
  walkable,
  buildable,
} from "./model";
/** Physical map validation ignores fog, which belongs to the settlement's knowledge. */
export function validateWorld(s: GameState): string[] {
  const errors: string[] = [];
  if (s.tiles.length !== s.width * s.height || s.goblins.length !== 4)
    return ["Incomplete starting world"];
  const start = s.goblins[0].position,
    key = (x: number, y: number) => y * s.width + x;
  const reachable = new Set<number>([key(start.x, start.y)]),
    queue = [start];
  for (let i = 0; i < queue.length; i++)
    for (const d of directions) {
      const p = position(queue[i].x + d.x, queue[i].y + d.y),
        k = key(p.x, p.y);
      if (!reachable.has(k) && walkable(tileAt(s, p))) {
        reachable.add(k);
        queue.push(p);
      }
    }
  for (const g of s.goblins)
    if (
      !walkable(tileAt(s, g.position)) ||
      !reachable.has(key(g.position.x, g.position.y))
    )
      errors.push(`Unreachable spawn: ${g.name}`);
  if (
    !s.items.some(
      (i) =>
        i.resource === "food" &&
        i.quantity >= 20 &&
        reachable.has(key(i.position.x, i.position.y)),
    )
  )
    errors.push("No reachable starting food");
  if (
    s.tiles.filter((t, i) => reachable.has(i) && t.discovered && buildable(t))
      .length < 24
  )
    errors.push("Insufficient safe buildable floor");
  if (!s.tiles.some((t, i) => t.feature === "entrance" && reachable.has(i)))
    errors.push("Missing reachable entrance");
  if (
    !s.tiles.some(
      (t, i) => t.outside && t.deposit === "food" && reachable.has(i),
    )
  )
    errors.push("Missing reachable surface forage");
  if (
    !s.tiles.some(
      (t, i) => t.outside && t.deposit === "wood" && reachable.has(i),
    )
  )
    errors.push("Missing reachable trees");
  for (let i = 0; i < s.tiles.length; i++) {
    const t = s.tiles[i],
      x = i % s.width,
      y = Math.floor(i / s.width);
    if (
      (x === 0 || y === 0 || x === s.width - 1 || y === s.height - 1) &&
      (!t.solid || t.material !== "impenetrable")
    )
      errors.push("Broken map boundary");
    if (t.deposit && deposits[t.deposit].action === "mine" && !t.solid)
      errors.push("Ore seam is not in rock");
    if (t.feature && features[t.feature].landmark && t.solid)
      errors.push("Landmark is buried inside solid terrain");
  }
  for (const resource of ["iron", "copper", "gold", "gems"] as const)
    if (!s.tiles.some((t) => t.deposit === resource))
      errors.push(`Missing ${resource} discovery`);
  return [...new Set(errors)];
}
