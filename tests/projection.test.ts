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
