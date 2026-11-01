import { acceptsStockpile, nearestStockpile } from "./storage";
import { path } from "./navigation";
import type { GameState, Goblin, Item } from "./model";

import { emit } from "./events";
export const DROP_FRAME_TICKS = 2;
export const DROP_FRAME_COUNT = 9;
export const DROP_RELEASE_FRAME = 5;
export const DROP_RELEASE_TICKS = DROP_RELEASE_FRAME * DROP_FRAME_TICKS;
export const DROP_DURATION_TICKS = DROP_FRAME_COUNT * DROP_FRAME_TICKS;
function putDown(s: GameState, g: Goblin, item: Item): void {
  item.holder = null;
  item.position = { ...g.position };
  item.stored = acceptsStockpile(s, g.position, item.resource);
  g.carrying = null;
  emit(
    s,
    "work",
    `${g.name} puts down ${item.quantity} ${item.resource}.`,
    g.id,
  );
}
export function beginDrop(s: GameState, g: Goblin): void {
  if (!g.carrying || g.drop) return;
  g.drop = { item: g.carrying, startedAt: s.tick, store: true };
  g.activity = "Putting down supplies";
}
/** Interruptions free the physical item immediately, then show the release/follow-through. */
export function interruptDrop(s: GameState, g: Goblin): void {
  const item = s.items.find((i) => i.id === g.carrying);
  if (item) {
    g.drop = { item: item.id, startedAt: s.tick, store: false };
    putDown(s, g, item);
  }
  g.carrying = null;
}
/** Returns true while the actor is busy. Rendering never performs the transfer. */
export function dropElapsed(
  tick: number,
  action: NonNullable<Goblin["drop"]>,
): number {
  return tick - action.startedAt + (action.store ? 0 : DROP_RELEASE_TICKS);
}
export function updateDrop(s: GameState, g: Goblin): boolean {
  const action = g.drop;
  if (!action) return false;
  const elapsed = dropElapsed(s.tick, action);
  if (elapsed >= DROP_RELEASE_TICKS && g.carrying === action.item) {
    const item = s.items.find((i) => i.id === action.item);
    if (item) {
      putDown(s, g, item);
      const job = s.jobs.find(
        (j) => j.id === g.job && j.kind === "haul" && j.item === action.item,
      );
      if (job && action.store) {
        job.status = "done";
        job.worker = null;
        g.job = null;
      }
    }
  }
  if (elapsed >= DROP_DURATION_TICKS) {
    g.drop = null;
    g.activity = "Finished putting down supplies";
    return false;
  }
  g.activity = "Putting down supplies";
  return true;
}

/** Keep a live haul attached to its item when a destination is changed or blocked. */
export function refreshHaulJobs(s: GameState): void {
  for (const job of s.jobs) {
    if (job.kind !== "haul" || !["open", "active"].includes(job.status))
      continue;
    const item = s.items.find((i) => i.id === job.item),
      worker = s.goblins.find((g) => g.id === job.worker);
    if (item?.stored && !item.holder) {
      job.target = { ...item.position };
      job.status = "done";
      job.worker = null;
      if (worker?.job === job.id) worker.job = null;
      continue;
    }
    if (
      item &&
      acceptsStockpile(s, job.target, item.resource) &&
      path(s, item.position, job.target, false, true) !== null
    )
      continue;
    const destination = item ? nearestStockpile(s, item) : null;
    if (worker?.drop?.item === job.item && worker.carrying === job.item)
      worker.drop = null;
    if (destination) {
      job.target = destination;
      job.reason = "Delivery rerouted to matching storage";
      continue;
    }
    job.status = "cancelled";
    job.reason = "No reachable matching stockpile";
    job.worker = null;
    if (worker?.job === job.id) {
      if (worker.carrying === job.item) interruptDrop(s, worker);
      worker.job = null;
    }
  }
}
