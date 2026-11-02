import { expect, it } from "vitest";
import { cameraFocus, cameraPan, cameraZoom } from "../src/render/camera";
import { inspectPoint, actorDepth, objectDepth } from "../src/render/picking";
import { Interaction } from "../src/app/interaction";
import { createGame } from "../src/sim/world";
import { position, tileAt } from "../src/sim/model";
it("camera bounds, focus and anchor zoom keep the region reachable", () => {
  const camera = { x: 0, y: 0, zoom: 1 },
    map = { width: 64, height: 64 };
  cameraFocus(camera, position(30, 30), map);
  const before = {
    x: (120 - camera.x) / camera.zoom,
    y: (-40 - camera.y) / camera.zoom,
  };
  cameraZoom(camera, 2, map, { x: 120, y: -40 });
  expect((120 - camera.x) / camera.zoom).toBeCloseTo(before.x);
  expect((-40 - camera.y) / camera.zoom).toBeCloseTo(before.y);
  cameraPan(camera, 1e9, -1e9, map);
  expect(camera.x).toBe(0);
  expect(camera.y).toBe(-64 * 48 * 2);
  cameraZoom(camera, 100, map);
  expect(camera.zoom).toBe(4);
  cameraZoom(camera, 0.001, map);
  expect(camera.zoom).toBe(0.6);
  cameraFocus(camera, position(63, 63), map);
  expect(camera.x).toBeLessThan(0);
  expect(camera.y).toBeGreaterThan(-64 * 48 * camera.zoom);
});
it("entity picking uses a logical silhouette, with reveal bypassing foreground walls", () => {
  const s = createGame("selection");
  s.goblins[0].position = position(30, 30);
  for (let i = 1; i < 4; i++) s.goblins[i].position = position(34 + i, 30);
  const x = 30 * 48 + 24,
    y = 30 * 48 + 22.5;
  expect(inspectPoint(s, x, y, false).actor).toBe(s.goblins[0].id);
  tileAt(s, position(30, 31))!.structure = "wall";
  expect(objectDepth(position(30, 31), true)).toBeGreaterThan(
    actorDepth(position(30, 30)),
  );
  expect(inspectPoint(s, x, y, false)).toEqual({
    position: position(30, 31),
    actor: null,
  });
  expect(inspectPoint(s, x, y, true).actor).toBe(s.goblins[0].id);
});
it("paint strokes fill fast drags once per tile and cancel on mode change or pointer loss", () => {
  const input = new Interaction();
  input.select("stockpile");
  expect(input.begin(1, "paint")).toBe(true);
  expect(input.begin(2, "pan")).toBe(false);
  expect(input.paint(position(10, 10))).toHaveLength(1);
  expect(input.paint(position(14, 10))).toHaveLength(4);
  expect(input.paint(position(10, 10))).toHaveLength(0);
  input.end(2);
  expect(input.phase).toBe("paint");
  input.end(1);
  expect(input.paint(position(15, 10))).toEqual([]);
  input.begin(1, "paint");
  input.select("inspect");
  expect(input.phase).toBe("idle");
  expect(input.pointer).toBeNull();
});
it("picks the visible interpolated goblin rather than its future tile", () => {
  const s = createGame("interpolated-pick");
  s.goblins[0].position = position(31, 30);
  for (let i = 1; i < 4; i++) s.goblins[i].position = position(35 + i, 30);
  const rendered = new Map([[s.goblins[0].id, position(30, 30)]]);
  const hit = inspectPoint(s, 30 * 48 + 24, 30 * 48 + 18, true, rendered);
  expect(hit.actor).toBe(s.goblins[0].id);
  expect(hit.position).toEqual(position(31, 30));
});
