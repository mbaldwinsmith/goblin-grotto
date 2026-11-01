import { beginDrop, interruptDrop, updateDrop } from "./hauling";
import { advance, makeRoom } from "./movement";
import { facingFor } from "../core/facing";
import { updateWeather } from "./climate";
import { warnOnExcavation, updateStability } from "./stability";
import { emit } from "./events";
export { emit } from "./events";
import { invalidateNavigation } from "./navigation";
import type { Position, Result } from "../core/types";
import {
  type Command,
  type GameState,
  type Goblin,
  type Job,
  type Resource,
  costs,
  deposits,
  features,
  buildable,
  walkable,
  distance,
  materials,
  position,
  same,
  tileAt,
} from "./model";
import { path as worldPath } from "./world";
import { revealFrom } from "./visibility";
function path(s: GameState, from: Position, to: Position, adjacent = false) {
  return worldPath(s, from, to, adjacent, true);
}
function discover(s: GameState, p: Position): void {
  for (const kind of revealFrom(s, p))
    emit(
      s,
      "world",
      `Discovered ${features[kind].label}: ${features[kind].description}`,
    );
}
export { createGame } from "./world";
export function dispatch(s: GameState, c: Command): Result {
  const p = c.position;
  if (!Number.isInteger(p.x) || !Number.isInteger(p.y) || p.z !== 0)
    return { ok: false, reason: "Choose a tile on this level." };
  const t = tileAt(s, p);
  if (!t?.discovered)
    return { ok: false, reason: "That place has not been discovered." };
  if (c.type === "order") {
    const g = s.goblins.find((g) => g.id === c.actor);
    if (!g) return { ok: false, reason: "Unknown goblin." };
    const route = path(s, g.position, p);
    if (!route) return { ok: false, reason: "No walkable route." };
    if (route.length && s.tick < g.nextMoveAt)
      return { ok: false, reason: "Goblin is still taking a step." };
    release(s, g);
    const result = advance(s, g, p);
    g.activity =
      result === "waiting" ? "Waiting for passage" : "Following your guidance";
    return { ok: true };
  }
  if (c.tool === "cancel") {
    for (const j of s.jobs.filter(
      (j) => same(j.target, p) && ["open", "active"].includes(j.status),
    )) {
      if (j.paid && j.kind === "build") {
        for (const [resource, quantity] of Object.entries(
          j.paidWithKit ? { bedkit: 1 } : costs[j.structure!],
        ))
          addItem(s, j.target, resource as Resource, quantity);
        j.paid = false;
      }
      if (j.paid && j.kind === "craft") addItem(s, j.target, "wood", 1);
      j.status = "cancelled";
      if (j.worker) {
        const g = s.goblins.find((g) => g.id === j.worker);
        if (g) release(s, g);
      }
      j.worker = null;
    }
    return { ok: true };
  }
  if (c.tool === "stockpile") {
    if (t.solid || t.structure)
      return { ok: false, reason: "Stockpiles need empty floor." };
    t.stockpile = !t.stockpile;
    emit(s, "command", "A place for the shinies. And the less shiny things.");
    return { ok: true };
  }
  if (
    s.jobs.some(
      (j) => same(j.target, p) && ["open", "active"].includes(j.status),
    )
  )
    return { ok: false, reason: "Work is already planned here." };
  if (c.tool === "dig" && (!t.solid || !materials[t.material].diggable))
    return {
      ok: false,
      reason: "Choose diggable rock; the boundary cannot be dug.",
    };
  if (c.tool === "build" && (!buildable(t) || !c.structure))
    return { ok: false, reason: "Choose empty floor and a structure." };
  if (c.tool === "build" && t.collapseAt !== null && c.structure !== "support")
    return {
      ok: false,
      reason: "Shore up the loose ceiling with a support first.",
    };
  if (
    c.tool === "harvest" &&
    (t.solid || !t.deposit || deposits[t.deposit].action !== "gather")
  )
    return {
      ok: false,
      reason: "Choose mushrooms, a tree, loose stone or old masonry.",
    };
  if (c.tool === "craft" && t.structure !== "workshop")
    return { ok: false, reason: "Select a completed workshop." };
  if (c.tool === "explore" && !walkable(t))
    return {
      ok: false,
      reason: "Scout a walkable tile at the edge of the known map.",
    };
  if (c.tool === "haul")
    return { ok: false, reason: "Hauling is automatic: mark a stockpile." };
  s.jobs.push({
    id: `job-${s.nextId++}`,
    kind: c.tool,
    target: { ...p },
    structure: c.structure ?? null,
    item: null,
    worker: null,
    progress: 0,
    status: "open",
    reason: "Waiting for a free goblin",
    paid: false,
    paidWithKit: false,
  });
  emit(
    s,
    "command",
    `${c.tool === "build" ? c.structure : c.tool} designated at ${p.x}, ${p.y}.`,
  );
  return { ok: true };
}
export function quantities(s: GameState): Record<Resource, number> {
  const q = {
    stone: 0,
    wood: 0,
    food: 0,
    ore: 0,
    bedkit: 0,
    iron: 0,
    copper: 0,
    gold: 0,
    gems: 0,
  };
  for (const i of s.items) q[i.resource] += i.quantity;
  return q;
}
function addItem(
  s: GameState,
  p: Position,
  resource: Resource,
  quantity: number,
): void {
  s.items.push({
    id: `item-${s.nextId++}`,
    resource,
    quantity,
    position: { ...p },
    holder: null,
    stored: false,
  });
}
function consume(
  s: GameState,
  cost: Partial<Record<Resource, number>>,
): boolean {
  for (const [r, n] of Object.entries(cost))
    if (
      s.items
        .filter((i) => i.resource === r && i.stored && !i.holder)
        .reduce((a, i) => a + i.quantity, 0) < n
    )
      return false;
  for (const [r, n] of Object.entries(cost)) {
    let left = n;
    for (const i of s.items.filter(
      (i) => i.resource === r && i.stored && !i.holder,
    )) {
      const used = Math.min(left, i.quantity);
      i.quantity -= used;
      left -= used;
    }
  }
  s.items = s.items.filter((i) => i.quantity > 0);
  return true;
}
function release(s: GameState, g: Goblin): void {
  const j = s.jobs.find((j) => j.id === g.job);
  if (j) {
    j.worker = null;
    if (j.status === "active") j.status = "open";
  }
  if (g.carrying) interruptDrop(s, g);
  g.job = null;
}
function move(s: GameState, g: Goblin, p: Position, adjacent = false): boolean {
  const result = advance(s, g, p, adjacent);
  if (result === "blocked") {
    const job = s.jobs.find((job) => job.id === g.job);
    if (job) job.reason = "Route blocked; waiting for a clear path";
    release(s, g);
    g.activity = "Route blocked: waiting for a clear path";
  } else if (result === "waiting") {
    g.activity = "Waiting for passage";
  } else if (result === "moved" && g.activity === "Waiting for passage") {
    g.activity = "Walking to work";
  }
  return result === "arrived";
}

function nearest(
  s: GameState,
  g: Goblin,
  candidates: Position[],
): Position | undefined {
  return candidates
    .sort((a, b) => distance(a, g.position) - distance(b, g.position))
    .find((p) => path(s, g.position, p) !== null);
}
function cells(
  s: GameState,
  test: (t: GameState["tiles"][number]) => boolean,
): Position[] {
  return s.tiles.flatMap((t, i) =>
    test(t) ? [position(i % s.width, Math.floor(i / s.width))] : [],
  );
}
function decayNeeds(g: Goblin): void {
  g.hunger = Math.min(100, g.hunger + 0.008);
  g.fatigue = Math.min(100, g.fatigue + 0.005);
}
function needs(s: GameState, g: Goblin): boolean {
  decayNeeds(g);
  if (g.hunger > 65 || g.activity === "Looking for supper") {
    release(s, g);
    const food = s.items
      .filter((i) => i.resource === "food" && !i.holder && i.quantity > 0)
      .sort(
        (a, b) =>
          distance(a.position, g.position) - distance(b.position, g.position),
      )
      .find((i) => path(s, g.position, i.position) !== null);
    if (food) {
      g.activity = "Looking for supper";
      if (move(s, g, food.position)) {
        food.quantity--;
        g.hunger = Math.max(0, g.hunger - 45);
        g.activity = "Enjoying mushroom supper";
        emit(
          s,
          "need",
          `${g.name} declares these mushrooms almost delicious.`,
          g.id,
        );
      }
      return true;
    }
    g.activity = "Hungry: harvest mushrooms or plant a patch";
  }
  if (
    g.fatigue > 75 ||
    g.activity === "Sleeping" ||
    g.activity === "Heading to bed"
  ) {
    release(s, g);
    const bed = nearest(
      s,
      g,
      cells(s, (t) => t.structure === "bed").filter(
        (p) =>
          !s.goblins.some(
            (o) =>
              o.id !== g.id && same(o.position, p) && o.activity === "Sleeping",
          ),
      ),
    );
    if (bed && !same(g.position, bed)) {
      g.activity = "Heading to bed";
      move(s, g, bed);
      return true;
    }
    g.activity = "Sleeping";
    g.fatigue = Math.max(0, g.fatigue - (bed ? 0.8 : 0.22));
    if (g.fatigue < 10) g.activity = "Well rested";
    return true;
  }
  return false;
}
function autoJobs(s: GameState): void {
  for (const item of s.items)
    if (
      !item.holder &&
      !item.stored &&
      item.quantity > 0 &&
      !s.jobs.some(
        (j) => j.item === item.id && ["open", "active"].includes(j.status),
      )
    ) {
      const target = cells(s, (t) => t.stockpile && !t.solid)[0];
      if (target)
        s.jobs.push({
          id: `job-${s.nextId++}`,
          kind: "haul",
          target,
          item: item.id,
          structure: null,
          worker: null,
          status: "open",
          progress: 0,
          reason: "Waiting for hauler",
          paid: false,
          paidWithKit: false,
        });
    }
  for (const p of cells(s, (t) => t.structure === "farm" && t.growth >= 600))
    if (
      !s.jobs.some(
        (j) =>
          same(j.target, p) &&
          j.kind === "harvest" &&
          ["open", "active"].includes(j.status),
      )
    )
      s.jobs.push({
        id: `job-${s.nextId++}`,
        kind: "harvest",
        target: p,
        item: null,
        structure: null,
        worker: null,
        status: "open",
        progress: 0,
        reason: "Mushrooms ready",
        paid: false,
        paidWithKit: false,
      });
}
function work(s: GameState, g: Goblin, j: Job): void {
  const t = tileAt(s, j.target)!;
  if (j.kind === "haul") {
    const item = s.items.find((i) => i.id === j.item);
    if (!item) {
      j.status = "cancelled";
      release(s, g);
      return;
    }
    if (!g.carrying) {
      g.activity = "Collecting loose supplies";
      if (move(s, g, item.position) && s.tick >= g.nextMoveAt) {
        item.holder = g.id;
        g.carrying = item.id;
      }
    } else {
      g.activity = `Hauling ${item.resource}`;
      item.position = { ...g.position };
      if (move(s, g, j.target) && s.tick >= g.nextMoveAt) {
        beginDrop(s, g);
        j.reason = "Putting down supplies";
      }
    }
    return;
  }
  const adjacent =
    j.kind === "dig" ||
    j.kind === "craft" ||
    (j.kind === "build" && j.structure === "wall");
  if (!move(s, g, j.target, adjacent)) {
    if (g.job && g.activity !== "Waiting for passage")
      g.activity = `Walking to ${j.kind}`;
    return;
  }
  if (
    j.kind === "build" &&
    j.structure === "wall" &&
    s.goblins.some((o) => same(o.position, j.target))
  ) {
    const occupant = s.goblins.find((o) => same(o.position, j.target))!;
    if (!makeRoom(s, occupant, [j.target], g.name)) {
      j.reason = "Waiting for the wall site to be clear";
      g.activity = "Waiting for the wall site to be clear";
      return;
    }
  }
  if (j.kind === "build" && !j.paid) {
    j.paidWithKit = j.structure === "bed" && consume(s, { bedkit: 1 });
    if (!j.paidWithKit && !consume(s, costs[j.structure!])) {
      j.reason = "Missing stored building materials";
      release(s, g);
      return;
    }
    j.paid = true;
  }
  if (j.kind === "craft" && !j.paid) {
    if (!consume(s, { wood: 1 })) {
      j.reason = "Needs one stored wood";
      release(s, g);
      return;
    }
    j.paid = true;
  }
  g.activity =
    j.kind === "dig"
      ? "Digging rock"
      : j.kind === "build"
        ? `Building ${j.structure}`
        : j.kind === "craft"
          ? "Carving a wooden bed kit"
          : j.kind === "explore"
            ? "Scouting the passage"
            : "Gathering supplies";
  g.facing = facingFor(
    j.target.x - g.position.x,
    j.target.y - g.position.y,
    g.facing,
  );
  j.progress++;
  g.worked++;
  const required =
    j.kind === "dig"
      ? materials[t.material].hardness
      : j.kind === "build"
        ? 35
        : j.kind === "explore"
          ? 1
          : 25;
  if (j.progress < required) return;
  if (j.kind === "dig") {
    t.solid = false;
    invalidateNavigation(s);
    const drop = t.deposit ? deposits[t.deposit] : null;
    addItem(
      s,
      j.target,
      drop?.resource ?? materials[t.material].drop,
      drop?.quantity ?? 2,
    );
    t.deposit = null;
    discover(s, g.position);
    warnOnExcavation(s, j.target);
  }
  if (j.kind === "build") {
    t.structure = j.structure;
    invalidateNavigation(s);
    t.growth = 0;
  }
  if (j.kind === "harvest") {
    const drop = t.deposit ? deposits[t.deposit] : null;
    addItem(
      s,
      j.target,
      t.structure === "farm" ? "food" : (drop?.resource ?? "food"),
      t.structure === "farm" ? 8 : (drop?.quantity ?? 5),
    );
    if (t.structure === "farm") t.growth = 0;
    else t.deposit = null;
  }
  // Craft a physical kit; beds use this before falling back to raw wood.
  if (j.kind === "craft") addItem(s, g.position, "bedkit", 1);
  emit(
    s,
    "work",
    `${g.name} finished ${j.kind === "build" ? `a ${j.structure}` : j.kind === "dig" ? "digging a tile" : j.kind === "craft" ? "a bed kit" : j.kind === "explore" ? "scouting a passage" : "gathering supplies"}.`,
    g.id,
  );
  j.status = "done";
  release(s, g);
}
export function step(s: GameState): void {
  s.tick++;
  updateWeather(s);
  updateStability(s);
  for (const t of s.tiles)
    if (t.structure === "farm") t.growth = Math.min(600, t.growth + 1);
  s.items = s.items.filter((i) => i.quantity > 0);
  if (s.tick % 10 === 0) autoJobs(s);
  const first = s.tick % s.goblins.length;
  const workers = [...s.goblins.slice(first), ...s.goblins.slice(0, first)];
  for (const g of workers) {
    if (updateDrop(s, g)) {
      decayNeeds(g);
      continue;
    }
    if (needs(s, g)) continue;
    let j = s.jobs.find((j) => j.id === g.job && j.status === "active");
    if (!j) {
      g.job = null;
      const options = s.jobs
        .filter((j) => j.status === "open")
        .sort(
          (a, b) =>
            distance(g.position, a.target) - distance(g.position, b.target) ||
            a.id.localeCompare(b.id),
        );
      j = options.find((candidate) => {
        const target =
          candidate.kind === "haul"
            ? s.items.find((i) => i.id === candidate.item)?.position
            : candidate.target;
        if (!target) return false;
        if (
          candidate.kind === "build" &&
          !candidate.paid &&
          !(candidate.structure === "bed" && quantities(s).bedkit > 0)
        ) {
          const q = quantities(s);
          if (
            Object.entries(costs[candidate.structure!]).some(
              ([r, n]) => q[r as Resource] < n,
            )
          ) {
            candidate.reason = "Missing building materials";
            return false;
          }
        }
        const reachable =
          path(
            s,
            g.position,
            target,
            candidate.kind === "dig" ||
              candidate.kind === "craft" ||
              (candidate.kind === "build" && candidate.structure === "wall"),
          ) !== null;
        candidate.reason = reachable
          ? "Nearest available work"
          : "No reachable working tile";
        return reachable;
      });
      if (j) {
        j.worker = g.id;
        j.status = "active";
        g.job = j.id;
      }
    }
    if (j) work(s, g, j);
    else g.activity = "Idle: designate work or grow the grotto";
  }
  if (s.tick % 10 === 0) for (const g of s.goblins) discover(s, g.position);
  s.items = s.items.filter((i) => i.quantity > 0);
  for (const j of s.jobs)
    if (
      j.kind === "haul" &&
      ["open", "active"].includes(j.status) &&
      !s.items.some((i) => i.id === j.item)
    ) {
      j.status = "cancelled";
      const worker = s.goblins.find((g) => g.id === j.worker);
      if (worker) release(s, worker);
      j.worker = null;
    }
  // Keep active reservations and a small recent job history.
  const finished = s.jobs
    .filter((j) => ["done", "cancelled"].includes(j.status))
    .slice(-60);
  s.jobs = [
    ...s.jobs.filter((j) => !["done", "cancelled"].includes(j.status)),
    ...finished,
  ];
}
