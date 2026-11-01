import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import {
  position,
  tileAt,
  type GameState,
  type JobKind,
  type JobPriority,
  type Structure,
} from "../src/sim/model";
import { assignWork, evaluateWork } from "../src/sim/labour";
import { invalidateNavigation } from "../src/sim/navigation";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
function colony(seed = "labour") {
  const s = createGame(seed);
  for (let y = 25; y <= 35; y++)
    for (let x = 24; x <= 40; x++) {
      const t = tileAt(s, position(x, y))!;
      t.solid = false;
      t.discovered = true;
      t.material = "hard";
      t.feature = null;
      t.structure = null;
      t.deposit = null;
    }
  s.goblins.forEach((g) => {
    g.fatigue = 0;
    g.hunger = 10;
  });
  invalidateNavigation(s);
  return s;
}
function plan(
  s: GameState,
  kind: JobKind,
  x: number,
  y: number,
  priority: JobPriority = 2,
  structure?: Structure,
) {
  if (kind === "dig") tileAt(s, position(x, y))!.solid = true;
  expect(
    dispatch(s, {
      type: "designate",
      tool: kind,
      position: position(x, y),
      priority,
      structure,
    }).ok,
  ).toBe(true);
  invalidateNavigation(s);
  return s.jobs.at(-1)!;
}
it("high-priority distant work is chosen before nearby normal work", () => {
  const s = colony(),
    near = plan(s, "dig", 32, 30),
    far = plan(s, "dig", 39, 30, 3);
  assignWork(s, [s.goblins[0]]);
  expect(far.worker).toBe(s.goblins[0].id);
  expect(near.worker).toBeNull();
  expect(far.reason).toContain("High priority");
});
it("the closest available worker gets a job and four workers reserve four different jobs", () => {
  const s = colony(),
    job = plan(s, "dig", 32, 30);
  assignWork(s, s.goblins);
  expect(job.worker).toBe(s.goblins[3].id);
  const b = colony();
  for (const [x, y] of [
    [32, 30],
    [28, 28],
    [32, 32],
    [35, 29],
  ])
    plan(b, "dig", x, y);
  step(b);
  const active = b.jobs.filter((j) => j.status === "active");
  expect(active).toHaveLength(4);
  expect(new Set(active.map((j) => j.worker)).size).toBe(4);
  expect(new Set(b.goblins.map((g) => g.job)).size).toBe(4);
});
it("preferred work guides suitability without restricting other jobs or interrupting active work", () => {
  const s = colony(),
    dig = plan(s, "dig", 29, 29),
    build = plan(s, "build", 30, 29, 2, "bed");
  dispatch(s, { type: "preference", actor: s.goblins[0].id, work: "dig" });
  dispatch(s, { type: "preference", actor: s.goblins[1].id, work: "build" });
  assignWork(s, s.goblins.slice(0, 2));
  expect(dig.worker).toBe(s.goblins[0].id);
  expect(build.worker).toBe(s.goblins[1].id);
  expect(dig.reason).toContain("preferred work");
  dispatch(s, { type: "preference", actor: s.goblins[0].id, work: "build" });
  expect(s.goblins[0].job).toBe(dig.id);
  const b = colony();
  b.goblins[0].preferredWork = "craft";
  const other = plan(b, "dig", 32, 30);
  assignWork(b, [b.goblins[0]]);
  expect(other.worker).toBe(b.goblins[0].id);
});
it("food shortages, hunger and loose ceilings give relevant jobs urgency", () => {
  const s = colony();
  s.items = s.items.filter((i) => i.resource !== "food");
  s.goblins[0].hunger = 60;
  tileAt(s, position(28, 29))!.deposit = "wood";
  tileAt(s, position(35, 29))!.deposit = "food";
  const wood = plan(s, "harvest", 28, 29),
    food = plan(s, "harvest", 35, 29);
  assignWork(s, [s.goblins[0]]);
  expect(food.worker).toBe(s.goblins[0].id);
  expect(wood.worker).toBeNull();
  expect(food.reason).toContain("food supplies are low");
  expect(food.reason).toContain("hungry worker");
  const b = colony();
  plan(b, "build", 28, 29, 2, "bed");
  tileAt(b, position(37, 30))!.collapseAt = 300;
  const support = plan(b, "build", 36, 30, 2, "support");
  assignWork(b, [b.goblins[0]]);
  expect(support.worker).toBe(b.goblins[0].id);
  expect(support.reason).toContain("loose ceiling");
});
it("tired workers favour lighter work and urgent needs still override high-priority work", () => {
  const s = colony(),
    g = s.goblins[0];
  tileAt(s, position(28, 29))!.deposit = "wood";
  const dig = plan(s, "dig", 29, 29),
    gather = plan(s, "harvest", 28, 29);
  g.fatigue = 60;
  const light = evaluateWork(s, g, gather),
    heavy = evaluateWork(s, g, dig);
  expect(
    "score" in light && "score" in heavy && light.score > heavy.score,
  ).toBe(true);
  const b = colony();
  const high = plan(b, "dig", 32, 30, 3);
  b.goblins.forEach((worker) => {
    worker.hunger = 90;
  });
  step(b);
  expect(high.worker).toBeNull();
  expect(b.goblins.every((worker) => !worker.job)).toBe(true);
});
it("ineligible high work does not starve normal work, and loose materials are not stored materials", () => {
  const s = colony();
  s.items
    .filter((i) => i.resource === "wood")
    .forEach((i) => {
      i.stored = false;
    });
  const bed = plan(s, "build", 28, 29, 3, "bed"),
    dig = plan(s, "dig", 32, 30);
  assignWork(s, [s.goblins[0]]);
  expect(bed.worker).toBeNull();
  expect(bed.reason).toContain("stored");
  expect(dig.worker).toBe(s.goblins[0].id);
  const b = colony(),
    blocked = plan(b, "dig", 39, 30, 3);
  for (const t of b.tiles)
    if (
      t.material !== "impenetrable" &&
      !b.goblins.some((g) => tileAt(b, g.position) === t)
    )
      t.discovered = false;
  tileAt(b, blocked.target)!.discovered = true;
  invalidateNavigation(b);
  assignWork(b, [b.goblins[0]]);
  expect(blocked.reason).toContain("reachable");
});
it("selection is seeded, varies close ties, and pure inspection does not consume RNG", () => {
  const chosen = new Set<string>();
  for (let seed = 0; seed < 16; seed++) {
    const a = colony(`tie-${seed}`);
    a.goblins[0].position = position(28, 30);
    a.goblins[1].position = position(30, 30);
    a.goblins[2].position = position(34, 30);
    a.goblins[3].position = position(35, 30);
    const job = plan(a, "dig", 29, 29);
    const before = a.rng;
    evaluateWork(a, a.goblins[0], job);
    expect(a.rng).toBe(before);
    const b = decodeSave(encodeSave(a));
    assignWork(a, a.goblins.slice(0, 2));
    assignWork(b, b.goblins.slice(0, 2));
    expect(snapshotHash(a)).toBe(snapshotHash(b));
    chosen.add(job.worker!);
  }
  expect(chosen.size).toBe(2);
});
it("reprioritisation and preferences persist and reject invalid requests", () => {
  const s = colony(),
    job = plan(s, "dig", 32, 30);
  expect(
    dispatch(s, { type: "prioritize", position: job.target, priority: 3 }).ok,
  ).toBe(true);
  dispatch(s, { type: "preference", actor: s.goblins[0].id, work: "dig" });
  expect(decodeSave(encodeSave(s))).toEqual(s);
  expect(
    dispatch(s, { type: "prioritize", position: position(24, 25), priority: 1 })
      .ok,
  ).toBe(false);
  expect(
    dispatch(s, { type: "preference", actor: "goblin-999", work: "build" }).ok,
  ).toBe(false);
  const bad = structuredClone(s);
  bad.jobs[0].priority = 9 as JobPriority;
  expect(() => decodeSave(encodeSave(bad))).toThrow("damaged");
});
it("migrates a real schema-6 drop wind-up and continues priorities and seeded decisions exactly", () => {
  const text = gunzipSync(
      readFileSync("tests/fixtures/v6-drop-windup.json.gz"),
    ).toString(),
    s = decodeSave(text);
  expect(s.version).toBe(9);
  expect(s.goblins.some((g) => g.drop)).toBe(true);
  expect({
    ...s,
    version: 6,
    tiles: s.tiles.map(({ stockpileFilter, ...tile }) => tile),
    goblins: s.goblins.map(({ preferredWork, workAction, ...g }) => g),
    jobs: s.jobs.map(({ priority, ...j }) => j),
  }).toEqual(JSON.parse(text));
  dispatch(s, { type: "preference", actor: s.goblins[0].id, work: "build" });
  plan(s, "build", 31, 29, 3, "bed");
  const b = decodeSave(encodeSave(s));
  for (let i = 0; i < 500; i++) {
    step(s);
    step(b);
  }
  expect(snapshotHash(s)).toBe(snapshotHash(b));
});
