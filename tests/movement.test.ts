import { expect, it } from "vitest";
import { createGame, dispatch, step } from "../src/sim/game";
import { type GameState, position, tileAt, walkable } from "../src/sim/model";
import { advance } from "../src/sim/movement";
import { invalidateNavigation } from "../src/sim/navigation";
import { decodeSave, encodeSave } from "../src/persistence/save";
import { snapshotHash } from "../src/core/snapshot";
function corridor() {
  const s = createGame("traffic");
  for (const t of s.tiles) {
    t.solid = true;
    t.feature = null;
    t.structure = null;
    t.discovered = true;
    t.stockpile = false;
    t.material = "hard";
  }
  for (let x = 27; x <= 37; x++) tileAt(s, position(x, 30))!.solid = false;
  s.goblins.forEach((g, i) => {
    g.position = position(27 + i, 30);
  });
  s.items.forEach((i) => {
    i.position = position(27, 30);
  });
  tileAt(s, position(27, 30))!.stockpile = true;
  invalidateNavigation(s);
  return s;
}
function assertOccupancy(s: GameState) {
  expect(
    new Set(s.goblins.map((g) => `${g.position.x},${g.position.y}`)).size,
  ).toBe(s.goblins.length);
  for (const g of s.goblins) expect(walkable(tileAt(s, g.position))).toBe(true);
  for (const item of s.items.filter((i) => i.holder))
    expect(item.position).toEqual(
      s.goblins.find((g) => g.id === item.holder)!.position,
    );
}
it("workers pass an idle entrance queue without overlapping or entering sealed stone", () => {
  const s = corridor(),
    g = s.goblins[0];
  for (let tick = 1; tick <= 80; tick++) {
    s.tick = tick;
    advance(s, g, position(37, 30));
    assertOccupancy(s);
  }
  expect(g.position).toEqual(position(37, 30));
  tileAt(s, position(36, 30))!.solid = true;
  invalidateNavigation(s);
  expect(advance(s, g, position(27, 30))).toBe("blocked");
  expect(g.position).toEqual(position(37, 30));
});
it("uses a free side route around a working goblin and respects movement cooldowns", () => {
  const s = corridor(),
    g = s.goblins[0],
    blocker = s.goblins[1];
  for (let x = 27; x <= 31; x++) tileAt(s, position(x, 29))!.solid = false;
  blocker.activity = "Sleeping";
  s.tick = 1;
  expect(advance(s, g, position(31, 30))).toBe("moved");
  expect(g.position).toEqual(position(27, 29));
  expect(advance(s, g, position(31, 30))).toBe("cooldown");
  s.tick = 3;
  expect(advance(s, g, position(31, 30))).toBe("cooldown");
  s.tick = 4;
  expect(advance(s, g, position(31, 30))).toBe("moved");
  assertOccupancy(s);
});
it("opposing active haulers pass a one-cell tunnel and keep carried items attached", () => {
  const s = corridor();
  s.goblins[0].position = position(30, 30);
  s.goblins[1].position = position(31, 30);
  s.goblins[2].position = position(27, 30);
  s.goblins[3].position = position(37, 30);
  for (const [idx, x] of [
    [0, 35],
    [1, 28],
  ]) {
    tileAt(s, position(x, 30))!.stockpile = true;
    const g = s.goblins[idx],
      item = {
        id: `item-${s.nextId++}` as const,
        resource: "stone" as const,
        quantity: 1,
        position: { ...g.position },
        holder: g.id,
        stored: false,
      };
    s.items.push(item);
    g.carrying = item.id;
    const job = {
      id: `job-${s.nextId++}` as const,
      kind: "haul" as const,
      priority: 2 as const,
      target: position(x, 30),
      item: item.id,
      structure: null,
      worker: g.id,
      status: "active" as const,
      progress: 0,
      reason: "Hauling",
      paid: false,
      paidWithKit: false,
    };
    s.jobs.push(job);
    g.job = job.id;
  }
  for (let tick = 0; tick < 100; tick++) {
    step(s);
    assertOccupancy(s);
  }
  expect(
    s.jobs.filter((j) => j.kind === "haul" && j.status === "done"),
  ).toHaveLength(2);
  expect(s.items.filter((i) => i.resource === "stone" && i.stored).length).toBe(
    3,
  );
});
it("several hauls to one stockpile finish and preserve quantities through save/load", () => {
  const s = createGame("busy-stockpile");
  for (let i = 0; i < 4; i++)
    s.items.push({
      id: `item-${s.nextId++}`,
      resource: "stone",
      quantity: i + 1,
      position: position(28 + i, 29),
      holder: null,
      stored: false,
    });
  let resumed: GameState | null = null;
  for (let i = 0; i < 500; i++) {
    step(s);
    assertOccupancy(s);
    if (i === 15) resumed = decodeSave(encodeSave(s));
    else if (resumed) step(resumed);
  }
  expect(
    s.items
      .filter((i) => i.resource === "stone")
      .reduce((n, i) => n + i.quantity, 0),
  ).toBe(22);
  expect(s.items.every((i) => i.stored && !i.holder)).toBe(true);
  expect(snapshotHash(s)).toBe(snapshotHash(resumed!));
});
it("wall builders work beside the site and never seal themselves inside it", () => {
  const s = createGame("safe-wall");
  dispatch(s, {
    type: "designate",
    tool: "build",
    structure: "wall",
    position: position(30, 30),
  });
  for (let tick = 0; tick < 200; tick++) {
    step(s);
    assertOccupancy(s);
  }
  expect(tileAt(s, position(30, 30))!.structure).toBe("wall");
  expect(() => decodeSave(encodeSave(s))).not.toThrow();
});
it("migrates overlapping legacy actors to nearby free known floor and rejects new overlapping saves", () => {
  const s = createGame("old-stack");
  s.goblins[1].position = { ...s.goblins[0].position };
  s.goblins[0].carrying = s.items[0].id;
  s.items[0].holder = s.goblins[0].id;
  s.items[0].stored = false;
  const old = {
    ...s,
    version: 4,
    goblins: s.goblins.map(({ nextMoveAt, ...g }) => g),
  };
  const a = decodeSave(JSON.stringify(old)),
    b = decodeSave(JSON.stringify(old));
  assertOccupancy(a);
  expect(a).toEqual(b);
  expect(a.goblins.map((g) => g.id)).toEqual(s.goblins.map((g) => g.id));
  expect(() => decodeSave(encodeSave(s))).toThrow("same tile");
});

it("finishes a muddy detour instead of turning back to the cheaper occupied corridor", () => {
  const s = corridor(),
    g = s.goblins[0];
  s.goblins[1].activity = "Sleeping";
  s.goblins[2].position = position(35, 30);
  s.goblins[3].position = position(36, 30);
  for (let x = 27; x <= 30; x++) {
    const t = tileAt(s, position(x, 29))!;
    t.solid = false;
    t.material = "mud";
  }
  invalidateNavigation(s);
  for (let tick = 1; tick <= 80; tick++) {
    s.tick = tick;
    advance(s, g, position(30, 30));
    assertOccupancy(s);
  }
  expect(g.position).toEqual(position(30, 30));
});
