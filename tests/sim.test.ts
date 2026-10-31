import { expect, it } from "vitest";
import { createGame, dispatch, step, emit, quantities } from "../src/sim/game";
import { path } from "../src/sim/world";
import { position, tileAt } from "../src/sim/model";
import { snapshotHash } from "../src/core/snapshot";
it("replays commands exactly and rejects illegal actions", () => {
  const a = createGame("spoon"),
    b = createGame("spoon");
  for (const s of [a, b]) {
    expect(
      dispatch(s, { type: "designate", tool: "dig", position: position(0, 0) })
        .ok,
    ).toBe(false);
    dispatch(s, {
      type: "designate",
      tool: "build",
      structure: "farm",
      position: position(30, 29),
    });
    for (let i = 0; i < 1000; i++) step(s);
  }
  expect(snapshotHash(a)).toBe(snapshotHash(b));
  dispatch(b, {
    type: "designate",
    tool: "stockpile",
    position: position(30, 30),
  });
  expect(snapshotHash(a)).not.toBe(snapshotHash(b));
});
it("retains bounded events and rejects unknown references", () => {
  const s = createGame("events");
  for (let i = 0; i < 150; i++) emit(s, "command", "hello");
  expect(s.events).toHaveLength(80);
  expect(() => emit(s, "work", "bad", "goblin-999")).toThrow();
});
it("1000 seeds have a connected safe start, supplies and outdoor route", () => {
  for (let seed = 0; seed < 1000; seed++) {
    const s = createGame(String(seed));
    for (const g of s.goblins)
      expect(
        path(s, g.position, position(54, 31)),
        `seed ${seed}`,
      ).not.toBeNull();
    expect(quantities(s).food).toBeGreaterThan(0);
  }
});
it("autonomous digging, hauling, farming and beds survive days without duplicate holdings", () => {
  const s = createGame("colony");
  for (const [x, y, structure] of [
    [29, 29, "farm"],
    [30, 29, "farm"],
    [31, 29, "bed"],
    [32, 29, "bed"],
  ] as const)
    expect(
      dispatch(s, {
        type: "designate",
        tool: "build",
        structure,
        position: position(x, y),
      }).ok,
    ).toBe(true);
  // Rock directly beside the cavern; pick it from reachable dig targets.
  const p = s.tiles
    .map((_, i) => position(i % 64, Math.floor(i / 64)))
    .find((p) => {
      const t = tileAt(s, p)!;
      return (
        t.solid &&
        t.discovered &&
        t.material !== "impenetrable" &&
        path(s, s.goblins[0].position, p, true) !== null
      );
    })!;
  expect(dispatch(s, { type: "designate", tool: "dig", position: p }).ok).toBe(
    true,
  );
  for (let i = 0; i < 24000; i++) step(s);
  expect(tileAt(s, p)!.solid).toBe(false);
  expect(tileAt(s, position(29, 29))!.structure).toBe("farm");
  for (const g of s.goblins) {
    expect(g.hunger).toBeLessThan(90);
    expect(g.fatigue).toBeLessThan(95);
    expect(g.worked).toBeGreaterThan(0);
  }
  expect(new Set(s.items.map((i) => i.id)).size).toBe(s.items.length);
  for (const i of s.items.filter((i) => i.holder))
    expect(s.goblins.find((g) => g.id === i.holder)?.carrying).toBe(i.id);
  expect(s.items.some((i) => i.stored && i.resource === "stone")).toBe(true);
});
it("cancel refunds paid construction and releases reservations", () => {
  const s = createGame("refund");
  const target = position(30, 29);
  dispatch(s, {
    type: "designate",
    tool: "build",
    structure: "bed",
    position: target,
  });
  for (let i = 0; i < 100; i++) {
    step(s);
    if (s.jobs.some((j) => j.kind === "build" && j.paid)) break;
  }
  expect(quantities(s).wood).toBe(16);
  dispatch(s, { type: "designate", tool: "cancel", position: target });
  expect(quantities(s).wood).toBe(18);
  expect(s.goblins.every((g) => g.job === null)).toBe(true);
});
it("wood can be crafted into a physical kit and used for a bed without duplication", () => {
  const s = createGame("kit");
  tileAt(s, position(30, 29))!.structure = "workshop";
  dispatch(s, { type: "designate", tool: "craft", position: position(30, 29) });
  for (let i = 0; i < 300; i++) step(s);
  expect(quantities(s).bedkit).toBe(1);
  const wood = quantities(s).wood;
  dispatch(s, {
    type: "designate",
    tool: "build",
    structure: "bed",
    position: position(31, 29),
  });
  for (let i = 0; i < 400; i++) step(s);
  expect(tileAt(s, position(31, 29))!.structure).toBe("bed");
  expect(quantities(s).bedkit).toBe(0);
  expect(quantities(s).wood).toBe(wood);
});
