import type { Graphics } from "pixi.js";
import { features, type FeatureKind } from "../sim/content";
export function drawFeature(
  g: Graphics,
  kind: FeatureKind,
  a: { x: number; y: number },
): void {
  const x = a.x,
    y = a.y,
    c = features[kind].color;
  switch (kind) {
    case "grove":
      for (const dx of [-9, 0, 9]) {
        g.rect(x + dx - 1, y + 3, 2, 11).fill(0xc7d2ad);
        g.ellipse(x + dx, y + 3, 5, 3).fill(c);
      }
      break;
    case "ruin":
      g.rect(x - 12, y + 5, 24, 11).fill(0x5e6664);
      g.rect(x - 11, y - 13, 7, 25).fill(c);
      g.rect(x + 5, y - 8, 7, 20).fill(c);
      g.rect(x - 10, y - 14, 21, 5).fill(0xbbb5a0);
      break;
    case "mine":
      g.rect(x - 12, y - 9, 4, 25).fill(0x8e6c4a);
      g.rect(x + 8, y - 9, 4, 25).fill(0x8e6c4a);
      g.rect(x - 13, y - 12, 26, 5).fill(c);
      g.moveTo(x - 5, y + 4)
        .lineTo(x - 5, y + 21)
        .moveTo(x + 5, y + 4)
        .lineTo(x + 5, y + 21)
        .stroke({ color: 0x93978a, width: 2 });
      break;
    case "pond":
      g.ellipse(x, y + 11, 15, 10).fill(0x294e61);
      g.ellipse(x, y + 10, 11, 6).fill(c);
      g.moveTo(x - 7, y + 9)
        .lineTo(x + 4, y + 9)
        .stroke({ color: 0xa3c8bd, width: 1 });
      break;
    case "shrine":
      g.poly([
        x - 9,
        y + 15,
        x - 7,
        y - 12,
        x + 7,
        y - 15,
        x + 10,
        y + 15,
      ]).fill(c);
      g.rect(x - 5, y - 4, 3, 3).fill(0x50584c);
      g.rect(x + 3, y - 4, 3, 3).fill(0x50584c);
      g.moveTo(x - 3, y + 6)
        .lineTo(x + 5, y + 6)
        .stroke({ color: 0x626951, width: 1 });
      break;
    case "den":
      g.ellipse(x, y + 10, 14, 9).fill(0x73604c);
      g.ellipse(x, y + 9, 11, 6).fill(0x1b282b);
      g.moveTo(x + 7, y + 13)
        .lineTo(x + 13, y + 18)
        .moveTo(x + 3, y + 14)
        .lineTo(x + 8, y + 20)
        .stroke({ color: c, width: 1 });
      break;
    case "undergrowth":
      g.moveTo(x - 8, y + 13)
        .lineTo(x - 11, y + 4)
        .moveTo(x - 8, y + 13)
        .lineTo(x - 3, y + 7)
        .moveTo(x + 4, y + 15)
        .lineTo(x + 1, y + 4)
        .moveTo(x + 4, y + 15)
        .lineTo(x + 10, y + 7)
        .stroke({ color: c, width: 2 });
      break;
    case "approach":
      g.rect(x - 5, y, 10, 24).fill(0x817b62);
      g.moveTo(x - 2, y + 7)
        .lineTo(x + 2, y + 7)
        .moveTo(x - 2, y + 18)
        .lineTo(x + 2, y + 18)
        .stroke({ color: c, width: 2 });
      break;
    case "entrance":
      g.rect(x - 14, y - 7, 4, 23).fill(c);
      g.rect(x + 10, y - 7, 4, 23).fill(c);
      g.rect(x - 14, y - 10, 28, 4).fill(0xb0bca0);
      break;
  }
}
