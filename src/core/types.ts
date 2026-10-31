export type ActorId = `goblin-${number}`;
export type ItemId = `item-${number}`;
export type JobId = `job-${number}`;
export type EventId = `event-${number}`;
export interface Position {
  x: number;
  y: number;
  z: 0;
}
export type Result = { ok: true } | { ok: false; reason: string };
export const directions = [
  { x: 0, y: -1, z: 0 },
  { x: -1, y: 0, z: 0 },
  { x: 1, y: 0, z: 0 },
  { x: 0, y: 1, z: 0 },
] as const;
