import {
  type GameState,
  type Item,
  type Resource,
  type StockpileFilter,
  stockpileFilters,
  buildable,
  position,
  tileAt,
  walkable,
  same,
} from "./model";
import { resourceKinds } from "./content";
import type { Position } from "../core/types";
import { path, movementTicks } from "./navigation";
export function acceptsStockpile(
  s: GameState,
  p: Position,
  resource: Resource,
): boolean {
  const tile = tileAt(s, p);
  return (
    !!tile?.stockpile &&
    tile.discovered &&
    buildable(tile) &&
    (
      stockpileFilters[tile.stockpileFilter].resources as readonly Resource[]
    ).includes(resource)
  );
}
/** Paint/remove/filter edits never move objects: storage follows physical placement. */
export function reconcileStorage(s: GameState): void {
  for (const tile of s.tiles)
    if (tile.stockpile && (!tile.discovered || !buildable(tile)))
      tile.stockpile = false;
  for (const item of s.items)
    item.stored =
      !item.holder && acceptsStockpile(s, item.position, item.resource);
}
export function nearestStockpile(s: GameState, item: Item): Position | null {
  if (
    !walkable(tileAt(s, item.position)) ||
    !tileAt(s, item.position)?.discovered
  )
    return null;
  let best: Position | null = null,
    bestCost = Infinity;
  for (let i = 0; i < s.tiles.length; i++) {
    if (!s.tiles[i].stockpile) continue;
    const p = position(i % s.width, Math.floor(i / s.width));
    if (!acceptsStockpile(s, p, item.resource)) continue;
    const route = path(s, item.position, p, false, true);
    if (!route) continue;
    const cost = route.reduce(
      (n, step) =>
        n +
        movementTicks(s, step) +
        (tileAt(s, step)?.collapseAt !== null ? 12 : 0),
      0,
    );
    if (cost < bestCost) {
      bestCost = cost;
      best = p;
    }
  }
  return best;
}
export function resourceTotals(): Record<Resource, number> {
  return Object.fromEntries(
    resourceKinds.map((resource) => [resource, 0]),
  ) as Record<Resource, number>;
}
/** Every physical quantity belongs to exactly one category. */
export function inventoryBalances(s: GameState) {
  const stored = resourceTotals(),
    carried = resourceTotals(),
    loose = resourceTotals(),
    total = resourceTotals();
  for (const item of s.items) {
    total[item.resource] += item.quantity;
    const category = item.holder ? carried : item.stored ? stored : loose;
    category[item.resource] += item.quantity;
  }
  return { stored, carried, loose, total };
}
export function stockpileContents(
  s: GameState,
  p: Position,
): Record<Resource, number> {
  const contents = resourceTotals();
  for (const item of s.items)
    if (!item.holder && item.stored && same(item.position, p))
      contents[item.resource] += item.quantity;
  return contents;
}
export function filterLabel(filter: StockpileFilter): string {
  return stockpileFilters[filter].label;
}
