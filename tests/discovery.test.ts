import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step, quantities } from "../src/sim/game";
import { deposits, features, position, tileAt } from "../src/sim/model";
import { validateWorld } from "../src/sim/validation";
import { revealFrom } from "../src/sim/visibility";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
it("seeded landmarks have meaningful affordances and distinct archetypes", () => {
  const kinds = new Set<string>();
  for (let seed = 0; seed < 30; seed++) {
    const s = createGame(`landmarks-${seed}`);
    expect(validateWorld(s)).toEqual([]);
    const sites = s.tiles.filter(
      (t) => t.feature && features[t.feature].landmark,
    );
    expect(sites).toHaveLength(4);
    for (const t of sites) {
      kinds.add(t.feature!);
      expect(features[t.feature!].description.length).toBeGreaterThan(30);
    }
    for (const kind of ["iron", "copper", "gold", "gems"] as const)
      expect(s.tiles.some((t) => t.solid && t.deposit === kind)).toBe(true);
  }
  expect(kinds).toEqual(
    new Set(["grove", "ruin", "mine", "pond", "shrine", "den"]),
  );
});
it("fog blocks wall sight, keeps known paths and reveals a landmark once", () => {
  const s = createGame("fog");
  for (const t of s.tiles) {
    t.discovered = false;
    t.solid = true;
    t.feature = null;
  }
  for (let x = 28; x <= 32; x++) tileAt(s, position(x, 30))!.solid = false;
  tileAt(s, position(31, 30))!.solid = true;
  tileAt(s, position(32, 30))!.feature = "shrine";
  revealFrom(s, position(30, 30));
  expect(tileAt(s, position(31, 30))!.discovered).toBe(true);
  expect(tileAt(s, position(32, 30))!.discovered).toBe(false);
  tileAt(s, position(31, 30))!.solid = false;
  expect(revealFrom(s, position(30, 30))).toEqual(["shrine"]);
  expect(revealFrom(s, position(30, 30))).toEqual([]);
  revealFrom(s, position(10, 10));
  expect(tileAt(s, position(32, 30))!.discovered).toBe(true);
});
it("autonomous scouts reveal the next chamber and retain discovery through save/load", () => {
  const s = createGame("scout");
  const knownBefore = s.tiles.filter((t) => t.discovered).length;
  expect(
    dispatch(s, {
      type: "designate",
      tool: "explore",
      position: position(38, 31),
    }).ok,
  ).toBe(true);
  for (let i = 0; i < 250; i++) step(s);
  expect(s.tiles.filter((t) => t.discovered).length).toBeGreaterThan(
    knownBefore,
  );
  expect(tileAt(s, position(41, 31))!.discovered).toBe(true);
  expect(decodeSave(encodeSave(s))).toEqual(s);
  expect(
    dispatch(s, { type: "designate", tool: "dig", position: position(15, 18) })
      .ok,
  ).toBe(false);
});
it("mining and gathering produce the declared resource, without sharing item IDs", () => {
  const s = createGame("resource-drops");
  s.goblins = s.goblins.slice(0, 1);
  s.goblins[0].position = position(30, 30);
  const t = tileAt(s, position(31, 30))!;
  t.solid = true;
  t.discovered = true;
  t.material = "sand";
  t.deposit = "gold";
  dispatch(s, { type: "designate", tool: "dig", position: position(31, 30) });
  for (let i = 0; i < 12; i++) step(s);
  expect(quantities(s).gold).toBe(deposits.gold.quantity);
  const masonry = tileAt(s, position(30, 29))!;
  masonry.deposit = "masonry";
  dispatch(s, {
    type: "designate",
    tool: "harvest",
    position: position(30, 29),
  });
  for (let i = 0; i < 100; i++) step(s);
  expect(quantities(s).stone).toBeGreaterThanOrEqual(15);
  expect(new Set(s.items.map((i) => i.id)).size).toBe(s.items.length);
});
it("validation identifies impossible seeds, not merely their array sizes", () => {
  const s = createGame("invalid");
  tileAt(s, position(0, 0))!.solid = false;
  for (const i of s.items) if (i.resource === "food") i.quantity = 0;
  expect(validateWorld(s)).toContain("Broken map boundary");
  expect(validateWorld(s)).toContain("No reachable starting food");
});
it("the actual v1 active-colony fixture migrates without losing work or known terrain", () => {
  const text = gunzipSync(
    readFileSync("tests/fixtures/v1-active-colony.json.gz"),
  ).toString();
  const migrated = decodeSave(text);
  expect(migrated.version).toBe(8);
  expect(migrated.jobs.some((j) => j.status === "active")).toBe(true);
  expect(migrated.tiles.every((t) => t.feature === null)).toBe(true);
  // Removing just the new fields reproduces the original snapshot exactly.
  const legacy = JSON.parse(text);
  const { weather, ...original } = migrated;
  const restored = {
    ...original,
    version: 1,
    jobs: migrated.jobs.map(({ priority, ...job }) => job),
    goblins: migrated.goblins.map(
      ({ kind, facing, nextMoveAt, drop, preferredWork, ...g }) => g,
    ),
    tiles: migrated.tiles.map(
      ({ feature, collapseAt, stockpileFilter, ...tile }) => tile,
    ),
  };
  expect(restored).toEqual(legacy);
  const again = decodeSave(encodeSave(migrated));
  for (let i = 0; i < 500; i++) {
    step(migrated);
    step(again);
  }
  expect(snapshotHash(migrated)).toBe(snapshotHash(again));
});
