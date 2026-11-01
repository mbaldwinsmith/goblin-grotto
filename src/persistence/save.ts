import {
  dropElapsed,
  DROP_RELEASE_TICKS,
  DROP_DURATION_TICKS,
} from "../sim/hauling";
import { separateLegacyGoblins } from "./occupancy-migration";
import { walkable, tileAt } from "../sim/model";
import { facings } from "../core/facing";
import { z } from "zod";
import type { ActorId, ItemId, JobId, EventId } from "../core/types";
import { resourceKinds, depositKinds, featureKinds } from "../sim/content";
import { jobKinds } from "../sim/model";
import type { GameState } from "../sim/model";
const actor = z.custom<ActorId>(
  (v) => typeof v === "string" && /^goblin-\d+$/.test(v),
);
const itemId = z.custom<ItemId>(
  (v) => typeof v === "string" && /^item-\d+$/.test(v),
);
const jobId = z.custom<JobId>(
  (v) => typeof v === "string" && /^job-\d+$/.test(v),
);
const eventId = z.custom<EventId>(
  (v) => typeof v === "string" && /^event-\d+$/.test(v),
);
const natural = z.number().int().min(0).max(1e10);
const p = z.object({
  x: z.number().int().min(0).max(63),
  y: z.number().int().min(0).max(63),
  z: z.literal(0),
});
const resource = z.enum(resourceKinds);
const structure = z.enum([
  "bed",
  "farm",
  "workshop",
  "door",
  "wall",
  "support",
]);
const schema: z.ZodType<GameState> = z.object({
  version: z.literal(7),
  weather: z.object({
    kind: z.enum(["clear", "rain", "snow"]),
    changedAt: natural,
  }),
  seed: z.string().max(100),
  rng: natural.min(1).max(4294967295),
  tick: natural,
  nextId: natural.min(1),
  width: z.literal(64),
  height: z.literal(64),
  tiles: z
    .array(
      z.object({
        material: z.enum([
          "sand",
          "mud",
          "loose",
          "hard",
          "bedrock",
          "impenetrable",
        ]),
        solid: z.boolean(),
        outside: z.boolean(),
        discovered: z.boolean(),
        deposit: z.enum(depositKinds).nullable(),
        feature: z.enum(featureKinds).nullable(),
        structure: structure.nullable(),
        stockpile: z.boolean(),
        growth: natural.max(600),
        collapseAt: natural.nullable(),
      }),
    )
    .length(4096),
  goblins: z
    .array(
      z.object({
        id: actor,
        name: z.string().max(40),
        kind: z.literal("common"),
        facing: z.enum(facings),
        nextMoveAt: natural,
        drop: z
          .object({ item: itemId, startedAt: natural, store: z.boolean() })
          .nullable(),
        position: p,
        hunger: z.number().min(0).max(100),
        fatigue: z.number().min(0).max(100),
        job: jobId.nullable(),
        carrying: itemId.nullable(),
        activity: z.string().max(200),
        worked: natural,
        preferredWork: z.enum(jobKinds).nullable(),
      }),
    )
    .length(4),
  items: z
    .array(
      z.object({
        id: itemId,
        resource,
        quantity: natural.min(1),
        position: p,
        holder: actor.nullable(),
        stored: z.boolean(),
      }),
    )
    .max(20000),
  jobs: z
    .array(
      z.object({
        id: jobId,
        kind: z.enum(["dig", "haul", "build", "harvest", "craft", "explore"]),
        target: p,
        structure: structure.nullable(),
        item: itemId.nullable(),
        worker: actor.nullable(),
        priority: z.union([z.literal(1), z.literal(2), z.literal(3)]),
        progress: natural,
        status: z.enum(["open", "active", "done", "cancelled"]),
        reason: z.string().max(200),
        paid: z.boolean(),
        paidWithKit: z.boolean(),
      }),
    )
    .max(10000),
  events: z
    .array(
      z.object({
        id: eventId,
        tick: natural,
        kind: z.enum(["world", "command", "work", "need"]),
        text: z.string().max(500),
        actor: actor.nullable(),
      }),
    )
    .max(80),
});
export function decodeSave(text: string): GameState {
  if (text.length > 8_000_000)
    throw new Error("Save exceeds the 8 MB prototype limit.");
  let raw: unknown = JSON.parse(text);
  const migrateOccupancy = z
    .object({ version: z.number().int().min(1).max(4) })
    .safeParse(raw).success;
  const legacy = z
    .object({
      version: z.literal(1),
      tiles: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  if (legacy.success)
    raw = {
      ...legacy.data,
      version: 2,
      tiles: legacy.data.tiles.map((tile) => ({ ...tile, feature: null })),
    };
  const previous = z
    .object({
      version: z.literal(2),
      tiles: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  if (previous.success)
    raw = {
      ...previous.data,
      version: 3,
      weather: { kind: "clear", changedAt: 0 },
      tiles: previous.data.tiles.map((tile) => ({ ...tile, collapseAt: null })),
    };
  const third = z
    .object({
      version: z.literal(3),
      goblins: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  if (third.success)
    raw = {
      ...third.data,
      version: 4,
      goblins: third.data.goblins.map((g) => ({
        ...g,
        kind: "common",
        facing: "south",
      })),
    };
  const fourth = z
    .object({
      version: z.literal(4),
      goblins: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  if (fourth.success)
    raw = {
      ...fourth.data,
      version: 5,
      goblins: fourth.data.goblins.map((g) => ({ ...g, nextMoveAt: 0 })),
    };
  const fifth = z
    .object({
      version: z.literal(5),
      goblins: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  const oldFacings = z.enum([
    "south",
    "south-east",
    "east",
    "north-east",
    "north",
    "north-west",
    "west",
    "south-west",
  ]);
  const cardinal = {
    south: "south",
    "south-east": "south",
    east: "east",
    "north-east": "north",
    north: "north",
    "north-west": "north",
    west: "west",
    "south-west": "south",
  } as const;
  if (fifth.success)
    raw = {
      ...fifth.data,
      version: 6,
      goblins: fifth.data.goblins.map((g) => {
        const direction = oldFacings.safeParse(g.facing);
        return {
          ...g,
          drop: null,
          facing: direction.success ? cardinal[direction.data] : g.facing,
        };
      }),
    };
  const sixth = z
    .object({
      version: z.literal(6),
      goblins: z.array(z.record(z.string(), z.unknown())),
      jobs: z.array(z.record(z.string(), z.unknown())),
    })
    .passthrough()
    .safeParse(raw);
  if (sixth.success)
    raw = {
      ...sixth.data,
      version: 7,
      goblins: sixth.data.goblins.map((g) => ({ ...g, preferredWork: null })),
      jobs: sixth.data.jobs.map((j) => ({ ...j, priority: 2 })),
    };
  const result = schema.safeParse(raw);
  if (!result.success)
    throw new Error(
      "Unsupported or damaged save. Supported Goblin Grotto saves: versions 1, 2, 3, 4, 5, 6 and 7.",
    );
  const s = result.data;
  if (s.weather.changedAt > s.tick)
    throw new Error("Weather timestamp is in the future.");
  const all = [...s.goblins, ...s.items, ...s.jobs, ...s.events];
  const ids = all.map((e) => e.id);
  if (
    new Set(ids).size !== ids.length ||
    all.some((e) => Number(e.id.split("-")[1]) >= s.nextId)
  )
    throw new Error("Save contains conflicting IDs.");
  if (migrateOccupancy) {
    if (s.goblins.some((g) => tileAt(s, g.position)?.solid))
      throw new Error("Goblin inside stone.");
    separateLegacyGoblins(s);
  }
  const occupied = new Set<number>();
  for (const g of s.goblins) {
    const cell = g.position.y * s.width + g.position.x;
    if (occupied.has(cell))
      throw new Error("Two goblins occupy the same tile.");
    occupied.add(cell);
    if (!walkable(tileAt(s, g.position)))
      throw new Error("Goblin inside blocked terrain.");
    if (g.drop) {
      const elapsed = dropElapsed(s.tick, g.drop);
      if (g.drop.startedAt > s.tick || elapsed >= DROP_DURATION_TICKS)
        throw new Error("Invalid drop animation timestamp.");
      if (
        elapsed < DROP_RELEASE_TICKS &&
        (g.carrying !== g.drop.item ||
          !s.items.some((i) => i.id === g.drop!.item && i.holder === g.id))
      )
        throw new Error("Missing item for pending drop.");
      if (elapsed >= DROP_RELEASE_TICKS && g.carrying)
        throw new Error("Released drop still has a carried item.");
    }
    if (g.nextMoveAt > s.tick + 8)
      throw new Error("Goblin movement timestamp is too far in the future.");
    if (s.tiles[g.position.y * 64 + g.position.x].solid)
      throw new Error("Goblin inside stone.");
    if (
      g.job &&
      !s.jobs.some(
        (j) => j.id === g.job && j.worker === g.id && j.status === "active",
      )
    )
      throw new Error("Broken work reservation.");
    if (
      g.carrying &&
      !s.items.some((i) => i.id === g.carrying && i.holder === g.id)
    )
      throw new Error("Broken item holder.");
  }
  for (const i of s.items)
    if (
      i.holder &&
      (!s.goblins.some((g) => g.id === i.holder && g.carrying === i.id) ||
        i.stored)
    )
      throw new Error("Broken held item.");
  for (const j of s.jobs) {
    if (j.worker && !s.goblins.some((g) => g.id === j.worker && g.job === j.id))
      throw new Error("Broken worker reference.");
    if (j.kind === "build" && !j.structure)
      throw new Error("Missing building type.");
    if (
      j.kind === "haul" &&
      ["open", "active"].includes(j.status) &&
      !s.items.some((i) => i.id === j.item)
    )
      throw new Error("Missing haul item.");
  }
  for (const e of s.events)
    if (e.actor && !s.goblins.some((g) => g.id === e.actor))
      throw new Error("Missing event actor.");
  return s;
}
export function encodeSave(s: GameState): string {
  return JSON.stringify(s);
}
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open("goblin-grotto", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("saves");
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
export async function saveGame(s: GameState, slot = "manual"): Promise<void> {
  const text = encodeSave(s);
  const db = await database();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("saves", "readwrite");
      tx.objectStore("saves").put(text, slot);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function loadGame(slot = "manual"): Promise<GameState> {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("saves");
      const r = tx.objectStore("saves").get(slot);
      r.onsuccess = () => {
        try {
          if (typeof r.result !== "string")
            throw new Error("No save in this slot yet.");
          resolve(decodeSave(r.result));
        } catch (e) {
          reject(e);
        }
      };
      r.onerror = () => reject(r.error);
    });
  } finally {
    db.close();
  }
}
