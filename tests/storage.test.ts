import { legacyTerrain } from "./legacy-terrain";
import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import {
  position,
  tileAt,
  type GameState,
  type Resource,
  type StockpileFilter,
} from "../src/sim/model";
import {
  acceptsStockpile,
  nearestStockpile,
  reconcileStorage,
  inventoryBalances,
  stockpileContents,
} from "../src/sim/storage";
import { invalidateNavigation } from "../src/sim/navigation";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
function colony() {
  const s = createGame("stockpiles");
  for (let y = 26; y <= 35; y++)
    for (let x = 26; x <= 40; x++) {
      const t = tileAt(s, position(x, y))!;
      t.solid = false;
      t.material = "hard";
      t.feature = null;
      t.structure = null;
      t.discovered = true;
      t.stockpile = false;
    }
  reconcileStorage(s);
  invalidateNavigation(s);
  return s;
}
function pile(
  s: GameState,
  x: number,
  y: number,
  filter: StockpileFilter = "all",
  mode: "add" | "remove" = "add",
) {
  expect(
    dispatch(s, {
      type: "designate",
      tool: "stockpile",
      position: position(x, y),
      stockpileFilter: filter,
      stockpileMode: mode,
    }).ok,
  ).toBe(true);
}
function add(
  s: GameState,
  resource: Resource,
  x: number,
  y: number,
  quantity = 3,
) {
  const item = {
    id: `item-${s.nextId++}` as const,
    resource,
    quantity,
    position: position(x, y),
    holder: null,
    stored: false,
  };
  s.items.push(item);
  return item;
}
function balance(s: GameState) {
  const b = inventoryBalances(s);
  for (const r of Object.keys(b.total) as Resource[])
    expect(b.stored[r] + b.carried[r] + b.loose[r]).toBe(b.total[r]);
  for (const i of s.items)
    expect(i.stored).toBe(
      !i.holder && acceptsStockpile(s, i.position, i.resource),
    );
  expect(new Set(s.items.map((i) => i.id)).size).toBe(s.items.length);
}
it("paint is idempotent, filters accept declared goods, and marking beneath supplies stores the same objects", () => {
  const s = colony(),
    food = add(s, "food", 33, 30),
    wood = add(s, "wood", 33, 30);
  pile(s, 33, 30, "food");
  pile(s, 33, 30, "food");
  expect(tileAt(s, food.position)!.stockpile).toBe(true);
  expect(food.stored).toBe(true);
  expect(wood.stored).toBe(false);
  expect(stockpileContents(s, food.position).food).toBe(3);
  expect(s.items.filter((i) => i.id === food.id)).toHaveLength(1);
  pile(s, 34, 30, "valuables");
  expect(acceptsStockpile(s, position(34, 30), "gold")).toBe(true);
  expect(acceptsStockpile(s, position(34, 30), "bedkit")).toBe(false);
  pile(s, 35, 30, "crafted");
  expect(acceptsStockpile(s, position(35, 30), "bedkit")).toBe(true);
  balance(s);
});
it("chooses nearest reachable matching storage instead of the first pile in map order", () => {
  const s = colony(),
    item = add(s, "wood", 34, 30);
  pile(s, 27, 27, "building");
  pile(s, 35, 30, "food");
  pile(s, 36, 30, "building");
  expect(nearestStockpile(s, item)).toEqual(position(36, 30));
  for (const [x, y] of [
    [35, 30],
    [37, 30],
    [36, 29],
    [36, 31],
  ])
    tileAt(s, position(x, y))!.structure = "wall";
  invalidateNavigation(s);
  reconcileStorage(s);
  expect(nearestStockpile(s, item)).toEqual(position(27, 27));
});
it("multiple resources reach their matching stockpiles with inventory quantities intact", () => {
  const s = colony();
  s.items = [];
  const food = add(s, "food", 28, 29, 7),
    wood = add(s, "wood", 29, 29, 5),
    gem = add(s, "gems", 30, 29, 2),
    kit = add(s, "bedkit", 31, 29, 1);
  pile(s, 34, 29, "food");
  pile(s, 34, 30, "building");
  pile(s, 34, 31, "valuables");
  pile(s, 34, 32, "crafted");
  for (let i = 0; i < 600; i++) {
    step(s);
    balance(s);
  }
  for (const [item, y] of [
    [food, 29],
    [wood, 30],
    [gem, 31],
    [kit, 32],
  ] as const) {
    expect(item.position).toEqual(position(34, y));
    expect(item.stored).toBe(true);
    expect(item.holder).toBeNull();
  }
  expect(inventoryBalances(s).total.wood).toBe(5);
  expect(stockpileContents(s, position(34, 31)).gems).toBe(2);
});
it("changing a filter releases excluded stock and rehomes it without cloning or deleting it", () => {
  const s = colony();
  s.items = [];
  const wood = add(s, "wood", 33, 30, 5);
  pile(s, 33, 30, "building");
  pile(s, 36, 30, "building");
  pile(s, 33, 30, "food");
  expect(wood.stored).toBe(false);
  expect(wood.position).toEqual(position(33, 30));
  for (let i = 0; i < 300; i++) step(s);
  expect(wood.position).toEqual(position(36, 30));
  expect(wood.quantity).toBe(5);
  expect(wood.stored).toBe(true);
  balance(s);
});
it("removal during a drop wind-up reroutes the same held item and preserves save continuation", () => {
  const s = colony();
  s.items = [];
  const wood = add(s, "wood", 28, 29, 4);
  pile(s, 33, 30, "building");
  pile(s, 38, 30, "building");
  for (
    let i = 0;
    i < 300 && !s.goblins.some((g) => g.drop?.item === wood.id);
    i++
  )
    step(s);
  const worker = s.goblins.find((g) => g.drop?.item === wood.id)!;
  expect(worker).toBeDefined();
  const old = s.jobs.find((j) => j.id === worker.job)!;
  pile(s, old.target.x, old.target.y, "all", "remove");
  expect(old.target).toEqual(position(38, 30));
  expect(worker.carrying).toBe(wood.id);
  expect(worker.drop).toBeNull();
  const b = decodeSave(encodeSave(s));
  for (let i = 0; i < 350; i++) {
    step(s);
    step(b);
    balance(s);
  }
  expect(wood.stored).toBe(true);
  expect(wood.position).toEqual(position(38, 30));
  expect(snapshotHash(s)).toBe(snapshotHash(b));
});
it("removing the only destination frees the worker and keeps its physical cargo recoverable", () => {
  const s = colony();
  s.items = [];
  const wood = add(s, "wood", 28, 29, 4);
  pile(s, 38, 30, "building");
  for (let i = 0; i < 150 && !wood.holder; i++) step(s);
  const worker = s.goblins.find((g) => g.id === wood.holder)!;
  expect(worker).toBeDefined();
  pile(s, 38, 30, "all", "remove");
  expect(worker.job).toBeNull();
  expect(worker.carrying).toBeNull();
  expect(wood.holder).toBeNull();
  expect(wood.stored).toBe(false);
  expect(() => decodeSave(encodeSave(s))).not.toThrow();
  pile(s, 34, 31, "building");
  for (let i = 0; i < 300; i++) step(s);
  expect(wood.stored).toBe(true);
  expect(wood.position).toEqual(position(34, 31));
  balance(s);
});
it("buildings and collapsed terrain cannot retain spendable stored supplies", () => {
  const s = colony();
  s.items = [];
  const wood = add(s, "wood", 33, 30, 5);
  pile(s, 33, 30, "building");
  tileAt(s, wood.position)!.solid = true;
  invalidateNavigation(s);
  step(s);
  expect(wood.stored).toBe(false);
  expect(tileAt(s, wood.position)!.stockpile).toBe(false);
  expect(wood.quantity).toBe(5);
  balance(s);
});
it("migrates the actual v7 delivery with All goods filters and rejects mismatched new saves", () => {
  const text = gunzipSync(
      readFileSync("tests/fixtures/v7-storage-delivery.json.gz"),
    ).toString(),
    s = decodeSave(text);
  expect(s.version).toBe(10);
  expect({
    ...s,
    version: 7,
    goblins: s.goblins.map(({ workAction, ...g }) => g),
    tiles: s.tiles.map(({ stockpileFilter, ...tile }) => tile),
  }).toEqual(legacyTerrain(JSON.parse(text)));
  const b = decodeSave(encodeSave(s));
  for (let i = 0; i < 250; i++) {
    step(s);
    step(b);
  }
  expect(snapshotHash(s)).toBe(snapshotHash(b));
  const bad = createGame("bad-stored");
  bad.items[0].stored = false;
  expect(() => decodeSave(encodeSave(bad))).toThrow("Stored goods");
  const raw = JSON.parse(encodeSave(s));
  raw.tiles[0].stockpileFilter = "mystery";
  expect(() => decodeSave(JSON.stringify(raw))).toThrow("damaged");
});
it("an unreachable or unsuitable pile leaves supplies loose until a valid destination exists", () => {
  const s = colony();
  s.items = [];
  const item = add(s, "wood", 29, 29);
  pile(s, 35, 30, "food");
  for (let i = 0; i < 50; i++) step(s);
  expect(s.jobs.filter((j) => j.kind === "haul")).toHaveLength(0);
  expect(item.stored).toBe(false);
  pile(s, 35, 30, "building");
  for (let i = 0; i < 300; i++) step(s);
  expect(item.stored).toBe(true);
  balance(s);
});
