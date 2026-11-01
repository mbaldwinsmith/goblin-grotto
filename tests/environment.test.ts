import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import { position, tileAt, type GameState } from "../src/sim/model";
import { season, updateWeather, DAY_TICKS } from "../src/sim/climate";
import {
  movementTicks,
  path,
  invalidateNavigation,
} from "../src/sim/navigation";
import {
  warnOnExcavation,
  updateStability,
  hasSupport,
  COLLAPSE_WARNING_TICKS,
} from "../src/sim/stability";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
function weakCeiling(s: GameState) {
  const p = position(35, 30),
    t = tileAt(s, p)!;
  t.material = "loose";
  t.solid = false;
  t.feature = null;
  t.structure = null;
  for (const [x, y] of [
    [34, 30],
    [36, 30],
    [35, 29],
    [35, 31],
  ]) {
    const n = tileAt(s, position(x, y))!;
    n.solid = false;
    n.feature = null;
  }
  invalidateNavigation(s);
  return p;
}
it("warns before a deterministic fall and supports cancel it", () => {
  const s = createGame("support"),
    p = weakCeiling(s);
  warnOnExcavation(s, p);
  expect(tileAt(s, p)!.collapseAt).toBe(COLLAPSE_WARNING_TICKS);
  expect(s.events.at(-1)?.text).toContain("Loose ceiling");
  expect(
    dispatch(s, {
      type: "designate",
      tool: "build",
      structure: "bed",
      position: p,
    }).ok,
  ).toBe(false);
  expect(
    dispatch(s, {
      type: "designate",
      tool: "build",
      structure: "support",
      position: position(34, 30),
    }).ok,
  ).toBe(true);
  for (let i = 0; i < 150; i++) step(s);
  expect(hasSupport(s, p)).toBe(true);
  expect(tileAt(s, p)!.collapseAt).toBeNull();
  expect(tileAt(s, p)!.solid).toBe(false);
});
it("unsupported non-critical floor collapses, while occupied tiles are spared", () => {
  const s = createGame("fall"),
    p = weakCeiling(s);
  warnOnExcavation(s, p);
  s.tick = COLLAPSE_WARNING_TICKS - 1;
  updateStability(s);
  expect(tileAt(s, p)!.solid).toBe(false);
  s.tick++;
  updateStability(s);
  expect(tileAt(s, p)!.solid).toBe(true);
  expect(
    path(s, s.goblins[0].position, position(29, 32), false, true),
  ).not.toBeNull();
  const b = createGame("occupied"),
    q = weakCeiling(b);
  b.goblins[0].position = q;
  warnOnExcavation(b, q);
  b.tick = COLLAPSE_WARNING_TICKS;
  updateStability(b);
  expect(tileAt(b, q)!.solid).toBe(false);
  expect(tileAt(b, q)!.collapseAt).toBeGreaterThan(b.tick);
});
it("a critical passage remains open and items retain unique identity", () => {
  const s = createGame("safe-fall");
  for (const t of s.tiles) {
    t.solid = true;
    t.structure = null;
    t.feature = null;
    t.discovered = true;
  }
  for (let x = 27; x <= 34; x++) tileAt(s, position(x, 30))!.solid = false;
  s.goblins.forEach((g, i) => {
    g.position = position(27 + i, 30);
  });
  s.items[0].position = position(33, 30);
  s.items[1].position = position(33, 30);
  s.items[2].position = position(33, 30);
  const p = position(31, 30),
    t = tileAt(s, p)!;
  t.collapseAt = 1;
  invalidateNavigation(s);
  s.tick = 1;
  updateStability(s);
  expect(t.solid).toBe(false);
  expect(s.events.at(-1)?.text).toContain("No goblin is trapped");
  expect(new Set(s.items.map((i) => i.id)).size).toBe(s.items.length);
});
it("seasons and seeded weather replay, with movement effects only outdoors", () => {
  const a = createGame("rain"),
    b = createGame("rain");
  for (let tick = 600; tick <= DAY_TICKS * 20; tick += 600) {
    a.tick = tick;
    b.tick = tick;
    updateWeather(a);
    updateWeather(b);
    if (a.weather.kind === "snow") expect(season(a)).toBe("Winter");
  }
  expect(a.weather).toEqual(b.weather);
  expect(a.rng).toBe(b.rng);
  a.weather.kind = "clear";
  const inside = movementTicks(a, position(30, 30)),
    outside = movementTicks(a, position(54, 31));
  a.weather.kind = "rain";
  expect(movementTicks(a, position(30, 30))).toBe(inside);
  expect(movementTicks(a, position(54, 31))).toBe(outside + 1);
  a.weather.kind = "snow";
  expect(movementTicks(a, position(54, 31))).toBe(outside + 2);
});
it("migrates an actual v2 colony without adding hazards or losing work, then preserves new state", () => {
  const text = gunzipSync(
      readFileSync("tests/fixtures/v2-active-colony.json.gz"),
    ).toString(),
    s = decodeSave(text);
  expect(s.version).toBe(8);
  expect(s.weather).toEqual({ kind: "clear", changedAt: 0 });
  expect(s.tiles.every((t) => t.collapseAt === null)).toBe(true);
  expect(s.jobs.some((j) => j.status === "active")).toBe(true);
  const { weather, ...old } = s;
  expect({
    ...old,
    version: 2,
    jobs: s.jobs.map(({ priority, ...job }) => job),
    goblins: s.goblins.map(
      ({ kind, facing, nextMoveAt, drop, preferredWork, ...g }) => g,
    ),
    tiles: s.tiles.map(({ collapseAt, stockpileFilter, ...t }) => t),
  }).toEqual(JSON.parse(text));
  s.weather = { kind: "rain", changedAt: 0 };
  const p = weakCeiling(s);
  warnOnExcavation(s, p);
  const b = decodeSave(encodeSave(s));
  for (let i = 0; i < 500; i++) {
    step(s);
    step(b);
  }
  expect(snapshotHash(s)).toBe(snapshotHash(b));
});
it("a blocked haul releases both worker and carried item instead of locking them forever", () => {
  const s = createGame("blocked-haul"),
    g = s.goblins[0],
    target = position(34, 30);
  g.position = position(28, 30);
  for (let i = 1; i < 4; i++) s.goblins[i].position = position(34 + i, 30);
  const item = {
    id: `item-${s.nextId++}` as const,
    resource: "stone" as const,
    quantity: 1,
    position: { ...g.position },
    holder: g.id,
    stored: false,
  };
  s.items.push(item);
  g.carrying = item.id;
  const job = {
    id: `job-${s.nextId++}` as const,
    kind: "haul" as const,
    priority: 2 as const,
    target,
    structure: null,
    item: item.id,
    worker: g.id,
    progress: 0,
    status: "active" as const,
    reason: "Hauling",
    paid: false,
    paidWithKit: false,
  };
  s.jobs.push(job);
  g.job = job.id;
  path(s, g.position, target);
  for (const [x, y] of [
    [27, 30],
    [29, 30],
    [28, 29],
    [28, 31],
  ])
    tileAt(s, position(x, y))!.solid = true;
  invalidateNavigation(s);
  step(s);
  expect(g.job).toBeNull();
  expect(g.carrying).toBeNull();
  expect(item.holder).toBeNull();
  expect(item.position).toEqual(g.position);
  expect(s.jobs.find((j) => j.id === job.id)?.worker).toBeNull();
  expect(() => decodeSave(encodeSave(s))).not.toThrow();
});
