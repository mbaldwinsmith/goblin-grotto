import { z } from "zod";
import type { ActorId, ItemId, JobId, EventId } from "../core/types";
import { resourceKinds, depositKinds, featureKinds } from "../sim/content";
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
const structure = z.enum(["bed", "farm", "workshop", "door", "wall"]);
const schema: z.ZodType<GameState> = z.object({
  version: z.literal(2),
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
      }),
    )
    .length(4096),
  goblins: z
    .array(
      z.object({
        id: actor,
        name: z.string().max(40),
        position: p,
        hunger: z.number().min(0).max(100),
        fatigue: z.number().min(0).max(100),
        job: jobId.nullable(),
        carrying: itemId.nullable(),
        activity: z.string().max(200),
        worked: natural,
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
  const result = schema.safeParse(raw);
  if (!result.success)
    throw new Error(
      "Unsupported or damaged save. Supported Goblin Grotto saves: versions 1 and 2.",
    );
  const s = result.data;
  const all = [...s.goblins, ...s.items, ...s.jobs, ...s.events];
  const ids = all.map((e) => e.id);
  if (
    new Set(ids).size !== ids.length ||
    all.some((e) => Number(e.id.split("-")[1]) >= s.nextId)
  )
    throw new Error("Save contains conflicting IDs.");
  for (const g of s.goblins) {
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
