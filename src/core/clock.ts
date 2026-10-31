/** 10 Hz; drops excess catch-up rather than spiralling after tab suspension. */
export class Clock {
  accumulator = 0;
  speed = 1;
  advance(seconds: number, step: () => void): number {
    this.accumulator += Math.min(Math.max(0, seconds), 0.25) * this.speed;
    let count = 0;
    while (this.accumulator >= 0.1 && count < 10) {
      step();
      this.accumulator -= 0.1;
      count++;
    }
    return count;
  }
}
