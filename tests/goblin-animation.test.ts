import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import manifest from "../public/assets/goblin/base/manifest.json";
import { GoblinAnimator, facingFor } from "../src/render/goblin-animation";
import { position } from "../src/sim/model";
it("maps cardinal facings and retains the last facing at rest", () => {
  const vectors = [
    [0, 1, "south"],
    [1, 1, "south"],
    [1, 0, "east"],
    [1, -1, "north"],
    [0, -1, "north"],
    [-1, -1, "north"],
    [-1, 0, "west"],
    [-1, 1, "south"],
  ] as const;
  for (const [x, y, direction] of vectors)
    expect(facingFor(x, y)).toBe(direction);
  expect(facingFor(0, 0, "west")).toBe("west");
});
it("interpolates movement, continues the full walk cycle across tiles and freezes on the same tick", () => {
  const animator = new GoblinAnimator(),
    id = "goblin-1";
  animator.sample(id, position(0, 0), 0, 0, 3);
  let pose = animator.sample(id, position(1, 0), 3, 0, 3);
  expect(pose.textureId).toBe("walk-east-000");
  pose = animator.sample(id, position(1, 0), 4, 0.5, 3);
  expect(pose.position.x).toBeCloseTo(0.5);
  expect(animator.sample(id, position(1, 0), 4, 0.5, 3)).toEqual(pose);
  const frames = new Set<number>();
  for (let tick = 6; tick <= 24; tick++) {
    const target = position(Math.floor(tick / 3), 0);
    pose = animator.sample(id, target, tick, 0, 3);
    frames.add(pose.frame);
  }
  expect(frames.size).toBe(8);
  pose = animator.sample(id, position(8, 0), 28, 0, 3);
  expect(pose.walking).toBe(false);
  expect(pose.textureId).toBe("idle-east-000");
  expect(pose.position).toEqual(position(8, 0));
});
it("uses work-facing at rest, and resets display history cleanly after load", () => {
  const animator = new GoblinAnimator();
  expect(
    animator.sample("goblin-1", position(30, 30), 10, 0, 3, position(30, 29))
      .textureId,
  ).toBe("idle-north-000");
  animator.sample("goblin-1", position(31, 30), 13, 0, 3);
  animator.clear();
  const restored = animator.sample("goblin-1", position(50, 50), 400, 0, 3);
  expect(restored.position).toEqual(position(50, 50));
  expect(restored.walking).toBe(false);
});
it("keeps every supplied PNG unchanged and aligns padded frames to the same body feet", () => {
  expect(manifest.frames).toHaveLength(359);
  expect(manifest.directions).toHaveLength(4);
  for (const archive of manifest.provenance.archives)
    expect(
      createHash("sha256")
        .update(readFileSync(`public/assets/goblin/${archive.file}`))
        .digest("hex"),
    ).toBe(archive.sha256);
  for (const frame of manifest.frames) {
    const bytes = readFileSync(`public/assets/goblin/base/${frame.file}`);
    expect(createHash("sha256").update(bytes).digest("hex"), frame.id).toBe(
      frame.sha256,
    );
    expect(bytes.readUInt32BE(16)).toBe(frame.width);
    expect(bytes.readUInt32BE(20)).toBe(frame.height);
    expect(frame.footY - (frame.height - 32) / 2).toBe(30);
    expect(frame.footX).toBe(frame.width / 2);
  }
  expect(
    manifest.frames.find((f) => f.id === "walk-west-000")?.source,
  ).toContain("west-6b9bf452");
});
