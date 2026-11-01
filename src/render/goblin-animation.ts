import type { Goblin } from "../sim/model";
import {
  dropElapsed,
  DROP_FRAME_TICKS,
  DROP_FRAME_COUNT,
} from "../sim/hauling";
import manifest from "../../public/assets/goblin/base/manifest.json";
import type { ActorId, Position } from "../core/types";
import { facingFor, type Facing } from "../core/facing";
export { facings, facingFor, type Facing } from "../core/facing";
export interface GoblinPose {
  position: Position;
  facing: Facing;
  walking: boolean;
  frame: number;
  textureId: string;
}
interface Motion {
  from: Position;
  target: Position;
  started: number;
  duration: number;
  facing: Facing;
  lastTime: number;
  clip: string;
  clipStarted: number;
}
/** Presentation history only: fixed ticks advance gait; render alpha only interpolates position. */
export class GoblinAnimator {
  private states = new Map<ActorId, Motion>();
  clear(): void {
    this.states.clear();
  }
  sample(
    id: ActorId,
    target: Position,
    tick: number,
    alpha: number,
    moveTicks: number,
    lookAt?: Position,
    facing: Facing = "south",
    action: {
      carrying?: boolean;
      drop?: Goblin["drop"];
      sleeping?: boolean;
    } = {},
  ): GoblinPose {
    const now = tick + Math.max(0, Math.min(0.999, alpha));
    let state = this.states.get(id);
    if (!state || now < state.lastTime) {
      state = {
        from: { ...target },
        target: { ...target },
        started: tick,
        duration: 1,
        facing,
        lastTime: now,
        clip: "idle",
        clipStarted: tick,
      };
      this.states.set(id, state);
    }
    if (state.target.x !== target.x || state.target.y !== target.y) {
      const previous = this.interpolate(state, now);
      state.facing = facingFor(
        target.x - state.target.x,
        target.y - state.target.y,
        state.facing,
      );
      state.from = previous;
      state.target = { ...target };
      state.started = tick;
      state.duration = Math.max(1, moveTicks);
    }
    const walking =
      now < state.started + state.duration &&
      (state.from.x !== state.target.x || state.from.y !== state.target.y);
    if (!walking && lookAt)
      state.facing = facingFor(
        lookAt.x - target.x,
        lookAt.y - target.y,
        state.facing,
      );
    state.lastTime = now;
    const clip = action.drop
      ? "drop"
      : action.sleeping
        ? "pose"
        : walking
          ? action.carrying
            ? "haul-walk"
            : "walk"
          : action.carrying
            ? "haul-idle"
            : "idle";
    if (clip !== state.clip) {
      state.clip = clip;
      state.clipStarted = tick;
    }
    const frame =
      clip === "drop"
        ? Math.max(
            0,
            Math.min(
              DROP_FRAME_COUNT - 1,
              Math.floor(dropElapsed(tick, action.drop!) / DROP_FRAME_TICKS),
            ),
          )
        : clip === "pose"
          ? 0
          : Math.floor(
              (tick - state.clipStarted) / manifest.frameDurationTicks,
            ) % manifest.clips[clip];
    return {
      position: action.drop ? { ...target } : this.interpolate(state, now),
      facing: state.facing,
      walking: !action.drop && walking,
      frame,
      textureId:
        clip === "pose"
          ? `idle-${state.facing}`
          : `${clip}-${state.facing}-${String(frame).padStart(3, "0")}`,
    };
  }

  private interpolate(state: Motion, now: number): Position {
    const t = Math.max(0, Math.min(1, (now - state.started) / state.duration));
    return {
      x: state.from.x + (state.target.x - state.from.x) * t,
      y: state.from.y + (state.target.y - state.from.y) * t,
      z: 0,
    };
  }
}
