import type { Position } from "../core/types";
import type { Structure } from "../sim/model";
export type Tool =
  | "inspect"
  | "dig"
  | "stockpile"
  | "cancel"
  | "harvest"
  | "craft"
  | "explore"
  | "guard"
  | "possess"
  | Structure;
export class Interaction {
  tool: Tool = "inspect";
  phase: "idle" | "pan" | "paint" = "idle";
  pointer: number | null = null;
  private visited = new Set<string>();
  private last: Position | null = null;
  select(tool: Tool): void {
    this.end();
    this.tool = tool;
  }
  begin(pointer: number, phase: "pan" | "paint"): boolean {
    if (this.pointer !== null) return false;
    this.pointer = pointer;
    this.phase = phase;
    return true;
  }
  end(pointer?: number): void {
    if (pointer !== undefined && pointer !== this.pointer) return;
    this.pointer = null;
    this.phase = "idle";
    this.visited.clear();
    this.last = null;
  }
  paint(p: Position): Position[] {
    if (this.phase !== "paint") return [];
    const start = this.last ?? p;
    this.last = p;
    const n = Math.max(Math.abs(p.x - start.x), Math.abs(p.y - start.y));
    const result: Position[] = [];
    for (let i = 0; i <= n; i++) {
      const point = {
        x: Math.round(start.x + (p.x - start.x) * (n ? i / n : 0)),
        y: Math.round(start.y + (p.y - start.y) * (n ? i / n : 0)),
        z: 0 as const,
      };
      const key = `${point.x},${point.y}`;
      if (!this.visited.has(key)) {
        this.visited.add(key);
        result.push(point);
      }
    }
    return result;
  }
}
