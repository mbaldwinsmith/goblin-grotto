import { expect, it } from "vitest";
import { createGame, dispatch, step } from "../src/sim/game";
import { materials, position, tileAt } from "../src/sim/model";
it("all six storybook materials define digging, support, drops and movement", () => {
  expect(Object.keys(materials)).toHaveLength(6);
  expect(materials.sand.hardness).toBeLessThan(materials.hard.hardness);
  expect(materials.loose.stability).toBeLessThan(materials.bedrock.stability);
  expect(materials.impenetrable.diggable).toBe(false);
  const s = createGame("boundary");
  const t = tileAt(s, position(0, 0))!;
  t.discovered = true;
  expect(
    dispatch(s, { type: "designate", tool: "dig", position: position(0, 0) })
      .ok,
  ).toBe(false);
});
it("autonomous workers take longer to cross mud than hard stone", () => {
  for (const [material, ticks] of [
    ["mud", 6],
    ["hard", 3],
  ] as const) {
    const s = createGame("movement");
    s.goblins = s.goblins.slice(0, 1);
    s.goblins[0].position = position(30, 30);
    for (const t of s.tiles) {
      t.solid = true;
      t.feature = null;
      t.structure = null;
      t.discovered = true;
    }
    for (let x = 30; x <= 32; x++) {
      const t = tileAt(s, position(x, 30))!;
      t.solid = false;
      t.material = material;
    }
    dispatch(s, { type: "designate", tool: "dig", position: position(33, 30) });
    step(s);
    expect(s.goblins[0].position).toEqual(position(31, 30));
    for (let i = 0; i < ticks - 1; i++) step(s);
    expect(s.goblins[0].position).toEqual(position(31, 30));
    step(s);
    expect(s.goblins[0].position).toEqual(position(32, 30));
  }
});
it("mining duration and rubble drops use terrain properties", () => {
  for (const material of ["sand", "bedrock"] as const) {
    const s = createGame("dig-properties");
    s.goblins = s.goblins.slice(0, 1);
    s.goblins[0].position = position(30, 30);
    const target = tileAt(s, position(31, 30))!;
    target.solid = true;
    target.discovered = true;
    target.material = material;
    target.deposit = null;
    dispatch(s, { type: "designate", tool: "dig", position: position(31, 30) });
    const hits = Math.ceil(materials[material].hardness / 18);
    const completionTick = 11 + (hits - 1) * 18;
    for (let i = 0; i < completionTick - 1; i++) step(s);
    expect(target.solid).toBe(true);
    step(s);
    expect(target.solid).toBe(false);
    expect(
      s.items.some(
        (i) =>
          i.resource === materials[material].drop &&
          !i.stored &&
          i.quantity === 2,
      ),
    ).toBe(true);
    expect(s.jobs.find((j) => j.kind === "dig")?.status).toBe("done");
  }
});
