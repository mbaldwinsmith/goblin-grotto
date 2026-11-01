import { acceptsStockpile } from "./storage";
import { range } from "../core/random";
import {
  type GameState,
  type Goblin,
  type Job,
  type JobKind,
  type JobPriority,
  type Resource,
  costs,
  deposits,
  materials,
  position,
  tileAt,
  distance,
  buildable,
} from "./model";
import { path, movementTicks } from "./navigation";
export const priorityLabels: Record<JobPriority, string> = {
  1: "Low",
  2: "Normal",
  3: "High",
};
export const workLabels: Record<JobKind, string> = {
  dig: "Digging",
  haul: "Hauling",
  build: "Building",
  harvest: "Gathering",
  craft: "Crafting",
  explore: "Exploring",
};
export function adjacentWork(j: Job, s?: GameState): boolean {
  return (
    j.kind === "dig" ||
    j.kind === "craft" ||
    (j.kind === "build" && j.structure === "wall") ||
    (j.kind === "harvest" &&
      !!s &&
      (tileAt(s, j.target)?.deposit === "wood" ||
        tileAt(s, j.target)?.deposit === "food" ||
        tileAt(s, j.target)?.structure === "farm"))
  );
}
function stored(s: GameState, r: Resource): number {
  return s.items
    .filter((i) => i.resource === r && i.stored && !i.holder)
    .reduce((n, i) => n + i.quantity, 0);
}
function travel(
  s: GameState,
  from: Goblin["position"],
  to: Goblin["position"],
  adjacent = false,
): number | null {
  const route = path(s, from, to, adjacent, true);
  return route
    ? route.reduce(
        (n, p) =>
          n +
          movementTicks(s, p) +
          (tileAt(s, p)?.collapseAt !== null ? 12 : 0),
        0,
      )
    : null;
}
type Evaluation = { score: number; reason: string } | { blocked: string };
/** Pure selection evidence. UI/inspection can read it without consuming the RNG. */
export function evaluateWork(s: GameState, g: Goblin, j: Job): Evaluation {
  const t = tileAt(s, j.target);
  if (!t?.discovered) return { blocked: "Working tile is not discovered" };
  if (g.drop) return { blocked: "Finishing a delivery" };
  if (g.workAction) return { blocked: "Finishing a tool swing" };
  if (g.carrying && j.item !== g.carrying)
    return { blocked: "Already carrying supplies" };
  if (j.kind === "dig" && (!t.solid || !materials[t.material].diggable))
    return { blocked: "Nothing left to excavate" };
  if (j.kind === "build") {
    if (!buildable(t)) return { blocked: "Building site is no longer clear" };
    if (
      !j.paid &&
      !(j.structure === "bed" && stored(s, "bedkit") > 0) &&
      Object.entries(costs[j.structure!]).some(
        ([r, n]) => stored(s, r as Resource) < n,
      )
    )
      return { blocked: "Missing stored building materials" };
  }
  if (
    j.kind === "craft" &&
    (t.structure !== "workshop" || (!j.paid && stored(s, "wood") < 1))
  )
    return {
      blocked:
        t.structure !== "workshop"
          ? "Needs a completed workshop"
          : "Needs one stored wood",
    };
  if (
    j.kind === "harvest" &&
    !(t.structure === "farm" && t.growth >= 600) &&
    !(t.deposit && deposits[t.deposit].action === "gather")
  )
    return { blocked: "Nothing ready to gather" };
  let trip: number | null;
  if (j.kind === "haul") {
    const item = s.items.find((i) => i.id === j.item);
    if (!item || item.quantity <= 0 || (item.holder && item.holder !== g.id))
      return { blocked: "Supplies are unavailable" };
    if (item.stored) return { blocked: "Supplies are already stored" };
    if (!acceptsStockpile(s, j.target, item.resource))
      return { blocked: "Stockpile destination is unavailable" };
    const pickup = travel(s, g.position, item.position),
      delivery = travel(s, item.position, j.target);
    trip = pickup === null || delivery === null ? null : pickup + delivery;
  } else trip = travel(s, g.position, j.target, adjacentWork(j, s));
  if (trip === null) return { blocked: "No reachable working tile" };
  let score = -trip * 3;
  const reasons = [`${priorityLabels[j.priority]} priority`];
  if (g.preferredWork === j.kind) {
    score += 80;
    reasons.push("preferred work");
  }
  if (j.progress > 0 || j.paid) {
    score += 25;
    reasons.push("finish work already started");
  }
  const exertion: Record<JobKind, number> = {
    dig: 0.4,
    build: 0.25,
    haul: 0.2,
    harvest: 0.15,
    craft: 0.1,
    explore: 0.15,
  };
  score -= Math.round(g.fatigue * exertion[j.kind]);
  if (g.fatigue > 50 && (j.kind === "craft" || j.kind === "harvest"))
    reasons.push("lighter work while tired");
  const food = s.items
    .filter((i) => i.resource === "food")
    .reduce((n, i) => n + i.quantity, 0);
  const edible =
    j.kind === "harvest" &&
    (t.structure === "farm" ||
      (t.deposit && deposits[t.deposit].resource === "food"));
  if (edible && food < s.goblins.length * 2) {
    score += 180;
    reasons.push("food supplies are low");
  }
  if (edible && g.hunger > 50) {
    score += 40;
    reasons.push("hungry worker");
  }
  if (
    j.kind === "build" &&
    j.structure === "farm" &&
    food < s.goblins.length * 2
  ) {
    score += 80;
    reasons.push("grow more food");
  }
  if (
    j.kind === "build" &&
    j.structure === "support" &&
    s.tiles.some(
      (tile, i) =>
        tile.discovered &&
        tile.collapseAt !== null &&
        distance(position(i % s.width, Math.floor(i / s.width)), j.target) <= 2,
    )
  ) {
    score += 300;
    reasons.push("shore up a loose ceiling");
  }
  reasons.push(
    trip <= 12 ? "short trip" : trip <= 40 ? "reachable trip" : "long trip",
  );
  return { score, reason: reasons.join(" · ") };
}
/** One bounded seeded tie-break per eligible pair; each job/worker is claimed at most once. */
export function assignWork(s: GameState, available: Goblin[]): void {
  const candidates: {
    worker: Goblin;
    job: Job;
    score: number;
    reason: string;
  }[] = [];
  for (const job of s.jobs.filter((j) => j.status === "open")) {
    let blocked = "Waiting for a free goblin",
      eligible = false;
    for (const worker of available) {
      const result = evaluateWork(s, worker, job);
      if ("blocked" in result) {
        blocked = result.blocked;
        continue;
      }
      eligible = true;
      candidates.push({
        worker,
        job,
        score: result.score + range(s, 0, 3),
        reason: result.reason,
      });
    }
    job.reason = eligible ? "Waiting for an available worker" : blocked;
  }
  candidates.sort(
    (a, b) =>
      b.job.priority - a.job.priority ||
      b.score - a.score ||
      a.job.id.localeCompare(b.job.id) ||
      a.worker.id.localeCompare(b.worker.id),
  );
  for (const { worker, job, reason } of candidates) {
    if (worker.job || worker.drop || worker.workAction || job.status !== "open")
      continue;
    worker.job = job.id;
    job.worker = worker.id;
    job.status = "active";
    job.reason = reason;
  }
}
