import { expect, it } from "vitest";
import { random, range, seedValue, weighted } from "../src/core/random";
import { Clock } from "../src/core/clock";
import { snapshotHash } from "../src/core/snapshot";
it("restores the exact RNG stream and supports bounded ranges and weights", () => {
  const a = { rng: seedValue("grotto") };
  for (let i = 0; i < 30; i++) random(a);
  const b = { ...a };
  expect(random(a)).toBe(random(b));
  for (let i = 0; i < 100; i++)
    expect(range(a, 2, 5)).toBeGreaterThanOrEqual(2);
  expect(
    weighted(a, [
      { value: "yes", weight: 1 },
      { value: "no", weight: 0 },
    ]),
  ).toBe("yes");
});
it("clock pauses and caps resume; render rates do not change fixed steps", () => {
  for (const dt of [0.01, 0.02, 0.1]) {
    const c = new Clock();
    let n = 0;
    for (let i = 0; i < Math.round(100 / dt); i++) c.advance(dt, () => n++);
    expect(n).toBeGreaterThanOrEqual(999);
    expect(n).toBeLessThanOrEqual(1000);
  }
  const c = new Clock();
  c.speed = 0;
  expect(c.advance(50, () => {})).toBe(0);
  c.speed = 1;
  expect(c.advance(50, () => {})).toBeLessThanOrEqual(3);
});
it("hashes object keys canonically", () =>
  expect(snapshotHash({ a: 1, b: 2 })).toBe(snapshotHash({ b: 2, a: 1 })));
