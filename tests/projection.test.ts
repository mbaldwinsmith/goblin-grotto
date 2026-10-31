import { expect, it } from "vitest";
import { project, unproject } from "../src/render/projection";
it("projection round trips tile centres including negative coordinates and zoom", () => {
  for (const x of [-8, 0, 1, 63])
    for (const y of [-12, 0, 3, 63])
      for (const zoom of [0.5, 1, 4]) {
        const screen = project({ x, y, z: 0 });
        const p = unproject(
          (screen.x * zoom) / zoom,
          ((screen.y + 8) * zoom) / zoom,
        );
        expect(p).toEqual({ x, y, z: 0 });
      }
});
it("JRPG cardinal directions stay aligned with the screen axes", () => {
  const p = project({ x: 5, y: 7, z: 0 });
  expect(project({ x: 6, y: 7, z: 0 })).toEqual({ x: p.x + 32, y: p.y });
  expect(project({ x: 5, y: 8, z: 0 })).toEqual({ x: p.x, y: p.y + 32 });
  expect(unproject(p.x - 16, p.y)).toEqual({ x: 5, y: 7, z: 0 });
  expect(unproject(p.x + 15.99, p.y + 31.99)).toEqual({ x: 5, y: 7, z: 0 });
  expect(unproject(p.x + 16, p.y + 32)).toEqual({ x: 6, y: 8, z: 0 });
});
