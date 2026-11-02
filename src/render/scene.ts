import { drawWallShading } from "./wall-shading";
import { seedValue } from "../core/random";
import {
  tileScenery,
  sceneryFrames,
  sceneryViewport,
  itemArt,
  treeBounds,
  treeOverlapsActor,
  treeAtPoint,
} from "./scenery";
import { toolForJob } from "../sim/work-animation";
import { movementTicks } from "../sim/navigation";
import { GoblinAnimator, type GoblinPose } from "./goblin-animation";
import { loadGoblinArt, goblinFrames } from "./goblin-art";
import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
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
  SOURCE_TILE_SIZE,
  LEGACY_ART_SCALE,
  HALF_TILE,
  WALL_HEIGHT,
  ACTOR_FEET,
  DEFAULT_ZOOM,
} from "./metrics";
import { drawFeature } from "./features";
import { loadArt } from "./art";
interface TileArt {
  floor: Sprite;
  underFloor: Sprite;
  underTop: Sprite;
  underSide: Sprite;
  top: Sprite;
  side: Sprite;
  plant: Sprite;
  props: Graphics;
  pile: Sprite;
  signature: string;
}
export class Scene {
  app = new Application();
  root = new Container();
  ground = new Container();
  details = new Container();
  overlay = new Graphics();
  private tiles = new Map<number, TileArt>();
  private itemSprites = new Map<string, Sprite>();
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
  pick(clientX: number, clientY: number, gather = false): Position {
    const r = this.app.canvas.getBoundingClientRect();
    const x =
        (clientX - r.left - this.app.screen.width / 2 - this.camera.x) /
        this.camera.zoom,
      y =
        (clientY - r.top - this.app.screen.height / 2 - this.camera.y) /
        this.camera.zoom;
    if (gather && this.world) {
      const tree = treeAtPoint(this.world, x, y);
      if (tree) return tree;
    }
    return unproject(x, y);
  }
  private makeTile(): TileArt {
    const floor = new Sprite(this.texture("floor-hard")),
      top = new Sprite(this.texture("wall-top-hard")),
      side = new Sprite(this.texture("wall-side-hard")),
      plant = new Sprite(this.texture("plant-mushroom")),
      props = new Graphics(),
      pile = new Sprite(),
      underFloor = new Sprite(this.texture("floor-hard")),
      underTop = new Sprite(this.texture("wall-top-hard")),
      underSide = new Sprite(this.texture("wall-side-hard"));
    this.ground.addChild(underFloor, floor);
    this.details.addChild(underSide, side, underTop, top, plant, pile, props);
    return {
      floor,
      top,
      side,
      plant,
      pile,
      props,
      underFloor,
      underTop,
      underSide,
      signature: "",
    };
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
        g.facing,
        {
          carrying: !!g.carrying,
          tool: toolForJob(s, job),
          workAction: g.workAction,
          drop: g.drop,
          sleeping: g.activity === "Sleeping",
        },
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
    const o = this.overlay.clear(),
      seed = seedValue(s.seed);
    for (const node of this.tiles.values())
      for (const sprite of [
        node.floor,
        node.underFloor,
        node.underTop,
        node.underSide,
        node.top,
        node.side,
        node.plant,
        node.props,
        node.pile,
      ])
        sprite.visible = false;
    for (const item of this.itemSprites.values()) item.visible = false;
    const selectedGoblin = s.goblins.find((g) => g.id === this.selectedActor);
    if (selectedGoblin) this.selected = { ...selectedGoblin.position };
    const selectedFeet = selectedGoblin
      ? this.renderPositions.get(selectedGoblin.id)
      : undefined;
    const view = sceneryViewport(this.camera, this.app.screen, this.mapSize);
    for (let y = view.minY; y <= view.maxY; y++)
      for (let x = view.minX; x <= view.maxX; x++) {
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
        const art = tileScenery(seed, t, p);
        node.floor.texture = this.texture(art.floor);
        node.floor.label = art.floor;
        node.floor.position.set(a.x - HALF_TILE, a.y);
        // Source terrain has transparent gaps; retain a continuous native reference beneath it.
        const material = t.structure === "wall" ? "hard" : t.material;
        node.underFloor.texture = this.texture(
          t.outside ? "floor-grass" : `floor-${t.material}`,
        );
        node.underFloor.position.copyFrom(node.floor.position);
        node.underFloor.visible = sceneryFrames.has(art.floor);
        node.underTop.texture = this.texture(`wall-top-${material}`);
        node.underSide.texture = this.texture(`wall-side-${material}`);
        node.top.texture = this.texture(art.top);
        node.side.texture = this.texture(art.side);
        node.top.label = art.top;
        node.side.label = art.side;
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
        node.underTop.position.copyFrom(node.top.position);
        node.underSide.position.copyFrom(node.side.position);
        node.underTop.zIndex = node.top.zIndex - 0.25;
        node.underSide.zIndex = node.side.zIndex - 0.25;
        // Reveal removes the solid backing, leaving only the faded supplied surface.
        node.underTop.visible =
          wall && opacity === 1 && sceneryFrames.has(art.top);
        node.underSide.visible =
          node.side.visible && opacity === 1 && sceneryFrames.has(art.side);
        const plant = art.plant,
          tree = plant?.startsWith("tree-");
        node.plant.visible = plant !== null;
        if (plant) {
          node.plant.texture = this.texture(plant);
          node.plant.label = plant;
        }
        for (const sprite of [
          node.floor,
          node.underFloor,
          node.underTop,
          node.underSide,
          node.top,
          node.side,
        ]) {
          sprite.width = TILE_SIZE;
          sprite.height = TILE_SIZE;
        }
        node.plant.width = TILE_SIZE * (tree ? 3 : 1);
        node.plant.height = TILE_SIZE * (tree ? 3 : 1);
        const bounds = tree ? treeBounds(p) : { x: a.x - HALF_TILE, y: a.y };
        node.plant.position.set(bounds.x, bounds.y);
        node.plant.zIndex = objectDepth(p) - 0.1;
        node.plant.alpha =
          tree &&
          (this.reveal ||
            (selectedFeet &&
              actorDepth(selectedFeet) < objectDepth(p) &&
              treeOverlapsActor(p, selectedFeet)))
            ? 0.25
            : 1;
        const pile =
          !t.solid && t.deposit && t.deposit !== "wood" && t.deposit !== "food"
            ? itemArt(
                deposits[t.deposit].resource,
                `deposit-${s.seed}-${x}-${y}`,
              )
            : null;
        node.pile.visible = pile !== null;
        if (pile) {
          node.pile.texture = this.texture(pile);
          node.pile.label = pile;
        }
        node.pile.width = TILE_SIZE;
        node.pile.height = TILE_SIZE;
        node.pile.position.set(a.x - HALF_TILE, a.y);
        node.pile.zIndex = objectDepth(p) - 0.5;
        const d = node.props;
        d.visible = true;
        d.zIndex = objectDepth(p, wall || door);
        d.alpha = opacity;
        o.context
          .save()
          .translate(a.x, a.y)
          .scale(LEGACY_ART_SCALE, LEGACY_ART_SCALE);
        const marker = { x: 0, y: 0 };
        if (
          this.scouting &&
          walkable(t) &&
          directions.some((dir) => {
            const n = tileAt(s, position(x + dir.x, y + dir.y));
            return n && !n.discovered;
          })
        )
          o.rect(marker.x - 1, marker.y + 15, 2, 2).fill(0x91ccb1);
        if (t.collapseAt !== null) {
          const urgent = t.collapseAt - s.tick < 100;
          o.rect(marker.x - 13, marker.y + 3, 26, 26).stroke({
            color: urgent ? 0xe19378 : 0xd9bd72,
            width: 2,
          });
          o.moveTo(marker.x - 9, marker.y + 6)
            .lineTo(marker.x - 2, marker.y + 14)
            .lineTo(marker.x - 7, marker.y + 20)
            .stroke({ color: 0xe5cc92, width: 1 });
        }
        if (t.outside && s.weather.kind !== "clear") {
          const snow = s.weather.kind === "snow";
          o.rect(
            marker.x - SOURCE_TILE_SIZE / 2,
            marker.y,
            SOURCE_TILE_SIZE,
            SOURCE_TILE_SIZE,
          ).fill({
            color: snow ? 0xdbe4db : 0x779fac,
            alpha: snow ? 0.12 : 0.05,
          });
          for (let i = 0; i < 2; i++)
            o.rect(
              marker.x - 10 + i * 17,
              marker.y + ((s.tick + i * 11) % 29),
              snow ? 2 : 1,
              snow ? 2 : 4,
            ).fill({ color: snow ? 0xe3e9dd : 0x91b9c7, alpha: 0.6 });
        }
        o.context.restore();
        const signature = `${t.solid}:${t.stockpile}:${t.stockpileFilter}:${t.deposit}:${t.feature}:${t.structure}:${node.side.visible}:${opacity === 1}`;
        if (node.signature !== signature) {
          node.signature = signature;
          this.drawProps(
            d.clear(),
            t,
            a,
            node.side.visible,
            pile !== null,
            opacity === 1,
          );
        }
      }
    for (const item of s.items.filter(
      (i) =>
        !i.holder &&
        tileAt(s, i.position)?.discovered &&
        !s.goblins.some(
          (g) =>
            g.drop?.item === i.id &&
            g.position.x === i.position.x &&
            g.position.y === i.position.y,
        ),
    )) {
      const a = project(item.position);
      let d = this.itemSprites.get(item.id);
      if (!d) {
        d = new Sprite();
        this.itemSprites.set(item.id, d);
        this.details.addChild(d);
      }
      const art = itemArt(item.resource, `${s.seed}-${item.id}`);
      d.texture = art ? this.texture(art) : Texture.WHITE;
      d.label = art ?? "item-bedkit-placeholder";
      d.scale.set(1);
      d.tint = art ? 0xffffff : resources[item.resource].color;
      d.width = art ? TILE_SIZE : 6 * LEGACY_ART_SCALE;
      d.height = art ? TILE_SIZE : 5 * LEGACY_ART_SCALE;
      d.position.set(
        a.x - (art ? HALF_TILE : 3 * LEGACY_ART_SCALE),
        a.y + (art ? 0 : 22 * LEGACY_ART_SCALE),
      );
      d.visible = true;
      d.zIndex = objectDepth(item.position) - 0.5;
    }
    for (const j of s.jobs.filter(
      (j) => j.status === "open" || j.status === "active",
    )) {
      const origin = project(j.target),
        a = { x: 0, y: 0 };
      o.context
        .save()
        .translate(origin.x, origin.y)
        .scale(LEGACY_ART_SCALE, LEGACY_ART_SCALE);
      o.rect(a.x - 14, a.y + 2, 28, 28).stroke({
        color:
          j.priority === 3
            ? 0xf1c36b
            : j.priority === 1
              ? 0x899caa
              : j.kind === "dig"
                ? 0xe1b66a
                : 0x7dc8be,
        width: 1,
      });
      for (let dot = 0; dot < j.priority; dot++)
        o.circle(a.x - 9 + dot * 4, a.y + 6, 1).fill(0xe9d69e);
      if (j.progress)
        o.rect(a.x - 10, a.y + 29, Math.min(20, j.progress / 3), 2).fill(
          0xe1b66a,
        );
      o.context.restore();
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
      sprite.scale.set(LEGACY_ART_SCALE);
      sprite.position.set(
        a.x - frame.footX * LEGACY_ART_SCALE,
        a.y + ACTOR_FEET - frame.footY * LEGACY_ART_SCALE,
      );
      sprite.zIndex = actorDepth(pose.position);
      sprite.alpha = g.activity === "Sleeping" ? 0.6 : 1;
      if (this.selectedActor === g.id)
        o.ellipse(
          a.x,
          a.y + ACTOR_FEET,
          12 * LEGACY_ART_SCALE,
          4 * LEGACY_ART_SCALE,
        ).stroke({
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
    origin: { x: number; y: number },
    sideVisible: boolean,
    hasPile: boolean,
    shade: boolean,
  ): void {
    if (shade && (t.solid || t.structure === "wall"))
      drawWallShading(d, origin, sideVisible);
    d.context
      .save()
      .translate(origin.x, origin.y)
      .scale(LEGACY_ART_SCALE, LEGACY_ART_SCALE);
    const a = { x: 0, y: 0 };
    if (t.stockpile) {
      const color = {
        all: 0xc1a46a,
        food: 0x81bca7,
        building: 0xb29260,
        valuables: 0xb6a4dc,
        crafted: 0x86b8cc,
      }[t.stockpileFilter];
      d.rect(a.x - 13, a.y + 3, 26, 26).stroke({ color, width: 1 });
    }
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
    if (
      !hasPile &&
      t.deposit &&
      !t.solid &&
      t.deposit !== "wood" &&
      t.deposit !== "food"
    ) {
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
    d.context.restore();
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
