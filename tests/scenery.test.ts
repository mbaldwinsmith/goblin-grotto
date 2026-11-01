import { expect, it } from "vitest";
import { createGame } from "../src/sim/game";
import { position, tileAt } from "../src/sim/model";
import { seedValue } from "../src/core/random";
import { snapshotHash } from "../src/core/snapshot";
import { encodeSave, decodeSave } from "../src/persistence/save";
import {
  tileScenery,
  itemArt,
  sceneryFrames,
  treeBounds,
  treeAtPoint,
  treeOverlapsActor,
  farmArt,
  farmStages,
  sceneryViewport,
} from "../src/render/scenery";
import { inspectPoint, objectDepth, actorDepth } from "../src/render/picking";
import legacy from "../public/assets/prototype/manifest.json";
it("resolves every terrain role and all 185 source alternatives without consuming simulation randomness", () => {
  const s = createGame("scenery-contract"),
    before = snapshotHash(s);
  const available = new Set([
      ...sceneryFrames.keys(),
      ...legacy.assets.map((a) => a.id),
    ]),
    used = new Set<string>();
  const t = structuredClone(s.tiles[0]);
  t.solid = false;
  t.outside = false;
  t.structure = null;
  t.feature = null;
  for (let n = 0; n < 500; n++) {
    const p = position(n % 64, Math.floor(n / 64)),
      seed = seedValue(s.seed);
    for (const material of [
      "sand",
      "mud",
      "loose",
      "hard",
      "bedrock",
      "impenetrable",
    ] as const) {
      t.material = material;
      const roles = tileScenery(seed, t, p);
      for (const id of [roles.floor, roles.top, roles.side]) {
        expect(available.has(id), id).toBe(true);
        used.add(id);
      }
    }
    t.material = "hard";
    for (const feature of ["ruin", "grove", "undergrowth"] as const) {
      t.feature = feature;
      const r = tileScenery(seed, t, p);
      used.add(r.floor);
      if (r.plant) used.add(r.plant);
    }
    t.feature = null;
    for (const deposit of ["food", "wood"] as const) {
      t.deposit = deposit;
      used.add(tileScenery(seed, t, p).plant!);
    }
    t.deposit = null;
    t.structure = "farm";
    for (const growth of [0, 200, 600]) {
      t.growth = growth;
      used.add(tileScenery(seed, t, p).plant!);
    }
    t.structure = null;
    for (const resource of [
      "food",
      "wood",
      "stone",
      "ore",
      "iron",
      "copper",
      "gold",
      "gems",
    ] as const)
      used.add(itemArt(resource, `item-${n}`)!);
  }
  for (const id of sceneryFrames.keys()) expect(used.has(id), id).toBe(true);
  for (const id of used) expect(available.has(id), id).toBe(true);
  expect(snapshotHash(s)).toBe(before);
});
it("uses the two correct visual alternatives per farm stage and changes stage only at growth thresholds", () => {
  expect(farmStages.young).toEqual([
    "lanterncap-farm-01",
    "lanterncap-farm-04",
  ]);
  expect(farmStages.growing).toEqual([
    "lanterncap-farm-03",
    "lanterncap-farm-05",
  ]);
  expect(farmStages.ripe).toEqual(["lanterncap-farm-02", "lanterncap-farm-06"]);
  for (let key = 0; key < 10; key++) {
    expect(farmArt(0, key)).toBe(farmStages.young[key % 2]);
    expect(farmArt(199, key)).toBe(farmArt(0, key));
    expect(farmArt(200, key)).toBe(farmStages.growing[key % 2]);
    expect(farmArt(599, key)).toBe(farmArt(200, key));
    expect(farmArt(600, key)).toBe(farmStages.ripe[key % 2]);
  }
});
it("aligns the bottom-middle 32px square of every native 96px tree with the logical tile", () => {
  for (const p of [position(0, 0), position(32, 30), position(63, 63)]) {
    const b = treeBounds(p);
    expect(b).toMatchObject({ width: 96, height: 96 });
    expect(b.x + 32).toBe(p.x * 32);
    expect(b.y + 64).toBe(p.y * 32);
    expect(b.x + 64).toBe((p.x + 1) * 32);
    expect(b.y + 96).toBe((p.y + 1) * 32);
  }
  const trees = [...sceneryFrames.values()].filter(
    (f) => f.family === "foliage/trees",
  );
  expect(trees).toHaveLength(9);
  expect(trees.every((f) => f.width === 96 && f.height === 96)).toBe(true);
});
function treeWorld() {
  const s = createGame("canopy-picking");
  for (const t of s.tiles) {
    t.solid = false;
    t.discovered = true;
    t.deposit = null;
    t.structure = null;
    t.feature = null;
  }
  s.goblins.forEach((g, i) => {
    g.position = position(10 + i, 10);
  });
  const root = position(32, 30);
  tileAt(s, root)!.deposit = "wood";
  return { s, root };
}
it("picks tree canopies at their roots, uses logical depth and reveals actors behind them", () => {
  const { s, root } = treeWorld(),
    g = s.goblins[0];
  g.position = position(32, 29);
  const x = 32 * 32 + 16,
    y = 29 * 32 + 12;
  expect(treeAtPoint(s, x, y)).toEqual(root);
  expect(inspectPoint(s, x, y, false)).toEqual({ position: root, actor: null });
  expect(inspectPoint(s, x, y, true).actor).toBe(g.id);
  expect(treeOverlapsActor(root, g.position)).toBe(true);
  expect(objectDepth(root)).toBeGreaterThan(actorDepth(g.position));
  g.position = root;
  expect(inspectPoint(s, x, 30 * 32 + 12, false).actor).toBe(g.id);
  g.position = position(32, 31);
  expect(inspectPoint(s, x, 31 * 32 + 12, false).actor).toBe(g.id);
  tileAt(s, root)!.discovered = false;
  expect(treeAtPoint(s, x, y)).toBeNull();
  tileAt(s, root)!.discovered = true;
  tileAt(s, root)!.deposit = null;
  expect(treeAtPoint(s, x, y)).toBeNull();
});
it("covers the whole 3x3 canopy, excludes its outside edges and keeps the nearest visible occluder", () => {
  const { s, root } = treeWorld(),
    b = treeBounds(root);
  for (const dx of [0, 31.9, 32, 95.9])
    for (const dy of [0, 63.9, 64, 95.9])
      expect(treeAtPoint(s, b.x + dx, b.y + dy)).toEqual(root);
  expect(treeAtPoint(s, b.x - 0.1, b.y)).toBeNull();
  expect(treeAtPoint(s, b.x + 96, b.y)).toBeNull();
  expect(treeAtPoint(s, b.x, b.y - 0.1)).toBeNull();
  expect(treeAtPoint(s, b.x, b.y + 96)).toBeNull();
  tileAt(s, position(32, 31))!.structure = "wall";
  expect(inspectPoint(s, 32 * 32 + 16, 30 * 32 + 10, false).position).toEqual(
    position(32, 31),
  );
});
it("retains cosmetic variants after save/load and keeps ground food distinct from growing mushrooms", () => {
  const s = createGame("saved-art"),
    copy = decodeSave(encodeSave(s));
  const appearances = (state: typeof s) =>
    state.tiles.map((t, i) =>
      tileScenery(
        seedValue(state.seed),
        t,
        position(i % 64, Math.floor(i / 64)),
      ),
    );
  expect(appearances(copy)).toEqual(appearances(s));
  expect(itemArt("food", "item-123")).toMatch(/^lanterncap-picked-/);
  expect(itemArt("bedkit", "item-123")).toBeNull();
  for (const resource of ["iron", "copper", "gold"] as const)
    expect(itemArt(resource, "item-123")).toMatch(/^item-ore-/);
});

it("culls distant scenery but retains every tree whose canopy reaches the camera", () => {
  const screen = { width: 320, height: 192 },
    map = { width: 64, height: 64 };
  for (const zoom of [0.6, 1, 4])
    for (const centre of [position(0, 0), position(32, 30), position(63, 63)]) {
      const camera = {
        x: -(centre.x * 32 + 16) * zoom,
        y: -(centre.y * 32 + 16) * zoom,
        zoom,
      };
      const v = sceneryViewport(camera, screen, map),
        left = (-screen.width / 2 - camera.x) / zoom,
        right = (screen.width / 2 - camera.x) / zoom,
        top = (-screen.height / 2 - camera.y) / zoom,
        bottom = (screen.height / 2 - camera.y) / zoom;
      for (let y = 0; y < 64; y++)
        for (let x = 0; x < 64; x++) {
          const b = treeBounds(position(x, y));
          if (
            b.x < right &&
            b.x + b.width > left &&
            b.y < bottom &&
            b.y + b.height > top
          ) {
            expect(x).toBeGreaterThanOrEqual(v.minX);
            expect(x).toBeLessThanOrEqual(v.maxX);
            expect(y).toBeGreaterThanOrEqual(v.minY);
            expect(y).toBeLessThanOrEqual(v.maxY);
          }
        }
      expect((v.maxX - v.minX + 1) * (v.maxY - v.minY + 1)).toBeLessThan(4096);
    }
});
