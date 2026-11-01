import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { gunzipSync } from "node:zlib";
import { createGame, dispatch, step } from "../src/sim/game";
import { position } from "../src/sim/model";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { GoblinAnimator } from "../src/render/goblin-animation";
it("four named common goblins retain identity, kind and facing without a renderer", () => {
  const s = createGame("individuals");
  expect(s.goblins.map((g) => g.name)).toEqual(["Nib", "Moss", "Grub", "Pip"]);
  expect(new Set(s.goblins.map((g) => g.id)).size).toBe(4);
  const identities = s.goblins.map(({ id, name, kind }) => ({
    id,
    name,
    kind,
  }));
  s.goblins[0].facing = "west";
  const loaded = decodeSave(encodeSave(s));
  expect(loaded.goblins[0].facing).toBe("west");
  const animator = new GoblinAnimator();
  const before = encodeSave(loaded);
  expect(
    animator.sample(
      loaded.goblins[0].id,
      loaded.goblins[0].position,
      loaded.tick,
      0,
      3,
      undefined,
      loaded.goblins[0].facing,
    ).textureId,
  ).toBe("idle-west-000");
  animator.clear();
  expect(encodeSave(loaded)).toBe(before);
  for (let i = 0; i < 100; i++) step(loaded);
  expect(
    loaded.goblins.map(({ id, name, kind }) => ({ id, name, kind })),
  ).toEqual(identities);
});
it("walking and adjacent work update authoritative facing", () => {
  const s = createGame("face-work");
  s.goblins = s.goblins.slice(0, 1);
  const g = s.goblins[0];
  g.position = position(30, 30);
  dispatch(s, { type: "designate", tool: "craft", position: position(30, 29) }); // invalid without a workshop
  s.tiles[29 * 64 + 30].structure = "workshop";
  dispatch(s, { type: "designate", tool: "craft", position: position(30, 29) });
  step(s);
  expect(g.facing).toBe("north");
});
it("migrates the committed schema-3 colony with original goblin fields unchanged", () => {
  const text = gunzipSync(
    readFileSync("tests/fixtures/v3-active-colony.json.gz"),
  ).toString();
  const old = JSON.parse(text),
    loaded = decodeSave(text);
  expect(loaded.version).toBe(6);
  expect(
    loaded.goblins.every((g) => g.kind === "common" && g.facing === "south"),
  ).toBe(true);
  expect({
    ...loaded,
    version: 3,
    goblins: loaded.goblins.map(
      ({ kind, facing, nextMoveAt, drop, ...g }) => g,
    ),
  }).toEqual(old);
  const invalid = JSON.parse(encodeSave(loaded));
  invalid.goblins[0].kind = "unknown";
  expect(() => decodeSave(JSON.stringify(invalid))).toThrow("damaged");
});
