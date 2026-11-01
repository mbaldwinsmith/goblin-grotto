import { weighted } from "../core/random";
import type { GameState } from "./model";
import { emit } from "./events";
import { invalidateNavigation } from "./navigation";
export const DAY_TICKS = 2400;
export function season(
  s: GameState,
): "Spring" | "Summer" | "Autumn" | "Winter" {
  return (["Spring", "Summer", "Autumn", "Winter"] as const)[
    Math.floor(s.tick / (DAY_TICKS * 5)) % 4
  ];
}
export function updateWeather(s: GameState): void {
  if (s.tick % 600 !== 0) return;
  const cold = season(s) === "Winter";
  const kind = weighted<GameState["weather"]["kind"]>(s, [
    { value: "clear", weight: 55 },
    { value: cold ? "snow" : "rain", weight: 45 },
  ]);
  if (kind === s.weather.kind) return;
  s.weather = { kind, changedAt: s.tick };
  invalidateNavigation(s);
  emit(
    s,
    "world",
    kind === "clear"
      ? "The sky clears above the hillside."
      : kind === "rain"
        ? "Rain patters on the hillside. The cave stays dry."
        : "Snow settles in the woods. The grotto stays sheltered.",
  );
}
