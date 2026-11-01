import { directions, type Position } from "../core/types";
import {
  type GameState,
  tileAt,
  position,
  walkable,
  materials,
  distance,
} from "./model";
import { path, invalidateNavigation } from "./navigation";
import { emit } from "./events";
export const COLLAPSE_WARNING_TICKS = 300;
export function hasSupport(s: GameState, p: Position): boolean {
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++)
      if (
        Math.abs(dx) + Math.abs(dy) <= 2 &&
        tileAt(s, position(p.x + dx, p.y + dy))?.structure === "support"
      )
        return true;
  return false;
}
/** Only excavated weak ceilings with a wide opening are destabilised. */
export function warnOnExcavation(s: GameState, p: Position): void {
  const t = tileAt(s, p);
  if (
    !t ||
    t.solid ||
    t.outside ||
    t.structure ||
    materials[t.material].stability > 2 ||
    hasSupport(s, p)
  )
    return;
  const opening = directions.filter((d) =>
    walkable(tileAt(s, position(p.x + d.x, p.y + d.y))),
  ).length;
  if (opening < 3) return;
  t.collapseAt = s.tick + COLLAPSE_WARNING_TICKS;
  invalidateNavigation(s);
  emit(
    s,
    "world",
    `Loose ceiling at ${p.x}, ${p.y}! Dust is falling. Build a support within two tiles before the ceiling gives way.`,
  );
}
function keepsColonyConnected(s: GameState): boolean {
  const food = s.items.filter(
    (i) => i.resource === "food" && i.quantity > 0 && !i.holder,
  );
  const start = s.goblins[0]?.position;
  if (!start) return true;
  return s.goblins.every(
    (g) =>
      path(s, g.position, start, false, true) !== null &&
      (!food.length ||
        food.some(
          (i) => path(s, g.position, i.position, false, true) !== null,
        )),
  );
}
export function updateStability(s: GameState): void {
  for (let i = 0; i < s.tiles.length; i++) {
    const t = s.tiles[i];
    if (t.collapseAt === null) continue;
    const p = position(i % s.width, Math.floor(i / s.width));
    if (t.solid || hasSupport(s, p)) {
      t.collapseAt = null;
      invalidateNavigation(s);
      if (!t.solid)
        emit(s, "world", `The ceiling at ${p.x}, ${p.y} is shored up.`);
      continue;
    }
    if (s.tick < t.collapseAt) continue;
    // Early prototype falls never land on people or destroy a live structure.
    if (s.goblins.some((g) => distance(g.position, p) === 0) || t.structure) {
      t.collapseAt = s.tick + 30;
      continue;
    }
    t.solid = true;
    invalidateNavigation(s);
    const safe = keepsColonyConnected(s);
    if (!safe) t.solid = false;
    t.collapseAt = null;
    t.material = "loose";
    t.deposit = null;
    invalidateNavigation(s);
    s.items.push({
      id: `item-${s.nextId++}`,
      resource: "stone",
      quantity: 1,
      position: p,
      holder: null,
      stored: false,
    });
    emit(
      s,
      "world",
      safe
        ? `A small cave-in blocks ${p.x}, ${p.y}. The rubble can be dug out.`
        : `Loose stones fall at ${p.x}, ${p.y}, leaving a narrow way through. No goblin is trapped.`,
    );
  }
}
