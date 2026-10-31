import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import manifest from "../public/assets/prototype/manifest.json";
it("every floor, wall component, goblin and plant is an independent 32x32 PNG", () => {
  const ids = new Set(manifest.assets.map((asset) => asset.id));
  expect(ids.size).toBe(manifest.assets.length);
  expect(manifest.tileSize).toBe(32);
  for (const material of [
    "sand",
    "mud",
    "loose",
    "hard",
    "bedrock",
    "impenetrable",
  ])
    for (const part of ["floor", "wall-top", "wall-side"])
      expect(ids.has(`${part}-${material}`)).toBe(true);
  for (const name of ["nib", "moss", "grub", "pip"])
    expect(ids.has(`goblin-${name}`)).toBe(true);
  for (const name of [
    "tree",
    "mushroom",
    "grove",
    "undergrowth",
    "farm-young",
    "farm-ripe",
  ])
    expect(ids.has(`plant-${name}`)).toBe(true);
  for (const asset of manifest.assets) {
    const png = readFileSync(`public/assets/prototype/${asset.file}`);
    expect(png.subarray(1, 4).toString()).toBe("PNG");
    expect(png.readUInt32BE(16), asset.id).toBe(32);
    expect(png.readUInt32BE(20), asset.id).toBe(32);
  }
});
