import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import { position, tileAt } from "../src/sim/model";
import { GoblinAnimator } from "../src/render/goblin-animation";
import { facings } from "../src/core/facing";
import {
  contactFrames,
  toolForJob,
  workFrame,
} from "../src/sim/work-animation";
import { encodeSave, decodeSave } from "../src/persistence/save";
import manifest from "../public/assets/goblin/base/manifest.json";
function setup(kind: "dig" | "harvest" = "dig", dx = 1, dy = 0) {
  const s = createGame("tool-strikes");
  s.goblins.slice(1).forEach((g, i) => {
    g.position = position(10 + i, 10);
  });
  const g = s.goblins[0];
  g.position = position(30, 30);
  for (const t of s.tiles) {
    t.solid = false;
    t.discovered = true;
    t.material = "hard";
    t.deposit = null;
    t.feature = null;
    t.structure = null;
    t.stockpile = false;
    t.collapseAt = null;
  }
  const at = position(30 + dx, 30 + dy);
  const target = tileAt(s, at)!;
  target.solid = kind === "dig";
  target.deposit = kind === "harvest" ? "wood" : null;
  target.material = "bedrock";
  s.jobs = [];
  s.items = [];
  dispatch(s, { type: "designate", tool: kind, position: at });
  return { s, g, target, at };
}
it("uses original cardinal contacts, the nine-frame north chop and the supplied static east/west idle", () => {
  expect(manifest.contactFrames).toEqual(contactFrames);
  for (const kind of ["mine", "chop"] as const)
    for (const facing of facings) {
      const count = manifest.directionFrameCounts[kind][facing];
      expect(workFrame(10, contactFrames[kind][facing], count)).toBe(
        contactFrames[kind][facing],
      );
      expect(workFrame(17, contactFrames[kind][facing], count)).toBe(count - 1);
      expect(
        manifest.frames.some(
          (f) =>
            f.id ===
            `${kind}-${facing}-${String(contactFrames[kind][facing]).padStart(3, "0")}`,
        ),
      ).toBe(true);
    }
  expect(manifest.directionFrameCounts.chop.north).toBe(9);
  expect(manifest.directionFrameCounts["axe-idle"].west).toBe(1);
  expect(manifest.directionFrameCounts["axe-idle"].east).toBe(1);
  expect(
    manifest.frames.find((f) => f.id === "axe-idle-west-000")?.source,
  ).toContain("rotations/west.png");
});
it("applies work only at the visible strike, equally in all four directions, independent of rendering", () => {
  for (const [dx, dy, facing] of [
    [1, 0, "east"],
    [-1, 0, "west"],
    [0, -1, "north"],
    [0, 1, "south"],
  ] as const) {
    const { s, g } = setup("dig", dx, dy);
    step(s);
    expect(g.facing).toBe(facing);
    expect(g.workAction).toMatchObject({
      kind: "mine",
      startedAt: 1,
      hit: false,
    });
    for (let n = 0; n < 9; n++) step(s);
    const animator = new GoblinAnimator(),
      before = encodeSave(s);
    for (let n = 0; n < 100; n++)
      animator.sample(
        g.id,
        g.position,
        s.tick,
        n / 100,
        3,
        undefined,
        g.facing,
        { workAction: g.workAction },
      );
    expect(encodeSave(s)).toBe(before);
    expect(s.jobs[0].progress).toBe(0);
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
    expect(pose.frame).toBe(contactFrames.mine[facing]);
    expect(s.jobs[0].progress).toBe(18);
    for (let n = 0; n < 17; n++) step(s);
    expect(s.jobs[0].progress).toBe(18);
    step(s);
    expect(s.jobs[0].progress).toBe(36);
  }
});
it("chops beside a tree and creates a single wood stack on the finishing hit", () => {
  const { s, g, target, at } = setup("harvest", 0, -1);
  step(s);
  expect(toolForJob(s, s.jobs[0])).toBe("axe");
  expect(g.position).toEqual(position(30, 30));
  expect(g.facing).toBe("north");
  for (let n = 0; n < 27; n++) step(s);
  expect(target.deposit).toBe("wood");
  expect(s.items).toHaveLength(0);
  step(s);
  expect(target.deposit).toBeNull();
  expect(s.items).toHaveLength(1);
  expect(s.items[0]).toMatchObject({
    resource: "wood",
    quantity: 5,
    position: at,
  });
  expect(g.workAction?.hit).toBe(true);
  const after = decodeSave(encodeSave(s));
  for (let n = 0; n < 8; n++) {
    step(s);
    step(after);
  }
  expect(s.items).toHaveLength(1);
  expect(s.goblins[0].workAction).toBeNull();
  expect(after).toEqual(s);
});
it("cancelling or urgent hunger interrupts a wind-up without granting work", () => {
  for (const cause of ["cancel", "hunger"] as const) {
    const { s, g, at } = setup();
    step(s);
    for (let n = 0; n < 4; n++) step(s);
    if (cause === "cancel")
      dispatch(s, {
        type: "designate",
        tool: "cancel",
        position: at,
      });
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
    expect(s.items.filter((i) => i.resource !== "food")).toHaveLength(0);
  }
});
it("saves on either side of impact resume deterministically without double hits", () => {
  for (const ticks of [5, 11, 22]) {
    const { s } = setup();
    for (let n = 0; n < ticks; n++) step(s);
    const restored = decodeSave(encodeSave(s));
    for (let n = 0; n < 130; n++) {
      step(s);
      step(restored);
    }
    expect(restored).toEqual(s);
    expect(s.jobs.find((j) => j.kind === "dig")?.status).toBe("done");
    expect(s.items).toHaveLength(1);
  }
});
it("rejects invalid future strikes, inconsistent hit flags and wind-ups without an active job", () => {
  const { s, g } = setup();
  step(s);
  for (const change of [
    () => {
      g.workAction!.startedAt = s.tick + 1;
    },
    () => {
      g.workAction!.hit = true;
    },
    () => {
      g.job = null;
    },
  ]) {
    const restored = structuredClone(s);
    change();
    expect(() => decodeSave(encodeSave(s))).toThrow();
    Object.assign(s, restored);
    Object.assign(g, restored.goblins[0]);
    s.goblins[0] = g;
  }
});
it("migrates the real version-8 active mine without changing progress or identities", () => {
  const raw = JSON.parse(
    gunzipSync(
      readFileSync("tests/fixtures/v8-active-mining.json.gz"),
    ).toString(),
  );
  const s = decodeSave(JSON.stringify(raw));
  expect(s.version).toBe(9);
  expect(s.goblins.every((g) => g.workAction === null)).toBe(true);
  expect(s.jobs).toEqual(raw.jobs);
  expect(s.items).toEqual(raw.items);
  const job = s.jobs.find((j) => j.kind === "dig")!;
  for (let n = 0; n < 250 && job.status !== "done"; n++) step(s);
  expect(job.status).toBe("done");
});
it("selects axe walking, supplied west idle, and base walking for the pick pack without a walk clip", () => {
  const animator = new GoblinAnimator();
  const g = setup().g;
  const sample = (x: number, tick: number, tool: "axe" | "pick") =>
    animator.sample(
      g.id,
      position(x, 30),
      tick,
      0,
      3,
      position(x - 1, 30),
      "west",
      { tool },
    );
  expect(sample(30, 0, "axe").textureId).toBe("axe-idle-west-000");
  expect(sample(29, 3, "axe").textureId).toBe("axe-walk-west-000");
  animator.clear();
  sample(30, 0, "pick");
  expect(sample(29, 3, "pick").textureId).toBe("walk-west-000");
  expect(sample(29, 7, "pick").textureId).toBe("pick-idle-west-000");
});
