export const facings = [
  "south",
  "south-east",
  "east",
  "north-east",
  "north",
  "north-west",
  "west",
  "south-west",
] as const;
export type Facing = (typeof facings)[number];
export function facingFor(
  dx: number,
  dy: number,
  fallback: Facing = "south",
): Facing {
  if (!dx && !dy) return fallback;
  if (dy < 0) return dx < 0 ? "north-west" : dx > 0 ? "north-east" : "north";
  if (dy > 0) return dx < 0 ? "south-west" : dx > 0 ? "south-east" : "south";
  return dx < 0 ? "west" : "east";
}
