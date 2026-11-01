import type { GameState, Goblin, Job } from "./model";
import type { Facing } from "../core/facing";
import { tileAt } from "./model";
export const WORK_CYCLE_TICKS = 18;
export const WORK_IMPACT_TICKS = 10;
export const WORK_PER_STRIKE = 18;
export type WorkTool = "pick" | "axe" | "hands";
export function toolForJob(
  s: GameState,
  job: Job | undefined,
): WorkTool | null {
  if (job?.kind === "dig") return "pick";
  if (job?.kind !== "harvest") return null;
  const tile = tileAt(s, job.target);
  return tile?.deposit === "wood"
    ? "axe"
    : tile?.deposit === "food" || tile?.structure === "farm"
      ? "hands"
      : null;
}
export function beginWorkSwing(s: GameState, g: Goblin, tool: WorkTool): void {
  g.workAction = {
    kind: tool === "pick" ? "mine" : tool === "axe" ? "chop" : "gather",
    startedAt: s.tick,
    hit: false,
  };
}
/** Native contacts vary by direction; every tool does work on the same simulation tick. */
export function workFrame(
  elapsed: number,
  contact: number,
  count: number,
): number {
  if (elapsed <= WORK_IMPACT_TICKS)
    return Math.max(
      0,
      Math.floor((Math.max(0, elapsed) * contact) / WORK_IMPACT_TICKS),
    );
  return Math.min(
    count - 1,
    contact +
      Math.floor(
        ((elapsed - WORK_IMPACT_TICKS) * (count - contact)) /
          (WORK_CYCLE_TICKS - WORK_IMPACT_TICKS),
      ),
  );
}
export const contactFrames: Record<
  "mine" | "chop" | "gather",
  Record<Facing, number>
> = {
  mine: { south: 5, east: 4, north: 5, west: 5 },
  chop: { south: 4, east: 3, north: 4, west: 4 },
  gather: { south: 4, east: 4, north: 4, west: 4 },
};
/** Simulation owns the once-only strike; onImpact applies work and may complete the job. */
export function updateWorkSwing(
  s: GameState,
  g: Goblin,
  onImpact: () => void,
): boolean {
  const action = g.workAction;
  if (!action) return false;
  const elapsed = s.tick - action.startedAt;
  if (!action.hit && elapsed >= WORK_IMPACT_TICKS) {
    action.hit = true;
    onImpact();
  }
  if (elapsed >= WORK_CYCLE_TICKS) {
    g.workAction = null;
    return false;
  }
  return !!g.workAction;
}
