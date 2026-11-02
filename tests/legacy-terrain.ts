/** Normalize the documented terrain-only change in historical expected snapshots. */
export function legacyTerrain<T extends { tiles: { material: string }[] }>(
  snapshot: T,
): T {
  for (const t of snapshot.tiles)
    if (t.material === "sand" || t.material === "mud") t.material = "dirt";
  return snapshot;
}
