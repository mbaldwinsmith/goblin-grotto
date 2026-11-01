import { movementTicks } from "../sim/navigation";
import { GoblinAnimator, type GoblinPose } from "./goblin-animation";
import { loadGoblinArt, goblinFrames } from "./goblin-art";
import {
  Application,
  Container,
  Graphics,
  Sprite,
  type Texture,
} from "pixi.js";
import { directions, type ActorId, type Position } from "../core/types";
import {
  type GameState,
  type Tile,
  position,
  tileAt,
  resources,
  deposits,
  walkable,
} from "../sim/model";
import { cameraFocus, cameraPan, cameraZoom, boundCamera } from "./camera";
import { actorDepth, objectDepth, inspectPoint } from "./picking";
import { type Camera, project, unproject } from "./projection";
import {
  TILE_SIZE,
  HALF_TILE,
  WALL_HEIGHT,
  ACTOR_FEET,
  DEFAULT_ZOOM,
} from "./metrics";
import { drawFeature } from "./features";
import { loadArt } from "./art";
interface TileArt {
  floor: Sprite;
  top: Sprite;
  side: Sprite;
  plant: Sprite;
  props: Graphics;
  signature: string;
}
export class Scene {
  app = new Application();
  root = new Container();
  ground = new Container();
  details = new Container();
  overlay = new Graphics();
  private tiles = new Map<number, TileArt>();
  private itemSprites = new Map<string, Graphics>();
  private mapSize = { width: 64, height: 64 };
  private art: Record<string, Texture> = {};
  readonly goblinSprites = new Map<ActorId, Sprite>();
  private animator = new GoblinAnimator();
  private poses = new Map<ActorId, GoblinPose>();
  private renderPositions = new Map<ActorId, Position>();
  private world: GameState | null = null;
  selectedActor: ActorId | null = null;
  hoverActor: ActorId | null = null;
  reveal = false;
  scouting = false;
  camera: Camera = { x: 0, y: 0, zoom: DEFAULT_ZOOM };
  selected: Position | null = null;
  hover: Position | null = null;
  private texture(id: string): Texture {
    const t = this.art[id];
    if (!t) throw Error(`Missing art: ${id}`);
    return t;
  }
  async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: host,
      background: 0x111b20,
      antialias: false,
      preference: "webgl",
      resolution: devicePixelRatio || 1,
      autoDensity: true,
    });
    const [terrain, goblins] = await Promise.all([loadArt(), loadGoblinArt()]);
    this.art = { ...terrain, ...goblins };
    host.append(this.app.canvas);
    // Dev-only scene inspection avoids re-importing and re-running the app in browser tests.
    if (import.meta.env.DEV) Reflect.set(this.app.canvas, "grottoScene", this);
    this.app.canvas.setAttribute(
      "aria-label",
      "Grotto map. Use the tile coordinates and tools for keyboard actions.",
    );
    this.app.stage.addChild(this.root);
    this.root.addChild(this.ground, this.details, this.overlay);
    this.details.sortableChildren = true;
    this.app.canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      host.setAttribute(
        "data-error",
        "Graphics context lost. Save and reload to recover.",
      );
    });
  }
  pick(clientX: number, clientY: number): Position {
    const r = this.app.canvas.getBoundingClientRect();
    return unproject(
      (clientX - r.left - this.app.screen.width / 2 - this.camera.x) /
        this.camera.zoom,
      (clientY - r.top - this.app.screen.height / 2 - this.camera.y) /
        this.camera.zoom,
    );
  }
  private makeTile(): TileArt {
    const floor = new Sprite(this.texture("floor-hard")),
      top = new Sprite(this.texture("wall-top-hard")),
      side = new Sprite(this.texture("wall-side-hard")),
      plant = new Sprite(this.texture("plant-mushroom")),
      props = new Graphics();
    this.ground.addChild(floor);
    this.details.addChild(side, top, plant, props);
    return { floor, top, side, plant, props, signature: "" };
  }
  draw(s: GameState, alpha = 0): void {
    if (this.world !== s) {
      this.world = s;
      this.animator.clear();
      this.poses.clear();
      this.renderPositions.clear();
    }
    for (const g of s.goblins) {
      const job = s.jobs.find((job) => job.id === g.job),
        lookAt =
          job?.kind === "haul" && !g.carrying
            ? s.items.find((item) => item.id === job.item)?.position
            : job?.target;
      const pose = this.animator.sample(
        g.id,
        g.position,
        s.tick,
        alpha,
        movementTicks(s, g.position),
        lookAt,
      );
      this.poses.set(g.id, pose);
      this.renderPositions.set(g.id, pose.position);
    }
    this.mapSize = { width: s.width, height: s.height };
    boundCamera(this.camera, this.mapSize);
    this.root.position.set(
      this.app.screen.width / 2 + this.camera.x,
      this.app.screen.height / 2 + this.camera.y,
    );
    this.root.scale.set(this.camera.zoom);
    const o = this.overlay.clear();
    for (const node of this.tiles.values())
      for (const sprite of [
        node.floor,
        node.top,
        node.side,
        node.plant,
        node.props,
      ])
        sprite.visible = false;
    for (const item of this.itemSprites.values()) item.visible = false;
    const selectedGoblin = s.goblins.find((g) => g.id === this.selectedActor);
    if (selectedGoblin) this.selected = { ...selectedGoblin.position };
    const selectedFeet = selectedGoblin
      ? this.renderPositions.get(selectedGoblin.id)
      : undefined;
    for (let y = 0; y < s.height; y++)
      for (let x = 0; x < s.width; x++) {
        const p = position(x, y),
          t = tileAt(s, p)!;
        if (!t.discovered) continue;
        const a = project(p),
          key = y * s.width + x;
        let node = this.tiles.get(key);
        if (!node) {
          node = this.makeTile();
          this.tiles.set(key, node);
        }
        const wall = t.solid || t.structure === "wall",
          door = t.structure === "door";
        const occludes =
          selectedFeet &&
          Math.abs(selectedFeet.x - x) <= 1 &&
          y >= selectedFeet.y &&
          y <= selectedFeet.y + 1;
        const opacity = (wall || door) && (this.reveal || occludes) ? 0.25 : 1;
        node.floor.visible = true;
        node.floor.texture = this.texture(
          t.outside ? "floor-grass" : `floor-${t.material}`,
        );
        node.floor.position.set(a.x - HALF_TILE, a.y);
        const material = t.structure === "wall" ? "hard" : t.material;
        node.top.texture = this.texture(`wall-top-${material}`);
        node.side.texture = this.texture(`wall-side-${material}`);
        node.top.position.set(a.x - HALF_TILE, a.y - WALL_HEIGHT);
        node.side.position.set(a.x - HALF_TILE, a.y);
        node.top.visible = wall;
        const south = tileAt(s, position(x, y + 1));
        node.side.visible =
          wall &&
          !!south?.discovered &&
          !south.solid &&
          south.structure !== "wall";
        node.top.alpha = opacity;
        node.side.alpha = opacity;
        node.top.zIndex = objectDepth(p, true) - 1;
        node.side.zIndex = objectDepth(p, true) - 2;
        const plant =
          t.structure === "farm"
            ? `plant-farm-${t.growth >= 600 ? "ripe" : "young"}`
            : t.deposit === "wood"
              ? "plant-tree"
              : t.deposit === "food"
                ? "plant-mushroom"
                : t.feature === "grove"
                  ? "plant-grove"
                  : t.feature === "undergrowth"
                    ? "plant-undergrowth"
                    : null;
        node.plant.visible = !t.solid && plant !== null;
        if (plant) node.plant.texture = this.texture(plant);
        node.plant.position.set(a.x - HALF_TILE, a.y);
        node.plant.zIndex = objectDepth(p);
        node.plant.alpha =
          t.deposit === "wood" && (this.reveal || occludes) ? 0.25 : 1;
        const d = node.props;
        d.visible = true;
        d.zIndex = objectDepth(p, wall || door);
        d.alpha = opacity;
        if (
          this.scouting &&
          walkable(t) &&
          directions.some((dir) => {
            const n = tileAt(s, position(x + dir.x, y + dir.y));
            return n && !n.discovered;
          })
        )
          o.rect(a.x - 1, a.y + 15, 2, 2).fill(0x91ccb1);
        if (t.collapseAt !== null) {
          const urgent = t.collapseAt - s.tick < 100;
          o.rect(a.x - 13, a.y + 3, 26, 26).stroke({
            color: urgent ? 0xe19378 : 0xd9bd72,
            width: 2,
          });
          o.moveTo(a.x - 9, a.y + 6)
            .lineTo(a.x - 2, a.y + 14)
            .lineTo(a.x - 7, a.y + 20)
            .stroke({ color: 0xe5cc92, width: 1 });
        }
        if (t.outside && s.weather.kind !== "clear") {
          const snow = s.weather.kind === "snow";
          o.rect(a.x - HALF_TILE, a.y, TILE_SIZE, TILE_SIZE).fill({
            color: snow ? 0xdbe4db : 0x779fac,
            alpha: snow ? 0.12 : 0.05,
          });
          for (let i = 0; i < 2; i++)
            o.rect(
              a.x - 10 + i * 17,
              a.y + ((s.tick + i * 11) % 29),
              snow ? 2 : 1,
              snow ? 2 : 4,
            ).fill({ color: snow ? 0xe3e9dd : 0x91b9c7, alpha: 0.6 });
        }
        const signature = `${t.solid}:${t.stockpile}:${t.deposit}:${t.feature}:${t.structure}:${node.side.visible}`;
        if (node.signature !== signature) {
          node.signature = signature;
          this.drawProps(d.clear(), t, a, node.side.visible);
        }
      }
    for (const item of s.items.filter(
      (i) => !i.holder && tileAt(s, i.position)?.discovered,
    )) {
      const a = project(item.position);
      let d = this.itemSprites.get(item.id);
      if (!d) {
        d = new Graphics();
        this.itemSprites.set(item.id, d);
        this.details.addChild(d);
      }
      d.clear();
      d.visible = true;
      d.zIndex = objectDepth(item.position);
      d.rect(a.x - 3, a.y + 22, 6, 5).fill(resources[item.resource].color);
    }
    for (const j of s.jobs.filter(
      (j) => j.status === "open" || j.status === "active",
    )) {
      const a = project(j.target);
      o.rect(a.x - 14, a.y + 2, 28, 28).stroke({
        color: j.kind === "dig" ? 0xe1b66a : 0x7dc8be,
        width: 1,
      });
      if (j.progress)
        o.rect(a.x - 10, a.y + 29, Math.min(20, j.progress / 3), 2).fill(
          0xe1b66a,
        );
    }
    for (const g of s.goblins) {
      const pose = this.poses.get(g.id)!,
        frame = goblinFrames.get(pose.textureId)!;
      let sprite = this.goblinSprites.get(g.id);
      if (!sprite) {
        sprite = new Sprite();
        this.details.addChild(sprite);
        this.goblinSprites.set(g.id, sprite);
      }
      sprite.texture = this.texture(`base-${pose.textureId}`);
      sprite.label = pose.textureId;
      sprite.anchor.set(0, 0);
      const a = project(pose.position);
      sprite.position.set(a.x - frame.footX, a.y + ACTOR_FEET - frame.footY);
      sprite.zIndex = actorDepth(pose.position);
      sprite.alpha = g.activity === "Sleeping" ? 0.6 : 1;
      if (this.selectedActor === g.id)
        o.ellipse(a.x, a.y + ACTOR_FEET, 12, 4).stroke({
          color: 0xe9d69e,
          width: 1,
        });
    }
    for (const [id, sprite] of this.goblinSprites)
      if (!s.goblins.some((g) => g.id === id)) {
        sprite.destroy();
        this.goblinSprites.delete(id);
      }
    for (const [id, item] of this.itemSprites)
      if (!item.visible) {
        item.destroy();
        this.itemSprites.delete(id);
      }
    this.details.sortChildren();
    for (const p of [this.hover, this.selected])
      if (p) {
        const a = project(p);
        o.rect(a.x - HALF_TILE, a.y, TILE_SIZE, TILE_SIZE).stroke({
          color: p === this.selected ? 0xf3d59b : 0xa5c9bb,
          width: 1,
        });
      }
  }
  private drawProps(
    d: Graphics,
    t: Tile,
    a: { x: number; y: number },
    sideVisible: boolean,
  ): void {
    if (t.stockpile)
      d.rect(a.x - 13, a.y + 3, 26, 26).stroke({ color: 0xc1a46a, width: 1 });
    if (
      t.feature &&
      !t.solid &&
      t.feature !== "grove" &&
      t.feature !== "undergrowth"
    )
      drawFeature(d, t.feature, a);
    if (t.deposit && t.solid) {
      const c = resources[deposits[t.deposit].resource].color;
      d.rect(a.x - 9, a.y - 25, 4, 3).fill(c);
      d.rect(a.x + 2, a.y - 18, 5, 3).fill(c);
      if (sideVisible) d.rect(a.x + 7, a.y + 16, 3, 3).fill(c);
    }
    if (t.deposit && !t.solid && t.deposit !== "wood" && t.deposit !== "food") {
      const c = resources[deposits[t.deposit].resource].color;
      if (t.deposit === "masonry") {
        d.rect(a.x - 10, a.y + 16, 10, 6).fill(c);
        d.rect(a.x + 1, a.y + 21, 11, 5).fill(0xb0b0a0);
      } else
        d.poly([
          a.x - 10,
          a.y + 25,
          a.x - 6,
          a.y + 18,
          a.x,
          a.y + 23,
          a.x + 7,
          a.y + 19,
          a.x + 12,
          a.y + 28,
        ]).fill(c);
    }
    if (t.structure === "bed") {
      d.rect(a.x - 10, a.y + 5, 20, 24).fill(0x8c7253);
      d.rect(a.x - 8, a.y + 7, 16, 5).fill(0xdacda1);
      d.rect(a.x - 8, a.y + 13, 16, 14).fill(0x648d83);
    }
    if (t.structure === "workshop") {
      d.rect(a.x - 13, a.y + 6, 26, 13).fill(0x997a55);
      d.rect(a.x - 10, a.y + 19, 3, 9).fill(0x5c4b3e);
      d.rect(a.x + 8, a.y + 19, 3, 9).fill(0x5c4b3e);
      d.rect(a.x - 4, a.y + 2, 8, 6).fill(0x667d84);
    }
    if (t.structure === "support") {
      d.rect(a.x - 13, a.y + 3, 4, 28).fill(0x9d7e53);
      d.rect(a.x + 9, a.y + 3, 4, 28).fill(0x9d7e53);
      d.rect(a.x - 15, a.y + 2, 30, 5).fill(0xc3a16c);
      d.rect(a.x - 12, a.y + 28, 7, 3).fill(0x5c6b6d);
      d.rect(a.x + 6, a.y + 28, 7, 3).fill(0x5c6b6d);
    }
    if (t.structure === "door") {
      d.rect(a.x - 13, a.y, 26, 32).fill(0x8c7253);
      d.rect(a.x - 10, a.y + 2, 20, 28).fill(0x69543d);
      d.rect(a.x + 5, a.y + 17, 2, 2).fill(0xd7ba73);
    }
  }
  reset(): void {
    this.camera.zoom = DEFAULT_ZOOM;
    this.focus(position(32, 30));
  }
  focus(p: Position): void {
    cameraFocus(this.camera, p, this.mapSize);
  }
  pan(dx: number, dy: number): void {
    cameraPan(this.camera, dx, dy, this.mapSize);
  }
  zoom(factor: number, client?: { x: number; y: number }): void {
    const r = this.app.canvas.getBoundingClientRect();
    cameraZoom(
      this.camera,
      factor,
      this.mapSize,
      client
        ? {
            x: client.x - r.left - this.app.screen.width / 2,
            y: client.y - r.top - this.app.screen.height / 2,
          }
        : { x: 0, y: 0 },
    );
  }
  inspect(s: GameState, clientX: number, clientY: number) {
    const r = this.app.canvas.getBoundingClientRect();
    return inspectPoint(
      s,
      (clientX - r.left - this.app.screen.width / 2 - this.camera.x) /
        this.camera.zoom,
      (clientY - r.top - this.app.screen.height / 2 - this.camera.y) /
        this.camera.zoom,
      this.reveal,
      this.renderPositions,
    );
  }
}
