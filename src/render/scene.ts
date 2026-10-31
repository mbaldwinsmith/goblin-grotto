import { drawFeature } from "./features";
import { Application, Container, Graphics, Sprite, Texture } from "pixi.js";
import { directions, type ActorId, type Position } from "../core/types";
import {
  type GameState,
  materials,
  position,
  tileAt,
  resources,
  deposits,
  walkable,
} from "../sim/model";
import { cameraFocus, cameraPan, cameraZoom, boundCamera } from "./camera";
import { actorDepth, objectDepth, inspectPoint } from "./picking";
import { type Camera, project, unproject } from "./projection";

/** Original 32x32 pixel sprites, drawn here so the prototype needs no remote assets. */
function goblinTexture(coat: string): Texture {
  const c = document.createElement("canvas");
  c.width = 32;
  c.height = 32;
  const ctx = c.getContext("2d")!;
  const rect = (x: number, y: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  };
  rect(8, 28, 18, 3, "#151e25");
  rect(9, 24, 5, 5, "#44352f");
  rect(20, 24, 5, 5, "#44352f");
  rect(9, 16, 15, 10, coat);
  rect(7, 18, 4, 7, "#83a75e");
  rect(23, 18, 4, 6, "#83a75e");
  rect(9, 6, 15, 13, "#8caf67");
  rect(4, 7, 6, 5, "#8caf67");
  rect(24, 7, 6, 5, "#8caf67");
  rect(6, 8, 4, 2, "#b0c47f");
  rect(24, 8, 4, 2, "#b0c47f");
  rect(12, 5, 10, 3, "#bec17c");
  rect(11, 10, 4, 4, "#e5dcb9");
  rect(20, 10, 4, 4, "#e5dcb9");
  rect(13, 11, 2, 3, "#212c26");
  rect(20, 11, 2, 3, "#212c26");
  rect(15, 14, 6, 3, "#698c51");
  rect(14, 18, 7, 1, "#344c35");
  rect(10, 24, 14, 2, "#5a473b");
  rect(16, 24, 3, 2, "#d6b569");
  return Texture.from(c, true);
}
export class Scene {
  app = new Application();
  root = new Container();
  ground = new Graphics();
  details = new Container();
  private tiles = new Map<number, Graphics>();
  private tileSignatures = new Map<number, string>();
  private itemSprites = new Map<string, Graphics>();
  private mapSize = { width: 64, height: 64 };
  selectedActor: ActorId | null = null;
  hoverActor: ActorId | null = null;
  reveal = false;
  scouting = false;
  overlay = new Graphics();

  camera: Camera = { x: 0, y: -420, zoom: 1.2 };
  selected: Position | null = null;
  hover: Position | null = null;
  private sprites: Sprite[] = [];
  private textures: Texture[] = [];
  async init(host: HTMLElement): Promise<void> {
    await this.app.init({
      resizeTo: host,
      background: 0x111b20,
      antialias: false,
      preference: "webgl",
      resolution: devicePixelRatio || 1,
      autoDensity: true,
    });
    host.append(this.app.canvas);
    this.app.canvas.setAttribute(
      "aria-label",
      "Grotto map. Use the tile coordinates and tools for keyboard actions.",
    );
    this.app.stage.addChild(this.root);
    this.root.addChild(this.ground, this.details, this.overlay);
    this.details.sortableChildren = true;
    this.textures = ["#8b614e", "#4f8580", "#ac8d50", "#79628f"].map(
      goblinTexture,
    );
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
  draw(s: GameState): void {
    this.root.position.set(
      this.app.screen.width / 2 + this.camera.x,
      this.app.screen.height / 2 + this.camera.y,
    );
    this.root.scale.set(this.camera.zoom);
    this.mapSize = { width: s.width, height: s.height };
    boundCamera(this.camera, this.mapSize);
    const g = this.ground.clear(),
      o = this.overlay.clear();
    for (const tile of this.tiles.values()) tile.visible = false;
    for (const item of this.itemSprites.values()) item.visible = false;
    const selectedGoblin = s.goblins.find((g) => g.id === this.selectedActor);
    if (selectedGoblin) this.selected = { ...selectedGoblin.position };
    for (let y = 0; y < s.height; y++)
      for (let x = 0; x < s.width; x++) {
        const p = position(x, y),
          t = tileAt(s, p)!;
        const a = project(p);
        if (!t.discovered) continue;
        const key = y * s.width + x;
        let d = this.tiles.get(key);
        if (!d) {
          d = new Graphics();
          this.tiles.set(key, d);
          this.details.addChild(d);
        }
        d.visible = true;
        const wall =
          t.solid || t.structure === "wall" || t.structure === "door";
        d.zIndex = objectDepth(p, wall);
        const occludes =
          selectedGoblin &&
          Math.abs(selectedGoblin.position.x - x) <= 1 &&
          y >= selectedGoblin.position.y &&
          y <= selectedGoblin.position.y + 1;
        d.alpha =
          (wall || t.deposit === "wood") && (this.reveal || occludes)
            ? 0.25
            : 1;
        if (!t.solid)
          g.rect(a.x - 16, a.y, 32, 24)
            .fill(t.outside ? 0x354d3e : (x + y) % 2 ? 0x343d43 : 0x374148)
            .stroke({ color: 0x263438, width: 0.5 });
        if (
          this.scouting &&
          walkable(t) &&
          directions.some((dir) => {
            const next = tileAt(s, position(x + dir.x, y + dir.y));
            return next && !next.discovered;
          })
        )
          o.ellipse(a.x, a.y + 12, 2, 2).fill(0x91ccb1);
        const signature = `${t.material}:${t.solid}:${t.stockpile}:${t.deposit}:${t.feature}:${t.structure}:${t.growth >= 600}`;
        if (this.tileSignatures.get(key) === signature) continue;
        this.tileSignatures.set(key, signature);
        d.clear();
        const color = t.solid
          ? materials[t.material].color
          : t.outside
            ? 0x354d3e
            : (x + y) % 2
              ? 0x343d43
              : 0x374148;
        // JRPG three-quarter view: axis-aligned floors, raised wall tops and
        // vertical front faces. North/south movement stays vertical on screen.
        if (t.solid) {
          d.rect(a.x - 16, a.y - 14, 32, 24)
            .fill(color)
            .stroke({ color: 0x26343b, width: 0.5 });
          d.rect(a.x - 16, a.y + 10, 32, 14).fill(0x2a343e);
          d.moveTo(a.x - 15, a.y + 11)
            .lineTo(a.x + 15, a.y + 11)
            .stroke({ color: 0x56616a, width: 1 });
        }
        if (t.stockpile)
          d.rect(a.x - 12, a.y + 4, 24, 16).stroke({
            color: 0xc1a46a,
            width: 1,
          });
        if (t.feature && !t.solid) drawFeature(d, t.feature, a);
        if (t.deposit && t.solid) {
          const color = resources[deposits[t.deposit].resource].color;
          d.rect(a.x - 9, a.y - 7, 4, 3).fill(color);
          d.rect(a.x + 2, a.y - 2, 5, 3).fill(color);
          d.rect(a.x + 7, a.y + 14, 3, 3).fill(color);
        }
        if (t.deposit && !t.solid) {
          if (t.deposit === "wood") {
            d.rect(a.x - 2, a.y - 14, 4, 22).fill(0x786147);
            d.poly([a.x, a.y - 31, a.x - 12, a.y - 8, a.x + 12, a.y - 8]).fill(
              0x567154,
            );
            d.poly([a.x, a.y - 22, a.x - 14, a.y, a.x + 14, a.y]).fill(
              0x43664d,
            );
          } else if (t.deposit === "food") {
            d.rect(a.x - 1, a.y + 2, 2, 6).fill(0xcbc3a4);
            d.ellipse(a.x, a.y + 2, 5, 3).fill(0x81bca7);
          }
        }
        if (
          t.deposit &&
          !t.solid &&
          t.deposit !== "wood" &&
          t.deposit !== "food"
        ) {
          const color = resources[deposits[t.deposit].resource].color;
          if (t.deposit === "masonry") {
            d.rect(a.x - 10, a.y + 5, 10, 6).fill(color);
            d.rect(a.x + 1, a.y + 10, 11, 5).fill(0xb0b0a0);
          } else {
            d.poly([
              a.x - 10,
              a.y + 14,
              a.x - 6,
              a.y + 7,
              a.x,
              a.y + 12,
              a.x + 7,
              a.y + 8,
              a.x + 12,
              a.y + 17,
            ]).fill(color);
          }
        }
        if (t.structure === "bed") {
          d.roundRect(a.x - 9, a.y, 18, 9, 1).fill(0x8c7253);
          d.rect(a.x - 7, a.y + 1, 5, 6).fill(0xdacda1);
          d.rect(a.x - 1, a.y + 1, 9, 6).fill(0x648d83);
        }
        if (t.structure === "farm") {
          d.rect(a.x - 13, a.y + 3, 26, 18).fill(0x5a5840);
          for (let i = 0; i < 3; i++) {
            d.rect(a.x - 7 + i * 7, a.y + 4, 2, 5).fill(0xc2c59c);
            d.ellipse(a.x - 6 + i * 7, a.y + 4, 3, 2).fill(
              t.growth >= 600 ? 0xc8e8a0 : 0x739f88,
            );
          }
        }
        if (t.structure === "workshop") {
          d.rect(a.x - 12, a.y - 3, 24, 11).fill(0x997a55);
          d.rect(a.x - 9, a.y + 8, 3, 5).fill(0x5c4b3e);
          d.rect(a.x + 7, a.y + 8, 3, 5).fill(0x5c4b3e);
          d.rect(a.x - 4, a.y - 7, 8, 5).fill(0x667d84);
        }
        if (t.structure === "wall" || t.structure === "door")
          d.rect(a.x - 12, a.y - 14, 24, 26).fill(
            t.structure === "wall" ? 0x737c80 : 0x8c7253,
          );
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
      d.rect(a.x - 3, a.y + 5, 6, 4).fill(resources[item.resource].color);
    }
    for (const j of s.jobs.filter(
      (j) => j.status === "open" || j.status === "active",
    )) {
      const a = project(j.target);
      o.rect(a.x - 13, a.y + 3, 26, 18).stroke({
        color: j.kind === "dig" ? 0xe1b66a : 0x7dc8be,
        width: 1,
      });
      if (j.progress)
        o.rect(a.x - 8, a.y + 22, Math.min(16, j.progress / 3), 2).fill(
          0xe1b66a,
        );
    }
    s.goblins.forEach((g, i) => {
      let sprite = this.sprites[i];
      if (!sprite) {
        sprite = new Sprite(this.textures[i % 4]);
        sprite.anchor.set(0.5, 0.9);
        sprite.texture.source.scaleMode = "nearest";
        this.details.addChild(sprite);
        this.sprites[i] = sprite;
      }
      const a = project(g.position);
      sprite.position.set(
        a.x,
        a.y + 17 + (g.job ? Math.floor(s.tick / 3) % 2 : 0),
      );
      sprite.zIndex = actorDepth(g.position);
      sprite.alpha = g.activity === "Sleeping" ? 0.6 : 1;
      if (
        this.selected &&
        g.position.x === this.selected.x &&
        g.position.y === this.selected.y
      )
        o.ellipse(a.x, a.y + 18, 12, 5).stroke({ color: 0xe9d69e, width: 1 });
    });
    for (const [id, item] of this.itemSprites)
      if (!item.visible) {
        item.destroy();
        this.itemSprites.delete(id);
      }
    this.details.sortChildren();
    for (const p of [this.hover, this.selected])
      if (p) {
        const a = project(p);
        o.rect(a.x - 16, a.y, 32, 24).stroke({
          color: p === this.selected ? 0xf3d59b : 0xa5c9bb,
          width: 1.5,
        });
      }
  }
  reset(): void {
    this.camera.zoom = 1.2;
    this.focus(position(32, 30));
  }
  focus(p: Position): void {
    cameraFocus(this.camera, p, this.mapSize);
  }
  pan(dx: number, dy: number): void {
    cameraPan(this.camera, dx, dy, this.mapSize);
  }
  zoom(factor: number, client?: { x: number; y: number }): void {
    const rect = this.app.canvas.getBoundingClientRect();
    cameraZoom(
      this.camera,
      factor,
      this.mapSize,
      client
        ? {
            x: client.x - rect.left - this.app.screen.width / 2,
            y: client.y - rect.top - this.app.screen.height / 2,
          }
        : { x: 0, y: 0 },
    );
  }
  inspect(s: GameState, clientX: number, clientY: number) {
    const rect = this.app.canvas.getBoundingClientRect();
    return inspectPoint(
      s,
      (clientX - rect.left - this.app.screen.width / 2 - this.camera.x) /
        this.camera.zoom,
      (clientY - rect.top - this.app.screen.height / 2 - this.camera.y) /
        this.camera.zoom,
      this.reveal,
    );
  }
}
