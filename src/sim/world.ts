import { range, seedValue } from "../core/random";
import { directions } from "../core/types";
import {
  type FeatureKind,
  type GameState,
  type Material,
  position,
  tileAt,
} from "./model";
import { revealFrom } from "./visibility";
import { validateWorld } from "./validation";
export function createGame(seed: string): GameState {
  const s: GameState = {
    version: 5,
    weather: { kind: "clear", changedAt: 0 },
    seed,
    rng: seedValue(seed),
    tick: 0,
    nextId: 1,
    width: 64,
    height: 64,
    tiles: [],
    goblins: [],
    items: [],
    jobs: [],
    events: [],
  };
  const names: Material[] = ["sand", "mud", "loose", "hard", "bedrock"];
  for (let y = 0; y < s.height; y++)
    for (let x = 0; x < s.width; x++) {
      const edge = x === 0 || y === 0 || x === 63 || y === 63;
      const firstRoom = ((x - 30) / 9) ** 2 + ((y - 30) / 7) ** 2 < 1;
      const room =
        firstRoom ||
        ((x - 44) / 6) ** 2 + ((y - 36) / 5) ** 2 < 1 ||
        ((x - 15) / 4) ** 2 + ((y - 19) / 3) ** 2 < 1 ||
        ((x - 17) / 4) ** 2 + ((y - 43) / 3) ** 2 < 1;
      const tunnel = y >= 30 && y <= 32 && x >= 30 && x <= 46;
      const outside = x >= 53;
      const entrance = y >= 29 && y <= 32 && x >= 44;
      s.tiles.push({
        material: edge ? "impenetrable" : names[range(s, 0, 4)],
        solid: edge || !(room || tunnel || outside || entrance),
        outside,
        discovered: firstRoom,
        deposit: null,
        feature: null,
        structure: null,
        stockpile: false,
        growth: 0,
        collapseAt: null,
      });
    }
  // A few seeded irregular alcoves, without compromising the guaranteed start.
  for (let i = 0; i < 12; i++) {
    const x = range(s, 23, 38),
      y = range(s, 25, 35);
    const t = tileAt(s, position(x, y))!;
    t.solid = false;
    t.discovered = directions.some((d) => {
      const n = tileAt(s, position(x + d.x, y + d.y));
      return n?.discovered && !n.solid;
    });
  }
  for (let i = 0; i < 70; i++) {
    const p = position(range(s, 2, 61), range(s, 2, 61));
    const t = tileAt(s, p)!;
    if (t.solid) t.deposit = "ore";
    else if (t.outside) t.deposit = "wood";
  }
  // Reveal the faces of bordering rock so the first excavation is discoverable.
  for (let y = 1; y < 63; y++)
    for (let x = 1; x < 63; x++) {
      const p = position(x, y),
        t = tileAt(s, p)!;
      if (
        t.solid &&
        directions.some((d) => {
          const n = tileAt(s, position(x + d.x, y + d.y));
          return n?.discovered && !n.solid;
        })
      )
        t.discovered = true;
    }
  for (const [i, name] of ["Nib", "Moss", "Grub", "Pip"].entries())
    s.goblins.push({
      id: `goblin-${s.nextId++}`,
      name,
      kind: "common",
      facing: "south",
      nextMoveAt: 0,
      position: position(28 + i, 30),
      hunger: 10 + i * 4,
      fatigue: i * 8,
      job: null,
      carrying: null,
      activity: "Taking in the new home",
      worked: 0,
    });
  for (const [resource, quantity, x, y] of [
    ["food", 28, 29, 32],
    ["wood", 18, 30, 32],
    ["stone", 12, 31, 32],
  ] as const) {
    s.items.push({
      id: `item-${s.nextId++}`,
      resource,
      quantity,
      position: position(x, y),
      holder: null,
      stored: true,
    });
    tileAt(s, position(x, y))!.stockpile = true;
  }
  for (const [x, y] of [
    [27, 28],
    [33, 28],
    [30, 34],
    [54, 32],
    [56, 29],
  ])
    tileAt(s, position(x, y))!.deposit = "food";
  // Seed-selected landmarks, with hidden chambers left for excavation and scouting.
  const near: FeatureKind[] = ["grove", "ruin", "shrine"];
  const far: FeatureKind[] = ["mine", "pond", "den"];
  const sites: [number, number, FeatureKind][] = [
    [26, 27, near[range(s, 0, near.length - 1)]],
    [44, 36, far[range(s, 0, far.length - 1)]],
    [15, 19, "shrine"],
    [17, 43, "ruin"],
  ];
  for (const [x, y, kind] of sites) {
    const t = tileAt(s, position(x, y))!;
    t.solid = false;
    t.feature = kind;
    if (kind === "grove")
      for (const dx of [-1, 1])
        tileAt(s, position(x + dx, y))!.deposit = "food";
    if (kind === "ruin") tileAt(s, position(x + 1, y))!.deposit = "masonry";
  }
  for (let i = 0; i < 60; i++) {
    const p = position(range(s, 54, 61), range(s, 4, 59)),
      t = tileAt(s, p)!;
    if (!t.deposit) t.feature = "undergrowth";
  }
  for (const [x, y, deposit] of [
    [55, 30, "wood"],
    [57, 32, "stone"],
    [54, 32, "food"],
  ] as const)
    tileAt(s, position(x, y))!.deposit = deposit;
  tileAt(s, position(53, 31))!.feature = "entrance";
  tileAt(s, position(61, 31))!.feature = "approach";
  for (const [x, y, deposit] of [
    [26, 21, "iron"],
    [39, 23, "copper"],
    [19, 34, "gold"],
    [46, 44, "gems"],
  ] as const)
    for (let dx = 0; dx < 3; dx++) {
      const t = tileAt(s, position(x + dx, y))!;
      if (t.solid) t.deposit = deposit;
    }
  for (const g of s.goblins) revealFrom(s, g.position);
  const invalid = validateWorld(s);
  if (invalid.length)
    throw new Error(`Invalid world ${seed}: ${invalid.join("; ")}`);
  s.events.push({
    id: `event-${s.nextId++}`,
    tick: 0,
    kind: "world",
    text: "Four goblins. One cave. A suspiciously promising future.",
    actor: null,
  });
  return s;
}
export { path } from "./navigation";
