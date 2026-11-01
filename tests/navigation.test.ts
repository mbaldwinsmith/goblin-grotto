import { expect, it } from "vitest";
import { createGame } from "../src/sim/world";
import {
  path,
  invalidateNavigation,
  navigationStats,
} from "../src/sim/navigation";
import { position, tileAt } from "../src/sim/model";
it("prefers a fast route over a shorter muddy route and tolerates occupied cells", () => {
  const s = createGame("routes");
  for (let y = 27; y <= 33; y++)
    for (let x = 27; x <= 35; x++) {
      const t = tileAt(s, position(x, y))!;
      t.solid = y !== 29 && y !== 30;
      t.structure = null;
      t.feature = null;
      t.material = "hard";
      t.discovered = true;
    }
  for (const x of [29, 30, 31, 32, 33])
    tileAt(s, position(x, 30))!.material = "mud";
  const route = path(s, position(28, 30), position(34, 30), false, true)!;
  expect(route.some((p) => p.y === 29)).toBe(true);
  s.goblins[1].position = { ...route[0] };
  expect(path(s, position(28, 30), position(34, 30))).not.toBeNull();
});
it("caches safely and invalidates after a dug shortcut or new obstruction", () => {
  const s = createGame("shortcut");
  for (let y = 27; y <= 33; y++)
    for (let x = 27; x <= 33; x++) {
      const t = tileAt(s, position(x, y))!;
      t.solid = false;
      t.structure = null;
      t.feature = null;
      t.material = "hard";
      t.discovered = true;
    }
  tileAt(s, position(30, 30))!.solid = true;
  const first = path(s, position(29, 30), position(31, 30))!;
  expect(first.length).toBeGreaterThan(2);
  path(s, position(29, 30), position(31, 30));
  expect(navigationStats(s).hits).toBe(1);
  first[0].x = 0;
  expect(path(s, position(29, 30), position(31, 30))![0].x).not.toBe(0);
  tileAt(s, position(30, 30))!.solid = false;
  invalidateNavigation(s);
  expect(path(s, position(29, 30), position(31, 30))).toHaveLength(2);
  tileAt(s, position(30, 30))!.structure = "wall";
  invalidateNavigation(s);
  expect(path(s, position(29, 30), position(31, 30))!.length).toBeGreaterThan(
    2,
  );
});
it("respects fog and bounds cache growth", () => {
  const s = createGame("bounded-routes");
  expect(
    path(s, s.goblins[0].position, position(54, 31), false, true),
  ).toBeNull();
  expect(path(s, s.goblins[0].position, position(54, 31))).not.toBeNull();
  for (let i = 0; i < 300; i++)
    path(s, position(28, 30), position((i % 60) + 1, Math.floor(i / 60) + 1));
  expect(navigationStats(s).entries).toBeLessThanOrEqual(256);
});
