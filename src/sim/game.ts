import type { Position, Result } from "../core/types";
import {
  type Command,
  type GameState,
  type Goblin,
  type Job,
  type Resource,
  type StoryEvent,
  costs,
  distance,
  materials,
  position,
  same,
  tileAt,
} from "./model";
import { path } from "./world";
export { createGame } from "./world";
export function emit(
  s: GameState,
  kind: StoryEvent["kind"],
  text: string,
  actor: StoryEvent["actor"] = null,
): void {
  if (actor && !s.goblins.some((g) => g.id === actor))
    throw new Error("Unknown event actor");
  s.events.push({ id: `event-${s.nextId++}`, tick: s.tick, kind, text, actor });
  if (s.events.length > 80) s.events.shift();
}
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
    release(s, g);
    if (route.length) g.position = route[0];
    g.activity = "Following your guidance";
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
  if (
    c.tool === "dig" &&
    (!t.solid || !Number.isFinite(materials[t.material].hardness))
  )
    return {
      ok: false,
      reason: "Choose diggable rock; the boundary cannot be dug.",
    };
  if (c.tool === "build" && (t.solid || t.structure || !c.structure))
    return { ok: false, reason: "Choose empty floor and a structure." };
  if (c.tool === "harvest" && (t.solid || !t.deposit))
    return { ok: false, reason: "Choose mushrooms or a tree." };
  if (c.tool === "craft" && t.structure !== "workshop")
    return { ok: false, reason: "Select a completed workshop." };
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
  const q = { stone: 0, wood: 0, food: 0, ore: 0, bedkit: 0 };
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
  if (g.carrying) {
    const item = s.items.find((i) => i.id === g.carrying);
    if (item) {
      item.holder = null;
      item.position = { ...g.position };
      item.stored = false;
    }
    g.carrying = null;
  }
  g.job = null;
}
function move(s: GameState, g: Goblin, p: Position, adjacent = false): boolean {
  const route = path(s, g.position, p, adjacent);
  if (!route) return false;
  if (route.length && s.tick % 3 === 0) g.position = route[0];
  return route.length === 0;
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
function needs(s: GameState, g: Goblin): boolean {
  g.hunger = Math.min(100, g.hunger + 0.008);
  g.fatigue = Math.min(100, g.fatigue + 0.005);
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
      if (move(s, g, item.position)) {
        item.holder = g.id;
        g.carrying = item.id;
      }
    } else {
      g.activity = `Hauling ${item.resource}`;
      item.position = { ...g.position };
      if (move(s, g, j.target)) {
        item.holder = null;
        item.position = { ...g.position };
        item.stored = true;
        g.carrying = null;
        j.status = "done";
        release(s, g);
      }
    }
    return;
  }
  const adjacent = j.kind === "dig" || j.kind === "craft";
  if (!move(s, g, j.target, adjacent)) {
    g.activity = `Walking to ${j.kind}`;
    return;
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
          : "Gathering mushrooms and wood";
  j.progress++;
  g.worked++;
  const required =
    j.kind === "dig"
      ? materials[t.material].hardness
      : j.kind === "build"
        ? 35
        : 25;
  if (j.progress < required) return;
  if (j.kind === "dig") {
    t.solid = false;
    addItem(s, j.target, t.deposit === "ore" ? "ore" : "stone", 2);
    t.deposit = null;
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const n = tileAt(s, position(j.target.x + dx, j.target.y + dy));
        if (n) n.discovered = true;
      }
  }
  if (j.kind === "build") {
    t.structure = j.structure;
    t.growth = 0;
  }
  if (j.kind === "harvest") {
    addItem(
      s,
      j.target,
      t.deposit === "wood" ? "wood" : "food",
      t.structure === "farm" ? 8 : 5,
    );
    if (t.structure === "farm") t.growth = 0;
    else t.deposit = null;
  }
  // Craft a physical kit; beds use this before falling back to raw wood.
  if (j.kind === "craft") addItem(s, g.position, "bedkit", 1);
  emit(
    s,
    "work",
    `${g.name} finished ${j.kind === "build" ? `a ${j.structure}` : j.kind === "dig" ? "digging a tile" : j.kind === "craft" ? "a bed kit" : "gathering supplies"}.`,
    g.id,
  );
  j.status = "done";
  release(s, g);
}
export function step(s: GameState): void {
  s.tick++;
  for (const t of s.tiles)
    if (t.structure === "farm") t.growth = Math.min(600, t.growth + 1);
  s.items = s.items.filter((i) => i.quantity > 0);
  if (s.tick % 10 === 0) autoJobs(s);
  for (const g of s.goblins) {
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
            candidate.kind === "dig" || candidate.kind === "craft",
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
