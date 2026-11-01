import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import { position, type GameState } from "../src/sim/model";
import {
  beginDrop,
  updateDrop,
  interruptDrop,
  DROP_RELEASE_TICKS,
  DROP_DURATION_TICKS,
  DROP_FRAME_COUNT,
  DROP_RELEASE_FRAME,
} from "../src/sim/hauling";
import { GoblinAnimator } from "../src/render/goblin-animation";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
import manifest from "../public/assets/goblin/base/manifest.json";
function carrying() {
  const s = createGame("drop-test"),
    g = s.goblins[0];
  g.position = position(29, 32);
  const item = {
    id: `item-${s.nextId++}` as const,
    resource: "stone" as const,
    quantity: 3,
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
    target: { ...g.position },
    item: item.id,
    structure: null,
    worker: g.id,
    status: "active" as const,
    progress: 0,
    reason: "Hauling",
    paid: false,
    paidWithKit: false,
  };
  s.jobs.push(job);
  g.job = job.id;
  return { s, g, item, job };
}
it("idle, loaded idle and loaded walking use the supplied cardinal cycles and pause on unchanged ticks", () => {
  const animator = new GoblinAnimator(),
    p = position(30, 30);
  let pose = animator.sample("goblin-1", p, 0, 0, 3);
  expect(pose.textureId).toBe("idle-south-000");
  pose = animator.sample("goblin-1", p, 2, 0, 3);
  expect(pose.textureId).toBe("idle-south-001");
  const frozen = animator.sample("goblin-1", p, 2, 0, 3);
  expect(frozen).toEqual(pose);
  pose = animator.sample("goblin-1", p, 3, 0, 3, undefined, "south", {
    carrying: true,
  });
  expect(pose.textureId).toBe("haul-idle-south-000");
  pose = animator.sample(
    "goblin-1",
    position(31, 30),
    4,
    0,
    3,
    undefined,
    "east",
    { carrying: true },
  );
  expect(pose.textureId).toBe("haul-walk-east-000");
});
it("the nine-frame drop releases the same item once on frame five, completing work before follow-through ends", () => {
  const { s, g, item, job } = carrying();
  beginDrop(s, g);
  const animator = new GoblinAnimator();
  expect(manifest.clips.drop).toBe(DROP_FRAME_COUNT);
  expect(manifest.dropReleaseFrame).toBe(DROP_RELEASE_FRAME);
  for (let tick = 0; tick < DROP_DURATION_TICKS; tick++) {
    s.tick = tick;
    expect(updateDrop(s, g)).toBe(true);
    const pose = animator.sample(
      g.id,
      g.position,
      tick,
      0,
      3,
      undefined,
      g.facing,
      { carrying: !!g.carrying, drop: g.drop },
    );
    expect(pose.frame).toBe(Math.floor(tick / 2));
    if (tick < DROP_RELEASE_TICKS) {
      expect(item.holder).toBe(g.id);
      expect(item.stored).toBe(false);
      expect(job.status).toBe("active");
    } else {
      expect(item.holder).toBeNull();
      expect(item.stored).toBe(true);
      expect(job.status).toBe("done");
    }
  }
  s.tick = DROP_DURATION_TICKS;
  expect(updateDrop(s, g)).toBe(false);
  expect(g.drop).toBeNull();
  expect(g.carrying).toBeNull();
  expect(s.items.filter((i) => i.id === item.id)).toHaveLength(1);
  expect(s.events.filter((e) => e.text.includes("puts down"))).toHaveLength(1);
});
it("render sampling cannot release an item or advance work", () => {
  const { s, g, item } = carrying();
  beginDrop(s, g);
  const before = encodeSave(s),
    animator = new GoblinAnimator();
  for (let i = 0; i < 500; i++)
    animator.sample(g.id, g.position, s.tick, i / 500, 3, undefined, g.facing, {
      carrying: true,
      drop: g.drop,
    });
  expect(encodeSave(s)).toBe(before);
  expect(item.holder).toBe(g.id);
});
it("save/load before and after the release preserves exact continuation", () => {
  for (const ticks of [4, 12]) {
    const { s, g } = carrying();
    beginDrop(s, g);
    for (let i = 0; i < ticks; i++) step(s);
    const loaded = decodeSave(encodeSave(s));
    for (let i = 0; i < 100; i++) {
      step(s);
      step(loaded);
    }
    expect(snapshotHash(s)).toBe(snapshotHash(loaded));
  }
});
it("cancel and urgent interruption immediately free the item and show the release tail", () => {
  const { s, g, item, job } = carrying();
  beginDrop(s, g);
  s.tick = 3;
  expect(
    dispatch(s, { type: "designate", tool: "cancel", position: job.target }).ok,
  ).toBe(true);
  expect(item.holder).toBeNull();
  expect(item.stored).toBe(true); // It is already on an accepting pile.
  expect(g.job).toBeNull();
  expect(g.drop?.store).toBe(false);
  const animator = new GoblinAnimator();
  expect(
    animator.sample(g.id, g.position, s.tick, 0, 3, undefined, g.facing, {
      drop: g.drop,
    }).frame,
  ).toBe(DROP_RELEASE_FRAME);
  expect(() => decodeSave(encodeSave(s))).not.toThrow();
  const second = carrying();
  interruptDrop(second.s, second.g);
  expect(second.item.holder).toBeNull();
  expect(() => decodeSave(encodeSave(second.s))).not.toThrow();
});
it("migrates an actual schema-5 active haul and maps diagonal facing to a cardinal direction", () => {
  const text = gunzipSync(
    readFileSync("tests/fixtures/v5-active-haul.json.gz"),
  ).toString();
  const old = JSON.parse(text),
    s = decodeSave(text);
  expect(s.version).toBe(9);
  const worker = s.goblins.find((g) => g.carrying)!;
  expect(worker.facing).toBe("north");
  expect(worker.drop).toBeNull();
  expect({
    ...s,
    version: 5,
    tiles: s.tiles.map(({ stockpileFilter, ...tile }) => tile),
    jobs: s.jobs.map(({ priority, ...job }) => job),
    goblins: s.goblins.map(({ drop, preferredWork, workAction, ...g }) => ({
      ...g,
      facing: old.goblins.find((o: { id: string }) => o.id === g.id).facing,
    })),
  }).toEqual(old);
  for (let i = 0; i < 250; i++) step(s);
  expect(s.jobs.some((j) => j.kind === "haul" && j.status === "done")).toBe(
    true,
  );
  expect(() => decodeSave(encodeSave(s))).not.toThrow();
});
it("rejects invalid cardinal directions and missing pending-drop items", () => {
  const { s, g } = carrying();
  beginDrop(s, g);
  const bad: GameState = structuredClone(s);
  bad.goblins[0].carrying = null;
  expect(() => decodeSave(encodeSave(bad))).toThrow("pending drop");
  const raw = JSON.parse(encodeSave(s));
  raw.goblins[0].facing = "north-east";
  expect(() => decodeSave(JSON.stringify(raw))).toThrow("damaged");
});
