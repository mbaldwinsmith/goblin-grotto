import type { GameState, StoryEvent } from "./model";
export function emit(
  s: GameState,
  kind: StoryEvent["kind"],
  text: string,
  actor: StoryEvent["actor"] = null,
): void {
  if (actor && !s.goblins.some((g) => g.id === actor))
    throw new Error("Unknown event actor");
  s.events.push({ id: `event-${s.nextId++}`, tick: s.tick, kind, text, actor });
  if (s.events.length > 80) s.events.shift();
}
