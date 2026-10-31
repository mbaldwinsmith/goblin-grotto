/** Serializable xorshift32 stream. Zero seeds are deliberately remapped. */
export function seedValue(seed: string): number {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0 || 1;
}
export function random(stream: { rng: number }): number {
  let x = stream.rng;
  x ^= x << 13;
  x ^= x >>> 17;
  x ^= x << 5;
  stream.rng = x >>> 0;
  return stream.rng / 4294967296;
}
export function range(
  stream: { rng: number },
  min: number,
  max: number,
): number {
  return min + Math.floor(random(stream) * (max - min + 1));
}
export function weighted<T>(
  stream: { rng: number },
  choices: { value: T; weight: number }[],
): T {
  const total = choices.reduce((sum, c) => sum + Math.max(0, c.weight), 0);
  if (!choices.length || total <= 0)
    throw new Error("No positive weighted choices");
  let roll = random(stream) * total;
  for (const c of choices) {
    roll -= Math.max(0, c.weight);
    if (roll < 0) return c.value;
  }
  return choices[choices.length - 1].value;
}
