import { expect, it } from "vitest";
import { createGame, dispatch, step } from "../src/sim/game";
import { position } from "../src/sim/model";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
it("round-trips active work and continues exactly", () => {
  const a = createGame("roundtrip");
  dispatch(a, {
    type: "designate",
    tool: "build",
    structure: "farm",
    position: position(30, 29),
  });
  for (let i = 0; i < 20; i++) step(a);
  const b = decodeSave(encodeSave(a));
  expect(b).toEqual(a);
  for (let i = 0; i < 2000; i++) {
    step(a);
    step(b);
  }
  expect(snapshotHash(a)).toBe(snapshotHash(b));
});
it("rejects malformed data, dangling references, ID collisions and future saves", () => {
  const s = createGame("bad");
  for (const mutate of [
    (s: ReturnType<typeof createGame>) => {
      s.version = 999 as 4;
    },
    (s: ReturnType<typeof createGame>) => {
      s.goblins[0].carrying = "item-999";
    },
    (s: ReturnType<typeof createGame>) => {
      s.goblins[1].id = s.goblins[0].id;
    },
  ]) {
    const b = structuredClone(s);
    mutate(b);
    expect(() => decodeSave(encodeSave(b))).toThrow();
  }
  expect(() => decodeSave("{")).toThrow();
});
it("multiple colony seeds survive and validate every save checkpoint", () => {
  for (const seed of ["moss", "spoon", "rock"]) {
    const s = createGame(seed);
    for (const x of [29, 30])
      dispatch(s, {
        type: "designate",
        tool: "build",
        structure: "farm",
        position: position(x, 29),
      });
    for (let i = 0; i < 16000; i++) {
      step(s);
      if (i % 200 === 0)
        expect(
          () => decodeSave(encodeSave(s)),
          `${seed} at ${i}`,
        ).not.toThrow();
    }
    for (const g of s.goblins) expect(g.hunger).toBeLessThan(90);
  }
}, 20_000);
