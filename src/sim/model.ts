import type { Facing } from "../core/facing";
import { features, type Deposit, type FeatureKind } from "./content";
export { resources, deposits, features } from "./content";
export type { Resource, Deposit, FeatureKind } from "./content";
import type { Resource, StockpileFilter } from "./content";
export { stockpileFilters, stockpileFilterKinds } from "./content";
export type { StockpileFilter } from "./content";
import type { ActorId, ItemId, JobId, EventId, Position } from "../core/types";
export const materials = {
  sand: {
    label: "Sand",
    hardness: 12,
    stability: 1,
    moveTicks: 4,
    color: 0x796e54,
    drop: "stone",
    diggable: true,
  },
  mud: {
    label: "Mud",
    hardness: 18,
    stability: 2,
    moveTicks: 6,
    color: 0x4d5444,
    drop: "stone",
    diggable: true,
  },
  loose: {
    label: "Loose rock",
    hardness: 24,
    stability: 2,
    moveTicks: 4,
    color: 0x55565d,
    drop: "stone",
    diggable: true,
  },
  hard: {
    label: "Hard stone",
    hardness: 50,
    stability: 5,
    moveTicks: 3,
    color: 0x414a53,
    drop: "stone",
    diggable: true,
  },
  bedrock: {
    label: "Bedrock",
    hardness: 110,
    stability: 8,
    moveTicks: 3,
    color: 0x303944,
    drop: "stone",
    diggable: true,
  },
  impenetrable: {
    label: "Impenetrable stone",
    hardness: Infinity,
    stability: 10,
    moveTicks: 3,
    color: 0x252d39,
    drop: "stone",
    diggable: false,
  },
} as const;
export type Material = keyof typeof materials;
export type Structure =
  | "bed"
  | "farm"
  | "workshop"
  | "door"
  | "wall"
  | "support";
export interface Tile {
  material: Material;
  solid: boolean;
  outside: boolean;
  discovered: boolean;
  deposit: Deposit | null;
  feature: FeatureKind | null;
  structure: Structure | null;
  stockpile: boolean;
  stockpileFilter: StockpileFilter;
  growth: number;
  collapseAt: number | null;
}
export interface Item {
  id: ItemId;
  resource: Resource;
  quantity: number;
  position: Position;
  holder: ActorId | null;
  stored: boolean;
}
export const goblinKinds = { common: { label: "Common goblin" } } as const;
export interface Goblin {
  id: ActorId;
  name: string;
  kind: keyof typeof goblinKinds;
  facing: Facing;
  nextMoveAt: number;
  workAction: { kind: "mine" | "chop"; startedAt: number; hit: boolean } | null;
  drop: { item: ItemId; startedAt: number; store: boolean } | null;
  position: Position;
  hunger: number;
  fatigue: number;
  job: JobId | null;
  carrying: ItemId | null;
  activity: string;
  worked: number;
  preferredWork: JobKind | null;
}
export const jobKinds = [
  "dig",
  "haul",
  "build",
  "harvest",
  "craft",
  "explore",
] as const;
export type JobKind = (typeof jobKinds)[number];
export const jobPriorities = [1, 2, 3] as const;
export type JobPriority = (typeof jobPriorities)[number];
export interface Job {
  id: JobId;
  kind: JobKind;
  priority: JobPriority;
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
  version: 9;
  weather: { kind: "clear" | "rain" | "snow"; changedAt: number };
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
      priority?: JobPriority;
      stockpileFilter?: StockpileFilter;
      stockpileMode?: "add" | "remove";
    }
  | { type: "order"; actor: ActorId; position: Position }
  | { type: "prioritize"; position: Position; priority: JobPriority }
  | { type: "preference"; actor: ActorId; work: JobKind | null };
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
  support: { wood: 1, stone: 1 },
};

export function walkable(t: Tile | undefined): boolean {
  return (
    !!t &&
    !t.solid &&
    t.structure !== "wall" &&
    (!t.feature || features[t.feature].walkable)
  );
}
export function buildable(t: Tile): boolean {
  return (
    walkable(t) && !t.structure && (!t.feature || features[t.feature].buildable)
  );
}
