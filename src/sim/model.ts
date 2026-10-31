import type { ActorId, ItemId, JobId, EventId, Position } from "../core/types";
export const materials = {
  sand: { hardness: 12, color: 0x796e54, drop: "stone" },
  mud: { hardness: 18, color: 0x4d5444, drop: "stone" },
  loose: { hardness: 24, color: 0x55565d, drop: "stone" },
  hard: { hardness: 50, color: 0x414a53, drop: "stone" },
  bedrock: { hardness: 110, color: 0x303944, drop: "stone" },
  impenetrable: { hardness: Infinity, color: 0x252d39, drop: "stone" },
} as const;
export type Material = keyof typeof materials;
export type Structure = "bed" | "farm" | "workshop" | "door" | "wall";
export type Resource = "stone" | "wood" | "food" | "ore" | "bedkit";
export interface Tile {
  material: Material;
  solid: boolean;
  outside: boolean;
  discovered: boolean;
  deposit: Resource | null;
  structure: Structure | null;
  stockpile: boolean;
  growth: number;
}
export interface Item {
  id: ItemId;
  resource: Resource;
  quantity: number;
  position: Position;
  holder: ActorId | null;
  stored: boolean;
}
export interface Goblin {
  id: ActorId;
  name: string;
  position: Position;
  hunger: number;
  fatigue: number;
  job: JobId | null;
  carrying: ItemId | null;
  activity: string;
  worked: number;
}
export type JobKind = "dig" | "haul" | "build" | "harvest" | "craft";
export interface Job {
  id: JobId;
  kind: JobKind;
  target: Position;
  structure: Structure | null;
  item: ItemId | null;
  worker: ActorId | null;
  progress: number;
  status: "open" | "active" | "done" | "cancelled";
  reason: string;
  paid: boolean;
  paidWithKit: boolean;
}
export interface StoryEvent {
  id: EventId;
  tick: number;
  kind: "world" | "command" | "work" | "need";
  text: string;
  actor: ActorId | null;
}
export interface GameState {
  version: 1;
  seed: string;
  rng: number;
  tick: number;
  nextId: number;
  width: number;
  height: number;
  tiles: Tile[];
  goblins: Goblin[];
  items: Item[];
  jobs: Job[];
  events: StoryEvent[];
}
export type Command =
  | {
      type: "designate";
      tool: JobKind | "stockpile" | "cancel";
      position: Position;
      structure?: Structure;
    }
  | { type: "order"; actor: ActorId; position: Position };
export function tileAt(s: GameState, p: Position): Tile | undefined {
  return p.x >= 0 && p.y >= 0 && p.x < s.width && p.y < s.height
    ? s.tiles[p.y * s.width + p.x]
    : undefined;
}
export function position(x: number, y: number): Position {
  return { x, y, z: 0 };
}
export function same(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y && a.z === b.z;
}
export function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}
export const costs: Record<Structure, Partial<Record<Resource, number>>> = {
  bed: { wood: 2 },
  farm: { stone: 1 },
  workshop: { wood: 3, stone: 2 },
  door: { wood: 2 },
  wall: { stone: 2 },
};
