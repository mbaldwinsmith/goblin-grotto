import catalog from "../../public/assets/sprite-catalog.json";
import type { Position } from "../core/types";
import { seedValue } from "../core/random";
import { tileAt, type GameState, type Tile, type Resource } from "../sim/model";
import { project } from "./projection";
import { TILE_SIZE, HALF_TILE, ACTOR_FEET } from "./metrics";
export const sceneryFrames = new Map(catalog.sprites.map((s) => [s.id, s]));
const families = new Map<string, typeof catalog.sprites>();
for (const frame of catalog.sprites) {
  const group = families.get(frame.family) ?? [];
  group.push(frame);
  families.set(frame.family, group);
}
/** Cosmetic hash only: never consumes the simulation's random stream. */
export function visualHash(seed: number, p: Position, salt = 0): number {
  let n = seed ^ Math.imul(p.x, 374761393) ^ Math.imul(p.y, 668265263) ^ salt;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return (n ^ (n >>> 16)) >>> 0;
}
function variant(family: string, key: number): string {
  const frames = families.get(family);
  if (!frames?.length) throw Error(`Missing scenery family: ${family}`);
  return frames[key % frames.length].id;
}
const floorFamilies: Partial<Record<Tile["material"], string>> = {
  sand: "sandOverlay",
  loose: "roughstone",
  hard: "smoothstone",
  bedrock: "bedrock",
} as const;
const wallFamilies: Partial<Record<Tile["material"], string>> = {
  sand: "sand",
  mud: "mud",
  loose: "roughstone",
  hard: "smoothstone",
  bedrock: "bedrock",
} as const;
// Curated by the supplied images, not filename order: each stage has two alternatives.
export const farmStages = {
  young: ["lanterncap-farm-01", "lanterncap-farm-04"],
  growing: ["lanterncap-farm-03", "lanterncap-farm-05"],
  ripe: ["lanterncap-farm-02", "lanterncap-farm-06"],
} as const;
export function farmArt(growth: number, key: number): string {
  const stage = growth >= 600 ? "ripe" : growth >= 200 ? "growing" : "young";
  return farmStages[stage][key % 2];
}
export function tileScenery(seed: number, t: Tile, p: Position) {
  const key = visualHash(seed, p),
    material = t.structure === "wall" ? "hard" : t.material;
  const floorFor = (mat: Tile["material"], salt: number) => {
    const family = floorFamilies[mat];
    return family
      ? variant(`floors/${family}`, visualHash(seed, p, salt))
      : `floor-${mat}`;
  };
  const floor =
    t.feature === "ruin"
      ? variant("floors/dwarvenstone", key)
      : t.outside
        ? "floor-grass"
        : floorFor(t.material, 0);
  const sideFamily = wallFamilies[material];
  const side = sideFamily
    ? variant(`walls/${sideFamily}`, key)
    : `wall-side-${material}`;
  const top =
    material === "mud" || material === "impenetrable"
      ? `wall-top-${material}`
      : t.structure === "wall"
        ? variant("floors/dwarvenstone", key)
        : floorFor(material, 15485863);
  let plant: string | null = null;
  if (!t.solid) {
    if (t.structure === "farm") plant = farmArt(t.growth, key);
    else if (t.deposit === "wood") plant = variant("foliage/trees", key);
    else if (t.deposit === "food" || t.feature === "grove")
      plant = variant("foliage/lanterncaps/wild", key);
    else if (t.feature === "undergrowth") {
      const family = ["undergrowth", "logconks", "redcaps"][key % 3];
      plant = variant(`foliage/${family}`, visualHash(seed, p, 32452843));
    }
  }
  return { floor, top, side, plant };
}
export function itemArt(resource: Resource, identity: string): string | null {
  const family =
    resource === "food"
      ? "foliage/lanterncaps/picked"
      : resource === "bedkit"
        ? null
        : `items/${["iron", "copper", "gold"].includes(resource) ? "ore" : resource}`;
  return family ? variant(family, seedValue(identity)) : null;
}
/** The image's [32,64]..[64,96] square coincides exactly with its logical tile. */
export function treeBounds(p: Position) {
  const a = project(p);
  return {
    x: a.x - TILE_SIZE * 1.5,
    y: a.y - TILE_SIZE * 2,
    width: TILE_SIZE * 3,
    height: TILE_SIZE * 3,
  };
}
export function treeOverlapsActor(tree: Position, actor: Position): boolean {
  const b = treeBounds(tree),
    a = project(actor);
  return (
    a.x + HALF_TILE > b.x &&
    a.x - HALF_TILE < b.x + b.width &&
    a.y + ACTOR_FEET > b.y &&
    a.y + ACTOR_FEET - TILE_SIZE < b.y + b.height
  );
}
export function treeAtPoint(
  s: GameState,
  x: number,
  y: number,
): Position | null {
  const col = Math.floor(x / TILE_SIZE),
    row = Math.floor(y / TILE_SIZE);
  const trees: Position[] = [];
  for (let ty = Math.max(0, row); ty <= Math.min(s.height - 1, row + 2); ty++)
    for (
      let tx = Math.max(0, col - 1);
      tx <= Math.min(s.width - 1, col + 1);
      tx++
    ) {
      const p = { x: tx, y: ty, z: 0 as const },
        t = tileAt(s, p);
      if (
        t?.discovered &&
        !t.solid &&
        t.structure !== "farm" &&
        t.deposit === "wood"
      )
        trees.push(p);
    }
  return trees.sort((a, b) => b.y - a.y || b.x - a.x)[0] ?? null;
}
