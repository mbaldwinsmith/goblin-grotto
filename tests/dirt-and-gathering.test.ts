import { expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import { materials, position, tileAt } from "../src/sim/model";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { legacyTerrain } from "./legacy-terrain";
import { GoblinAnimator } from "../src/render/goblin-animation";
import { contactFrames } from "../src/sim/work-animation";
import catalog from "../public/assets/sprite-catalog.json";
it("has five terrain types and only the replacement eight-image dirt wall family", () => {
  expect(Object.keys(materials)).toEqual([
    "dirt",
    "loose",
    "hard",
    "bedrock",
    "impenetrable",
  ]);
  for (let seed = 0; seed < 30; seed++)
    expect(
      createGame(`dirt-${seed}`).tiles.every((t) => t.material in materials),
    ).toBe(true);
  expect(catalog.sprites).toHaveLength(153);
  const dirt = catalog.sprites.filter((f) => f.family === "walls/dirt");
  expect(dirt).toHaveLength(8);
  expect(
    dirt.every(
      (f) => f.id.startsWith("wall-dirt-") && f.width === 32 && f.height === 32,
    ),
  ).toBe(true);
  expect(catalog.sprites.some((f) => /sand|mud/.test(f.file))).toBe(false);
  for (const path of ["walls/mud", "walls/sand", "floors/sandOverlay"])
    expect(existsSync(`public/assets/${path}`)).toBe(false);
});
it("migrates the real schema-9 soft-earth mine by changing only terrain names and version", () => {
  const text = gunzipSync(
      readFileSync("tests/fixtures/v9-soft-earth.json.gz"),
    ).toString(),
    raw = JSON.parse(text),
    s = decodeSave(text);
  expect(
    raw.tiles.some((t: { material: string }) => t.material === "sand"),
  ).toBe(true);
  expect(
    raw.tiles.some((t: { material: string }) => t.material === "mud"),
  ).toBe(true);
  const expected = legacyTerrain(structuredClone(raw));
  expected.version = 10;
  expect(s).toEqual(expected);
  expect(s.goblins.some((g) => g.workAction?.kind === "mine")).toBe(true);
  const copy = decodeSave(encodeSave(s));
  for (let n = 0; n < 100; n++) {
    step(s);
    step(copy);
  }
  expect(s).toEqual(copy);
  expect(s.jobs.find((j) => j.kind === "dig")?.status).toBe("done");
  expect(new Set(s.items.map((i) => i.id)).size).toBe(s.items.length);
});
it("rejects removed terrain in new saves and unknown terrain in legacy saves", () => {
  const s = JSON.parse(encodeSave(createGame("invalid-earth")));
  for (const material of ["sand", "mud", "clay"]) {
    s.tiles[0].material = material;
    expect(() => decodeSave(JSON.stringify(s))).toThrow("damaged");
  }
  s.version = 9;
  s.tiles[0].material = "clay";
  expect(() => decodeSave(JSON.stringify(s))).toThrow("damaged");
});
function plot(farm = false, dx = 1, dy = 0) {
  const s = createGame("mushroom-swings");
  for (const t of s.tiles)
    Object.assign(t, {
      solid: false,
      discovered: true,
      material: "dirt",
      deposit: null,
      feature: null,
      structure: null,
      stockpile: false,
      collapseAt: null,
    });
  s.goblins.forEach((g, i) => {
    g.position = i === 0 ? position(30, 30) : position(10 + i, 10);
  });
  s.items = [];
  s.jobs = [];
  const at = position(30 + dx, 30 + dy),
    tile = tileAt(s, at)!;
  if (farm) {
    tile.structure = "farm";
    tile.growth = 600;
  } else tile.deposit = "food";
  if (farm) s.tick = 9;
  else dispatch(s, { type: "designate", tool: "harvest", position: at });
  return { s, g: s.goblins[0], tile, at };
}
it("gathers wild and farm mushrooms in four directions on contact, creating one food stack", () => {
  for (const farm of [false, true])
    for (const [dx, dy, facing] of [
      [1, 0, "east"],
      [-1, 0, "west"],
      [0, -1, "north"],
      [0, 1, "south"],
    ] as const) {
      const { s, g, tile } = plot(farm, dx, dy);
      step(s);
      expect(g.position).toEqual(position(30, 30));
      expect(g.facing).toBe(facing);
      expect(g.workAction).toMatchObject({
        kind: "gather",
        startedAt: farm ? 10 : 1,
        hit: false,
      });
      for (let n = 0; n < 9; n++) step(s);
      expect(s.jobs[0].progress).toBe(0);
      expect(s.items).toHaveLength(0);
      const animator = new GoblinAnimator(),
        before = encodeSave(s);
      for (let n = 0; n < 20; n++)
        animator.sample(
          g.id,
          g.position,
          s.tick,
          n / 20,
          3,
          undefined,
          g.facing,
          { workAction: g.workAction },
        );
      expect(encodeSave(s)).toBe(before);
      step(s);
      const pose = animator.sample(
        g.id,
        g.position,
        s.tick,
        0,
        3,
        undefined,
        g.facing,
        { workAction: g.workAction },
      );
      expect(pose.textureId).toBe(`gather-${facing}-004`);
      expect(pose.frame).toBe(contactFrames.gather[facing]);
      expect(s.jobs[0].progress).toBe(18);
      for (let n = 0; n < 17; n++) step(s);
      expect(s.items).toHaveLength(0);
      step(s);
      expect(s.items).toHaveLength(1);
      expect(s.items[0]).toMatchObject({
        resource: "food",
        quantity: farm ? 8 : 5,
      });
      if (farm) expect(tile.growth).toBe(0);
      else expect(tile.deposit).toBeNull();
      for (let n = 0; n < 8; n++) step(s);
      expect(g.workAction).toBeNull();
      expect(s.items).toHaveLength(1);
    }
});
it("preserves gathering wind-up, impact and recovery across saves without replaying picks", () => {
  for (const ticks of [5, 11, 29]) {
    const { s } = plot();
    for (let n = 0; n < ticks; n++) step(s);
    const copy = decodeSave(encodeSave(s));
    for (let n = 0; n < 50; n++) {
      step(s);
      step(copy);
    }
    expect(copy).toEqual(s);
    expect(s.items).toHaveLength(1);
    expect(s.items[0].quantity).toBe(5);
  }
});
it("cancellation and urgent eating interrupt picking before contact without harvesting", () => {
  for (const reason of ["cancel", "hunger"]) {
    const { s, g, at, tile } = plot();
    for (let n = 0; n < 5; n++) step(s);
    if (reason === "cancel")
      dispatch(s, { type: "designate", tool: "cancel", position: at });
    else {
      g.hunger = 100;
      s.items.push({
        id: `item-${s.nextId++}`,
        resource: "food",
        quantity: 5,
        position: position(29, 30),
        holder: null,
        stored: false,
      });
    }
    step(s);
    expect(g.workAction).toBeNull();
    expect(s.jobs[0].progress).toBe(0);
    expect(tile.deposit).toBe("food");
  }
});
