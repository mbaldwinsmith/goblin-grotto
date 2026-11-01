export const facings = ["south", "east", "north", "west"] as const;
export type Facing = (typeof facings)[number];
/** Dominant axis; vertical wins a tie. Grid movement already uses four neighbours. */
export function facingFor(
  dx: number,
  dy: number,
  fallback: Facing = "south",
): Facing {
  if (!dx && !dy) return fallback;
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? "west" : "east";
  return dy < 0 ? "north" : "south";
}
