import { directions, type Position } from "../core/types";
import {
  type GameState,
  position,
  tileAt,
  walkable,
  materials,
  distance,
} from "./model";
interface NavigationCache {
  paths: Map<string, Position[] | null>;
  hits: number;
  searches: number;
}
const caches = new WeakMap<GameState, NavigationCache>();
function cache(s: GameState): NavigationCache {
  let entry = caches.get(s);
  if (!entry) {
    entry = { paths: new Map(), hits: 0, searches: 0 };
    caches.set(s, entry);
  }
  return entry;
}
/** Call after solidity, structures, known terrain or weather movement costs change. */
export function invalidateNavigation(s: GameState): void {
  cache(s).paths.clear();
}
export function navigationStats(s: GameState) {
  const c = cache(s);
  return { hits: c.hits, searches: c.searches, entries: c.paths.size };
}
export function movementTicks(s: GameState, p: Position): number {
  const t = tileAt(s, p);
  return t
    ? materials[t.material].moveTicks +
        (t.outside
          ? s.weather.kind === "rain"
            ? 1
            : s.weather.kind === "snow"
              ? 2
              : 0
          : 0)
    : 3;
}
function copy(route: Position[] | null): Position[] | null {
  return route?.map((p) => ({ ...p })) ?? null;
}
interface Node {
  index: number;
  cost: number;
  score: number;
  heuristic: number;
}
const before = (a: Node, b: Node) =>
  a.score - b.score || a.heuristic - b.heuristic || a.index - b.index;
function push(heap: Node[], node: Node): void {
  heap.push(node);
  let i = heap.length - 1;
  while (i > 0) {
    const parent = (i - 1) >> 1;
    if (before(heap[parent], node) <= 0) break;
    heap[i] = heap[parent];
    i = parent;
  }
  heap[i] = node;
}
function pop(heap: Node[]): Node {
  const result = heap[0],
    tail = heap.pop()!;
  if (heap.length) {
    let i = 0;
    while (i * 2 + 1 < heap.length) {
      let child = i * 2 + 1;
      if (child + 1 < heap.length && before(heap[child + 1], heap[child]) < 0)
        child++;
      if (before(tail, heap[child]) <= 0) break;
      heap[i] = heap[child];
      i = child;
    }
    heap[i] = tail;
  }
  return result;
}
/** Deterministic weighted A*. Other agents are transient occupants, not permanent walls. */
export function path(
  s: GameState,
  from: Position,
  to: Position,
  adjacent = false,
  knownOnly = false,
): Position[] | null {
  if (!tileAt(s, from) || !tileAt(s, to)) return null;
  const c = cache(s),
    key = `${from.x},${from.y}:${to.x},${to.y}:${adjacent}:${knownOnly}`;
  if (c.paths.has(key)) {
    c.hits++;
    return copy(c.paths.get(key) ?? null);
  }
  c.searches++;
  const index = (p: Position) => p.y * s.width + p.x,
    heuristic = (p: Position) =>
      Math.max(0, distance(p, to) - (adjacent ? 1 : 0)) * 3;
  const open: Node[] = [],
    cost = new Map<number, number>([[index(from), 0]]),
    parents = new Map<number, number>(),
    closed = new Set<number>();
  let end: number | null = null;
  const targetTile = tileAt(s, to);
  if (
    adjacent ||
    distance(from, to) === 0 ||
    (walkable(targetTile) && (!knownOnly || targetTile?.discovered))
  )
    push(open, {
      index: index(from),
      cost: 0,
      score: heuristic(from),
      heuristic: heuristic(from),
    });
  while (open.length) {
    const node = pop(open),
      current = node.index;
    if (closed.has(current) || node.cost !== cost.get(current)) continue;
    closed.add(current);
    const p = position(current % s.width, Math.floor(current / s.width));
    if (distance(p, to) === (adjacent ? 1 : 0)) {
      end = current;
      break;
    }
    for (const d of directions) {
      const n = position(p.x + d.x, p.y + d.y),
        t = tileAt(s, n),
        i = index(n);
      if (!walkable(t) || (knownOnly && !t?.discovered) || closed.has(i))
        continue;
      const next =
        node.cost + movementTicks(s, n) + (t?.collapseAt !== null ? 12 : 0);
      if (next < (cost.get(i) ?? Infinity)) {
        cost.set(i, next);
        parents.set(i, current);
        const h = heuristic(n);
        push(open, { index: i, cost: next, score: next + h, heuristic: h });
      }
    }
  }
  let route: Position[] | null = null;
  if (end !== null) {
    route = [];
    for (let i = end; i !== index(from); i = parents.get(i)!) {
      route.push(position(i % s.width, Math.floor(i / s.width)));
    }
    route.reverse();
  }
  if (c.paths.size >= 256) c.paths.delete(c.paths.keys().next().value!);
  c.paths.set(key, copy(route));
  return copy(route);
}
