import { directions } from "../core/types";
import { type GameState, position, tileAt, walkable } from "../sim/model";
/** Older builds allowed actors to overlap or stand on a completed wall. */
export function separateLegacyGoblins(s: GameState): void {
  const key = (p: { x: number; y: number }) => p.y * s.width + p.x;
  const owners = new Map<number, string>();
  for (const g of s.goblins)
    if (walkable(tileAt(s, g.position)) && !owners.has(key(g.position)))
      owners.set(key(g.position), g.id);
  for (const g of s.goblins) {
    if (owners.get(key(g.position)) === g.id) continue;
    const queue = [g.position],
      seen = new Set([key(g.position)]);
    let found = false;
    for (let i = 0; i < queue.length && !found; i++) {
      for (const d of directions) {
        const p = position(queue[i].x + d.x, queue[i].y + d.y),
          t = tileAt(s, p),
          id = key(p);
        if (seen.has(id) || !walkable(t) || !t?.discovered) continue;
        seen.add(id);
        if (!owners.has(id)) {
          g.position = p;
          owners.set(id, g.id);
          const held = s.items.find((item) => item.id === g.carrying);
          if (held) held.position = { ...p };
          found = true;
          break;
        }
        queue.push(p);
      }
    }
    if (!found)
      throw new Error(
        "Not enough reachable space to separate goblins in this older save.",
      );
  }
  for (const item of s.items)
    if (item.holder) {
      const holder = s.goblins.find((g) => g.id === item.holder);
      if (holder) item.position = { ...holder.position };
    }
}
