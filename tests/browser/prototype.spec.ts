import { expect, test } from "@playwright/test";
test("playable colony, input, persistence, import validation, screenshot", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Mushroom patch" }).click();
  await page.locator("#tile-x").fill("30");
  await page.locator("#tile-y").fill("29");
  await page.getByRole("button", { name: "Apply tool" }).click();
  await expect(page.locator("#notice")).toContainText("planned");
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect(page.locator("#tile-name")).toHaveText("farm", {
    timeout: 15000,
  });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page
    .getByRole("button", { name: "Inspect", exact: false })
    .first()
    .click();
  await page.locator("#tile-x").fill("30");
  await page.locator("#tile-y").fill("29");
  await page.getByRole("button", { name: "Apply tool" }).click();
  await expect(page.locator("#tile-name")).toHaveText("farm");
  await page.locator("#import").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(page.locator("#notice")).toContainText("damaged");
  await expect(page.locator("#tile-name")).toHaveText("farm");
  await page.getByRole("button", { name: "How to play" }).click();
  await expect(page.locator("#help")).toBeVisible();
  await page.getByRole("button", { name: "Into the grotto" }).click();
  await page.locator("canvas").hover();
  await page.mouse.wheel(0, -200);
  await page.locator("canvas").focus();
  await page.keyboard.press("Home");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.screenshot({
    path: "docs/screenshots/prototype.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("projection comparison scenes support floor and item picking", async ({
  page,
}) => {
  await page.goto("/projection-study.html");
  await page.locator("#iso").click({ position: { x: 270, y: 150 } });
  await expect(page.locator("#iso-result")).toContainText("Selected 2, 2");
  await page.locator("#oblique").click({ position: { x: 230, y: 180 } });
  await expect(page.locator("#oblique-result")).toContainText("Selected 2, 2");
  await page.locator("#iso").click({ position: { x: 278, y: 176 } });
  await expect(page.locator("#iso-result")).toContainText("Selected 3, 3");
  await page.locator("#oblique").click({ position: { x: 280, y: 224 } });
  await expect(page.locator("#oblique-result")).toContainText("Selected 3, 3");
  await page.screenshot({
    path: "docs/screenshots/projection-study.png",
    fullPage: true,
  });
});
test("digging yields a floor and portable saves import into a fresh browser profile", async ({
  page,
  browser,
}) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Dig", exact: false }).first().click();
  await page.locator("#tile-x").fill("30");
  await page.locator("#tile-y").fill("23");
  await page.getByRole("button", { name: "Apply tool" }).click();
  await expect(page.locator("#notice")).toContainText("planned");
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect(page.locator("#tile-name")).toHaveText("Cavern floor", {
    timeout: 20000,
  });
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export", exact: true }).click();
  const file = await (await download).path();
  expect(file).not.toBeNull();
  const context = await browser.newContext();
  const other = await context.newPage();
  await other.goto("http://127.0.0.1:5173");
  await expect(other.locator("canvas")).toBeVisible();
  await other.locator("#import").setInputFiles(file!);
  await expect(other.locator("#notice")).toContainText("restored");
  await other.getByRole("button", { name: "Pause", exact: true }).click();
  await other.locator("#tile-x").fill("30");
  await other.locator("#tile-y").fill("23");
  await other.getByRole("button", { name: "Apply tool" }).click();
  await expect(other.locator("#tile-name")).toHaveText("Cavern floor");
  await page.locator("canvas").hover();
  await page.mouse.down({ button: "right" });
  await page.mouse.move(800, 600);
  await page.mouse.up({ button: "right" });
  await page.mouse.wheel(0, -100);
  await context.close();
});
test("camera, entity inspection, drawer and drag tools work while paused and after resize", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#tile-x").focus();
  await page.keyboard.press("Tab");
  await expect(page.locator("#tile-y")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Apply tool" })).toBeFocused();
  await page.locator(".goblin").first().click();
  await expect(page.locator("#actor-inspection")).toContainText("Nib");
  const canvas = page.locator("canvas");
  const clickNib = async () => {
    const box = (await canvas.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2 - 12);
    await expect(page.locator("#actor-inspection")).toContainText("Nib");
  };
  await clickNib();
  await canvas.focus();
  await page.keyboard.press("+");
  await clickNib();
  await page.setViewportSize({ width: 1280, height: 950 });
  await page.waitForTimeout(200);
  await clickNib();
  await page.getByRole("button", { name: "Reveal walls" }).click();
  await expect(page.locator("#reveal")).toHaveAttribute("aria-pressed", "true");
  await page.locator("#chronicle summary").click();
  await expect(page.locator("#chronicle")).not.toHaveAttribute("open", "");
  await page.locator("#chronicle summary").click();
  await expect(page.locator("#chronicle")).toHaveAttribute("open", "");
  // Home anchors the camera at 32,30. Paint a three-tile stockpile on clear floor.
  await page.getByRole("button", { name: "Home", exact: false }).click();
  await canvas.focus();
  await page.getByRole("button", { name: /^▧ Stockpile/ }).click();
  const box = (await canvas.boundingBox())!;
  const cx = box.x + box.width / 2,
    cy = box.y + box.height / 2;
  await page.mouse.move(cx - 2 * 32, cy + 3 * 32);
  await page.mouse.down();
  await page.mouse.move(cx, cy + 3 * 32, { steps: 8 });
  await page.mouse.up();
  await page.mouse.move(cx - 3 * 32, cy + 3 * 32);
  await page.mouse.down();
  await page.keyboard.press("Escape");
  await page.mouse.move(cx - 3 * 32, cy + 4 * 32);
  await page.mouse.up();

  await expect(page.locator("[data-tool=inspect]")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#tile-x").fill("31");
  await page.locator("#tile-y").fill("33");
  await page.getByRole("button", { name: "Apply tool" }).click();
  await expect(page.locator("#inspection")).toContainText("Stockpile");
  await expect(page.locator("[data-tool=possess]")).toBeDisabled();
  await expect(page.locator("[data-tool=guard]")).toBeDisabled();
});
test("reveal mode selects a goblin behind a foreground wall", async ({
  page,
}) => {
  const { createGame } = await import("../../src/sim/world");
  const { position, tileAt } = await import("../../src/sim/model");
  const { encodeSave } = await import("../../src/persistence/save");
  const s = createGame("wall-picking");
  s.goblins[1].name = '"><img src=x onerror=alert(1)>';
  s.goblins[0].position = position(30, 30);
  for (let i = 1; i < 4; i++) s.goblins[i].position = position(34 + i, 30);
  tileAt(s, position(30, 31))!.structure = "wall";
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "wall.json",
    mimeType: "application/json",
    buffer: Buffer.from(encodeSave(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  await page.locator(".goblin").first().click();
  const box = (await page.locator("canvas").boundingBox())!;
  await expect(page.locator(".goblin img")).toHaveCount(4);
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2 + 3;
  await page.mouse.click(x, y);
  await expect(page.locator("#tile-name")).toHaveText("wall");
  await expect(page.locator("#actor-inspection")).toBeEmpty();
  await page.getByRole("button", { name: "Reveal walls" }).click();
  await page.mouse.click(x, y);
  await expect(page.locator("#actor-inspection")).toContainText("Nib");
});
test("scouting uncovers a landmark without leaking fog, and v1 saves still resume work", async ({
  page,
}) => {
  // This scenario runs several real-time trips; software WebGL in hosted CI can
  // render slowly enough that the fixed-step clock deliberately drops catch-up.
  test.setTimeout(120_000);
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const coords = async (x: number, y: number) => {
    await page.locator("#tile-x").fill(String(x));
    await page.locator("#tile-y").fill(String(y));
    await page.getByRole("button", { name: "Apply tool" }).click();
  };
  await coords(26, 27);
  await expect(page.locator("#discovery-inspection")).toContainText(
    /Lanterncap|Forgotten|Crooked/,
  );
  await coords(44, 36);
  await expect(page.locator("#tile-name")).toHaveText("Unexplored");
  await expect(page.locator("#discovery-inspection")).toBeEmpty();
  await expect(page.locator("#inspection")).not.toContainText(
    /Bedrock|Iron|Den|Pool/,
  );
  await page.getByRole("button", { name: "Explore", exact: false }).click();
  for (const [x, y] of [
    [38, 31],
    [41, 31],
    [44, 31],
    [44, 34],
  ]) {
    await coords(x, y);
    await expect(page.locator("#notice")).toContainText("planned");
    await page.getByRole("button", { name: "4×", exact: true }).click();
    await expect(page.locator("#inspection")).not.toContainText("explore:", {
      timeout: 30000,
    });
  }
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator(".goblin").last().click();
  await page
    .getByRole("button", { name: "Inspect", exact: false })
    .first()
    .click();
  await coords(44, 36);
  await expect(page.locator("#discovery-inspection")).toContainText(
    /delver|Whispering|beast den/,
  );
  await expect(page.locator("#events")).toContainText("Discovered");
  await page.screenshot({
    path: "docs/screenshots/discovery.png",
    fullPage: true,
  });
  const { readFileSync } = await import("node:fs");
  const { gunzipSync } = await import("node:zlib");
  await page.locator("#import").setInputFiles({
    name: "old-save.json",
    mimeType: "application/json",
    buffer: gunzipSync(readFileSync("tests/fixtures/v1-active-colony.json.gz")),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  await coords(30, 29);
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect(page.locator("#tile-name")).toHaveText("farm", {
    timeout: 30000,
  });
});
test("all separate native art files decode as 32x32 images", async ({
  page,
}) => {
  await page.goto("/art-preview.html");
  await expect(page.locator("img")).toHaveCount(29);
  await expect
    .poll(() =>
      page
        .locator("img")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image instanceof HTMLImageElement &&
              image.complete &&
              image.naturalWidth === 32 &&
              image.naturalHeight === 32,
          ),
        ),
    )
    .toBe(true);
  await page.screenshot({
    path: "docs/screenshots/art-preview.png",
    fullPage: true,
  });
});
test("the supplied padded goblin walk animates only during movement and freezes on pause", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Explore", exact: false }).click();
  await page.locator("#tile-x").fill("38");
  await page.locator("#tile-y").fill("31");
  await page.getByRole("button", { name: "Apply tool" }).click();
  let movingActor: string | null = null;
  const readVisual = async () => {
    const visual = await page.locator("canvas").evaluate((canvas, actor) => {
      const scene = Reflect.get(canvas, "grottoScene");
      const entry = actor
        ? [actor, scene.goblinSprites.get(actor)]
        : [...scene.goblinSprites.entries()].find(([, sprite]) =>
            sprite.label.startsWith("walk-"),
          );
      const sprite = entry?.[1];
      return sprite
        ? {
            id: entry[0],
            label: sprite.label,
            width: sprite.texture.width,
            height: sprite.texture.height,
            x: sprite.x,
            y: sprite.y,
            scaleX: sprite.scale.x,
            scaleY: sprite.scale.y,
          }
        : null;
    }, movingActor);
    if (visual) movingActor = visual.id;
    return visual;
  };
  await expect(page.locator("#notice")).toContainText("planned");
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await expect.poll(async () => (await readVisual())?.label).toMatch(/^walk-/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await readVisual();
  expect([40, 44]).toContain(paused?.width);
  expect(paused?.scaleX).toBe(1);
  expect(paused?.scaleY).toBe(1);
  await page.waitForTimeout(350);
  expect(await readVisual()).toEqual(paused);
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(async () => (await readVisual())?.label, { timeout: 12000 })
    .toMatch(/^idle-/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect([40, 44]).toContain((await readVisual())?.width);
  await page.locator(".goblin").first().click();
  await page.locator("canvas").focus();
  await page.keyboard.press("+");
  await page.screenshot({
    path: "docs/screenshots/goblin-integration.png",
    fullPage: true,
  });
});
test("loose ceilings can be shored up, and weather/supports survive save-load", async ({
  page,
}) => {
  const { createGame } = await import("../../src/sim/world");
  const { position, tileAt } = await import("../../src/sim/model");
  const { warnOnExcavation } = await import("../../src/sim/stability");
  const { encodeSave } = await import("../../src/persistence/save");
  const s = createGame("environment-browser");
  s.weather = { kind: "rain", changedAt: 0 };
  for (const t of s.tiles) if (t.outside) t.discovered = true;
  tileAt(s, position(35, 30))!.material = "loose";
  warnOnExcavation(s, position(35, 30));
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "environment.json",
    mimeType: "application/json",
    buffer: Buffer.from(encodeSave(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  await expect(page.locator("#weather")).toContainText("Rain outside");
  const coords = async (x: number, y: number) => {
    await page.locator("#tile-x").fill(String(x));
    await page.locator("#tile-y").fill(String(y));
    await page.getByRole("button", { name: "Apply tool" }).click();
  };
  await coords(35, 30);
  await expect(page.locator("#inspection")).toContainText("Loose ceiling");
  await page.screenshot({
    path: "docs/screenshots/ceiling-warning.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Bed", exact: false }).first().click();
  await coords(35, 30);
  await expect(page.locator("#notice")).toContainText("support first");
  await page.getByRole("button", { name: "Support", exact: false }).click();
  await coords(34, 30);
  await expect(page.locator("#notice")).toContainText("planned");
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect(page.locator("#tile-name")).toHaveText("support", {
    timeout: 15000,
  });
  await page
    .getByRole("button", { name: "Inspect", exact: false })
    .first()
    .click();
  await coords(35, 30);
  await expect(page.locator("#inspection")).not.toContainText("Loose ceiling");
  await expect(page.locator("#events")).toContainText("shored up");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await coords(34, 30);
  await expect(page.locator("#tile-name")).toHaveText("support");
  await expect(page.locator("#weather")).toContainText("Rain outside");
  await coords(54, 31);
  await page.screenshot({
    path: "docs/screenshots/environment.png",
    fullPage: true,
  });
});

test("goblin identity and facing survive import, selection and reload", async ({
  page,
}) => {
  const { createGame } = await import("../../src/sim/game");
  const s = createGame("goblin-identities");
  s.goblins[0].facing = "west";
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "identities.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await page.locator("#goblins > button").first().click();
  await expect(page.locator("#actor-inspection")).toContainText(
    "Common goblin · Facing west",
  );
  const texture = await page.locator("canvas").evaluate((canvas) => {
    const scene = (
      canvas as HTMLCanvasElement & {
        grottoScene: {
          goblinSprites: Map<string, { label: string }>;
        };
      }
    ).grottoScene;
    return scene.goblinSprites.get("goblin-1")?.label;
  });
  expect(texture).toBe("idle-west-000");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#goblins > button").first().click();
  await expect(page.locator("#actor-inspection")).toContainText(
    "Common goblin · Facing west",
  );
});

test("four scouts pass through a narrow entrance without stacking", async ({
  page,
}) => {
  test.setTimeout(60000);
  const { createGame } = await import("../../src/sim/game");
  const s = createGame("entrance-traffic");
  for (const t of s.tiles) {
    t.solid = true;
    t.discovered = true;
    t.feature = null;
    t.structure = null;
    t.stockpile = false;
  }
  for (let x = 27; x <= 38; x++) {
    const t = s.tiles[30 * 64 + x];
    t.solid = false;
    t.material = "hard";
  }
  s.items.forEach((i) => {
    i.position = { x: 27, y: 30, z: 0 };
  });
  s.tiles[30 * 64 + 27].stockpile = true;
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "traffic.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Explore", exact: false }).click();
  for (const x of [34, 35, 36, 37]) {
    await page.locator("#tile-x").fill(String(x));
    await page.locator("#tile-y").fill("30");
    await page.getByRole("button", { name: "Apply tool" }).click();
    await expect(page.locator("#notice")).toContainText("planned");
  }
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(
      () =>
        page.locator("canvas").evaluate((canvas) => {
          const scene = Reflect.get(canvas, "grottoScene"),
            state = scene.world;
          const occupied = new Set(
            state.goblins.map(
              (g: { position: { x: number; y: number } }) =>
                `${g.position.x},${g.position.y}`,
            ),
          );
          if (occupied.size !== 4) throw new Error("Goblins overlapped");
          return state.jobs.filter(
            (j: { kind: string; status: string }) =>
              j.kind === "explore" && j.status === "done",
          ).length;
        }),
      { timeout: 15000 },
    )
    .toBe(4);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page
    .getByRole("button", { name: "Reveal walls", exact: false })
    .click();
  await page.screenshot({
    path: "docs/screenshots/traffic.png",
    fullPage: true,
  });
});

test("loaded idle/walk and drop clips follow the held item, pause and saved release tick", async ({
  page,
}) => {
  test.setTimeout(60000);
  test.setTimeout(90000);
  const { createGame } = await import("../../src/sim/game");
  const s = createGame("cardinal-haul");
  s.tick = 100;
  const g = s.goblins[0];
  g.facing = "east";
  g.nextMoveAt = 108;
  s.goblins.slice(1).forEach((actor, i) => {
    actor.position = { x: 28 + i, y: 33, z: 0 };
  });
  for (let x = 28; x <= 35; x++) {
    const t = s.tiles[30 * 64 + x];
    t.solid = false;
    t.material = "hard";
    t.feature = null;
  }
  const item = {
    id: `item-${s.nextId++}` as const,
    resource: "stone" as const,
    quantity: 3,
    position: { ...g.position },
    holder: g.id,
    stored: false,
  };
  s.items.push(item);
  g.carrying = item.id;
  const target = { x: 35, y: 30, z: 0 } as const;
  s.tiles[30 * 64 + 35].stockpile = true;
  const job = {
    id: `job-${s.nextId++}` as const,
    kind: "haul" as const,
    priority: 2 as const,
    target,
    item: item.id,
    structure: null,
    worker: g.id,
    status: "active" as const,
    progress: 0,
    reason: "Hauling",
    paid: false,
    paidWithKit: false,
  };
  s.jobs.push(job);
  g.job = job.id;
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "hauling.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  const read = () =>
    page.locator("canvas").evaluate((canvas, itemId) => {
      const scene = Reflect.get(canvas, "grottoScene"),
        state = scene.world,
        g = state.goblins[0],
        item = state.items.find((i: { id: string }) => i.id === itemId),
        sprite = scene.goblinSprites.get(g.id);
      return {
        label: sprite.label,
        tick: state.tick,
        drop: g.drop,
        holder: item?.holder,
        stored: item?.stored,
        quantity: item?.quantity,
        job: state.jobs.find((j: { item: string }) => j.item === itemId)
          ?.status,
        scale: sprite.scale.x,
        duplicates: state.items.filter((i: { id: string }) => i.id === itemId)
          .length,
      };
    }, item.id);
  // Pause on the same page frame as the observed phase; a host-side click can
  // arrive after the short animation has already recovered on software renderers.
  const pauseDrop = (released: boolean) =>
    page.waitForFunction(
      ({ actorId, itemId, released }) => {
        const canvas = document.querySelector("canvas");
        if (!canvas) return false;
        const state = Reflect.get(canvas, "grottoScene")?.world;
        const worker = state?.goblins.find(
          (g: { id: string }) => g.id === actorId,
        );
        const cargo = state?.items.find((i: { id: string }) => i.id === itemId);
        if (
          !worker?.drop ||
          !cargo ||
          (released
            ? cargo.holder !== null || !cargo.stored
            : cargo.holder !== actorId)
        )
          return false;
        document
          .querySelector<HTMLButtonElement>('button[data-speed="0"]')
          ?.click();
        return true;
      },
      { actorId: g.id, itemId: item.id, released },
      { polling: "raf", timeout: 30000 },
    );
  await expect
    .poll(async () => (await read()).label)
    .toBe("haul-idle-east-000");
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await expect
    .poll(async () => (await read()).label, { intervals: [20, 40, 60] })
    .toMatch(/^haul-idle-east-00[1-7]$/);
  await expect
    .poll(async () => (await read()).label, { intervals: [20, 40, 60] })
    .toMatch(/^haul-walk-east-/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const frozen = await read();
  expect(frozen.holder).toBe(g.id);
  expect(frozen.scale).toBe(1);
  await page.waitForTimeout(250);
  expect(await read()).toEqual(frozen);
  await page.screenshot({
    path: "docs/screenshots/hauling.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await pauseDrop(false);
  const windup = await read();
  expect(windup.holder).toBe(g.id);
  expect(windup.stored).toBe(false);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect((await read()).drop?.startedAt).toBe(windup.drop.startedAt);
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await pauseDrop(true);
  const released = await read();
  expect(released.label).toMatch(/^drop-east-00[5-8]$/);
  expect(released.stored).toBe(true);
  expect(released.duplicates).toBe(1);
  expect(released.quantity).toBe(3);
  expect(released.job).toBe("done");
  await page.screenshot({ path: "docs/screenshots/drop.png", fullPage: true });
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect.poll(async () => (await read()).label).toMatch(/^idle-east-/);
  expect((await read()).duplicates).toBe(1);
});

test("cardinal animation gallery decodes every clip and allows frame-by-frame review", async ({
  page,
}) => {
  await page.goto("/goblin-preview.html");
  await expect(page.locator("main img")).toHaveCount(40);
  await expect
    .poll(() =>
      page
        .locator("main img")
        .evaluateAll((images) =>
          images.every(
            (img) =>
              (img as HTMLImageElement).complete &&
              (img as HTMLImageElement).naturalWidth >= 32,
          ),
        ),
    )
    .toBe(true);
  await page.locator("#frame").focus();
  await page.keyboard.press("Home");
  for (let i = 0; i < 5; i++) await page.keyboard.press("ArrowRight");
  await expect(page.locator('img[alt="drop south"]')).toHaveAttribute(
    "src",
    /drop\/south\/005.png$/,
  );
  await expect(page.locator("#pause")).toHaveText("Play");
  await page.screenshot({
    path: "docs/screenshots/cardinal-animations.png",
    fullPage: true,
  });
});

test("work priority, worker preferences and choice reasons survive save/load", async ({
  page,
}) => {
  test.setTimeout(90000);
  const { createGame } = await import("../../src/sim/game");
  const s = createGame("work-choices");
  for (let y = 27; y <= 33; y++)
    for (let x = 27; x <= 38; x++) {
      const t = s.tiles[y * 64 + x];
      t.solid = false;
      t.feature = null;
      t.material = "hard";
    }
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "work.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await page.locator(".goblin").first().click();
  await page
    .getByLabel("Preferred work", { exact: true })
    .selectOption("build");
  await expect(page.locator("#notice")).toContainText("Preference updated");
  const camera = () =>
    page
      .locator("canvas")
      .evaluate((canvas) => ({ ...Reflect.get(canvas, "grottoScene").camera }));
  const before = await camera();
  await page.getByLabel("New work priority", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  expect(await camera()).toEqual(before);
  await page.getByLabel("New work priority", { exact: true }).selectOption("3");
  await page.getByRole("button", { name: "Bed", exact: false }).click();
  const coords = async (x: number, y: number) => {
    await page.locator("#tile-x").fill(String(x));
    await page.locator("#tile-y").fill(String(y));
    await page.getByRole("button", { name: "Apply tool" }).click();
  };
  await coords(35, 29);
  await expect(page.getByLabel("Work priority", { exact: true })).toHaveValue(
    "3",
  );
  await page.getByLabel("New work priority", { exact: true }).selectOption("2");
  await coords(36, 29);
  await page
    .getByRole("button", { name: "Inspect", exact: false })
    .first()
    .click();
  await page.locator(".goblin").first().click();
  await page.getByRole("button", { name: "1×", exact: true }).click();
  await expect(page.locator("#choice-reason")).toContainText("High priority");
  await expect(page.locator("#choice-reason")).toContainText("preferred work");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const read = () =>
    page.locator("canvas").evaluate((canvas) => {
      const state = Reflect.get(canvas, "grottoScene").world;
      return {
        worker: state.jobs.find(
          (j: { target: { x: number } }) => j.target.x === 35,
        )?.worker,
        goblin: state.goblins[0].id,
        job: state.goblins[0].job,
      };
    });
  const chosen = await read();
  expect(chosen.worker).toBe(chosen.goblin);
  await page.screenshot({
    path: "docs/screenshots/work-choices.png",
    fullPage: true,
  });
  await page
    .getByLabel("Preferred work", { exact: true })
    .selectOption("harvest");
  expect(await read()).toEqual(chosen);
  await coords(36, 29);
  await page.getByLabel("Work priority", { exact: true }).selectOption("1");
  await expect(page.locator("#inspection")).toContainText("Low");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator(".goblin").first().click();
  await expect(page.getByLabel("Preferred work", { exact: true })).toHaveValue(
    "harvest",
  );
  await coords(36, 29);
  await expect(page.getByLabel("Work priority", { exact: true })).toHaveValue(
    "1",
  );
});

test("filtered stockpile areas sort physical goods, survive load and reroute after editing/removal", async ({
  page,
}) => {
  test.setTimeout(90000);
  const { createGame } = await import("../../src/sim/game");
  const s = createGame("filtered-storage");
  for (const t of s.tiles) t.stockpile = false;
  for (let y = 27; y <= 34; y++)
    for (let x = 27; x <= 39; x++) {
      const t = s.tiles[y * 64 + x];
      t.solid = false;
      t.material = "hard";
      t.feature = null;
      t.structure = null;
    }
  const wood = {
    id: `item-${s.nextId++}` as const,
    resource: "wood" as const,
    quantity: 6,
    position: { x: 28, y: 29, z: 0 as const },
    holder: null,
    stored: false,
  };
  const food = {
    id: `item-${s.nextId++}` as const,
    resource: "food" as const,
    quantity: 8,
    position: { x: 29, y: 29, z: 0 as const },
    holder: null,
    stored: false,
  };
  s.items = [wood, food];
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "stockpiles.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  const coords = async (x: number, y: number) => {
    await page.locator("#tile-x").fill(String(x));
    await page.locator("#tile-y").fill(String(y));
    await page.getByRole("button", { name: "Apply tool" }).click();
  };
  const inspect = async () => {
    await page
      .getByRole("button", { name: "Inspect", exact: false })
      .first()
      .click();
  };
  const read = () =>
    page.locator("canvas").evaluate(
      (canvas, ids) => {
        const state = Reflect.get(canvas, "grottoScene").world;
        return {
          items: ids.map((id) => {
            const i = state.items.find(
              (item: { id: string }) => item.id === id,
            );
            return {
              x: i.position.x,
              y: i.position.y,
              stored: i.stored,
              quantity: i.quantity,
              holder: i.holder,
            };
          }),
          unique: new Set(state.items.map((i: { id: string }) => i.id)).size,
          zones: state.tiles.filter((t: { stockpile: boolean }) => t.stockpile)
            .length,
          settled: state.goblins.every((g: { drop: unknown }) => !g.drop),
        };
      },
      [wood.id, food.id],
    );
  await page.getByRole("button", { name: /^▧ Stockpile/ }).click();
  await page
    .getByLabel("Goods for new stockpiles", { exact: true })
    .selectOption("food");
  for (const x of [34, 35, 36]) await coords(x, 29);
  await page
    .getByLabel("Goods for new stockpiles", { exact: true })
    .selectOption("building");
  await coords(35, 31);
  expect((await read()).zones).toBe(4);
  await inspect();
  await coords(34, 29);
  await expect(page.getByLabel("Accept goods", { exact: true })).toHaveValue(
    "food",
  );
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(
      async () => {
        const r = await read();
        return r.items.every((i) => i.stored) && r.settled;
      },
      { timeout: 20000 },
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const delivered = await read();
  expect(delivered.items[0]).toMatchObject({
    x: 35,
    y: 31,
    stored: true,
    quantity: 6,
  });
  expect(delivered.items[1]).toMatchObject({
    x: 34,
    y: 29,
    stored: true,
    quantity: 8,
  });
  expect(delivered.unique).toBe(2);
  await expect(page.locator("#stored-contents")).toContainText(
    "8 edible mushrooms",
  );
  await expect(
    page.locator("#resources > span").filter({ hasText: "wood" }),
  ).toHaveAttribute("title", /Stored 6 · Carried 0 · Loose 0/);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await coords(34, 29);
  await expect(page.getByLabel("Accept goods", { exact: true })).toHaveValue(
    "food",
  );
  await page
    .getByLabel("Accept goods", { exact: true })
    .selectOption("building");
  await expect(page.locator("#loose-goods")).toContainText(
    "8 edible mushrooms loose",
  );
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(
      async () => {
        const r = await read();
        return r.items[1].stored && r.items[1].x === 35 && r.settled;
      },
      { timeout: 20000 },
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: /^▧ Stockpile/ }).click();
  await page
    .getByLabel("Stockpile mode", { exact: true })
    .selectOption("remove");
  await coords(35, 31);
  await expect(
    page.getByLabel("Goods for new stockpiles", { exact: true }),
  ).toBeDisabled();
  expect((await read()).items[0].stored).toBe(false);
  await inspect();
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(
      async () => {
        const r = await read();
        return (
          r.items[0].stored &&
          r.items[0].x === 34 &&
          r.items[0].y === 29 &&
          r.settled
        );
      },
      { timeout: 20000 },
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await coords(34, 29);
  await expect(page.locator("#stored-contents")).toContainText("6 wood");
  expect((await read()).unique).toBe(2);
  await page.screenshot({
    path: "docs/screenshots/stockpiles.png",
    fullPage: true,
  });
});

test("native pick and axe swings freeze while paused and resume their work once after load", async ({
  page,
}) => {
  const { createGame, dispatch, step } = await import("../../src/sim/game");
  const { position, tileAt } = await import("../../src/sim/model");
  const s = createGame("tool-browser");
  for (const t of s.tiles) {
    t.solid = false;
    t.discovered = true;
    t.material = "hard";
    t.deposit = null;
    t.feature = null;
    t.structure = null;
    t.stockpile = false;
    t.collapseAt = null;
  }
  s.items = [];
  s.jobs = [];
  s.goblins.forEach((g, i) => {
    g.position = position(i < 2 ? 30 + i * 4 : 10 + i, i < 2 ? 30 : 10);
  });
  tileAt(s, position(31, 30))!.solid = true;
  tileAt(s, position(31, 30))!.material = "sand";
  tileAt(s, position(34, 29))!.deposit = "wood";
  dispatch(s, { type: "designate", tool: "dig", position: position(31, 30) });
  dispatch(s, {
    type: "designate",
    tool: "harvest",
    position: position(34, 29),
  });
  for (let n = 0; n < 5; n++) step(s);
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "tool-windup.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  const read = () =>
    page.locator("canvas").evaluate((canvas) => {
      const scene = Reflect.get(canvas, "grottoScene"),
        state = scene.world;
      return {
        tick: state.tick,
        labels: ["goblin-1", "goblin-2"].map(
          (id) => scene.goblinSprites.get(id)?.label,
        ),
        progress: state.jobs
          .filter(
            (j: { kind: string }) => j.kind === "dig" || j.kind === "harvest",
          )
          .map((j: { progress: number }) => j.progress),
        done: state.jobs.filter((j: { status: string }) => j.status === "done")
          .length,
        items: state.items.map(
          (i: { id: string; resource: string; quantity: number }) => ({
            id: i.id,
            resource: i.resource,
            quantity: i.quantity,
          }),
        ),
      };
    });
  await expect
    .poll(async () => (await read()).labels)
    .toEqual(["mine-east-001", "chop-north-001"]);
  const before = await read();
  await page.waitForTimeout(250);
  expect(await read()).toEqual(before);
  expect(before.progress).toEqual([0, 0]);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.screenshot({
    path: "docs/screenshots/mining-chopping.png",
    fullPage: true,
  });
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(async () => (await read()).done, { timeout: 15000 })
    .toBe(2);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const result = await read();
  expect(result.items).toHaveLength(2);
  expect(new Set(result.items.map((i: { id: string }) => i.id)).size).toBe(2);
  expect(result.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ resource: "stone", quantity: 2 }),
      expect.objectContaining({ resource: "wood", quantity: 5 }),
    ]),
  );
});

test("new scenery keeps native tree anchors, growth pairs, canopy picking, item identity and save continuity", async ({
  page,
}) => {
  test.setTimeout(60000);
  const { createGame } = await import("../../src/sim/game");
  const { position, tileAt } = await import("../../src/sim/model");
  const s = createGame("native-scenery");
  for (const t of s.tiles) t.stockpile = false;
  for (let y = 25; y <= 34; y++)
    for (let x = 27; x <= 39; x++) {
      const t = tileAt(s, position(x, y))!;
      Object.assign(t, {
        solid: false,
        discovered: true,
        outside: false,
        material: "hard",
        deposit: null,
        feature: null,
        structure: null,
        collapseAt: null,
      });
    }
  tileAt(s, position(30, 28))!.material = "sand";
  Object.assign(tileAt(s, position(29, 28))!, {
    material: "sand",
    solid: true,
  });
  s.goblins.forEach((g, i) => {
    g.position = [
      position(32, 29),
      position(32, 31),
      position(28, 30),
      position(28, 31),
    ][i];
  });
  tileAt(s, position(32, 30))!.deposit = "wood";
  tileAt(s, position(36, 30))!.deposit = "wood";
  tileAt(s, position(36, 30))!.discovered = false;
  [0, 250, 600].forEach((growth, i) => {
    Object.assign(tileAt(s, position(29 + i, 32))!, {
      structure: "farm",
      growth,
    });
  });
  s.items = (
    [
      "food",
      "wood",
      "stone",
      "ore",
      "iron",
      "copper",
      "gold",
      "gems",
      "bedkit",
    ] as const
  ).map((resource, i) => ({
    id: `item-${s.nextId++}` as const,
    resource,
    quantity: 3,
    position: position(29 + i, 33),
    holder: null,
    stored: false,
  }));
  s.jobs = [];
  await page.goto("/");
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.locator("#import").setInputFiles({
    name: "native-scenery.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(s)),
  });
  await expect(page.locator("#notice")).toContainText("restored");
  const read = () =>
    page.locator("canvas").evaluate((canvas) => {
      const scene = Reflect.get(canvas, "grottoScene"),
        world = scene.world,
        tree = scene.tiles.get(30 * 64 + 32)?.plant;
      const point = { x: 32 * 32 + 16, y: 29 * 32 + 12 },
        r = canvas.getBoundingClientRect();
      return {
        tree: tree
          ? {
              label: tree.label,
              x: tree.x,
              y: tree.y,
              width: tree.width,
              height: tree.height,
              scaleX: tree.scale.x,
              scaleY: tree.scale.y,
              alpha: tree.alpha,
              visible: tree.visible,
              depth: tree.zIndex,
            }
          : null,
        backings: [
          scene.tiles.get(28 * 64 + 30)?.underFloor,
          scene.tiles.get(28 * 64 + 29)?.underTop,
          scene.tiles.get(28 * 64 + 29)?.underSide,
        ].map((sprite) => ({
          visible: sprite?.visible,
          width: sprite?.width,
          height: sprite?.height,
        })),
        hidden: scene.tiles.get(30 * 64 + 36)?.plant?.visible ?? false,
        farms: [29, 30, 31].map(
          (x) => scene.tiles.get(32 * 64 + x)?.plant?.label,
        ),
        items: world.items.map((i: { id: string; resource: string }) => ({
          id: i.id,
          resource: i.resource,
          label: scene.itemSprites.get(i.id)?.label,
        })),
        floor: scene.tiles.get(30 * 64 + 31)?.floor?.label,
        behind: scene.goblinSprites.get("goblin-1")?.zIndex,
        front: scene.goblinSprites.get("goblin-2")?.zIndex,
        point: {
          x:
            r.left +
            scene.app.screen.width / 2 +
            scene.camera.x +
            point.x * scene.camera.zoom,
          y:
            r.top +
            scene.app.screen.height / 2 +
            scene.camera.y +
            point.y * scene.camera.zoom,
        },
        jobs: world.jobs
          .filter((j: { kind: string }) => j.kind === "harvest")
          .map((j: { target: unknown; status: string }) => ({
            target: j.target,
            status: j.status,
          })),
      };
    });
  await expect.poll(async () => (await read()).tree?.label).toMatch(/^tree-/);
  const before = await read();
  expect(before.tree).toMatchObject({
    x: 32 * 32 - 32,
    y: 30 * 32 - 64,
    width: 96,
    height: 96,
    scaleX: 1,
    scaleY: 1,
    alpha: 1,
    visible: true,
  });
  expect(before.backings).toEqual(
    Array.from({ length: 3 }, () => ({ visible: true, width: 32, height: 32 })),
  );
  expect(before.hidden).toBe(false);
  expect(before.farms[0]).toMatch(/^lanterncap-farm-0[14]$/);
  expect(before.farms[1]).toMatch(/^lanterncap-farm-0[35]$/);
  expect(before.farms[2]).toMatch(/^lanterncap-farm-0[26]$/);
  expect(before.floor).toMatch(/^floor-smooth-stone-/);
  expect(before.items[0].label).toMatch(/^lanterncap-picked-/);
  expect(before.items[1].label).toMatch(/^item-wood-/);
  expect(before.behind).toBeLessThan(before.tree!.depth);
  expect(before.front).toBeGreaterThan(before.tree!.depth);
  await page.screenshot({
    path: "docs/screenshots/scenery-integration.png",
    fullPage: true,
  });
  await page.mouse.click(before.point.x, before.point.y);
  await expect(page.locator("#inspection")).toContainText("32, 30");
  await page
    .getByRole("button", { name: "Reveal walls", exact: false })
    .click();
  await page.mouse.click(before.point.x, before.point.y);
  await expect(page.locator("#actor-inspection")).toContainText("Nib");
  await expect.poll(async () => (await read()).tree?.alpha).toBe(0.25);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("#notice")).toHaveText(
    "Grotto saved in this browser.",
  );
  await page.reload();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Load", exact: true }).click();
  await expect(page.locator("#notice")).toContainText("restored");
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const loaded = await read();
  expect(loaded.tree?.label).toBe(before.tree?.label);
  expect(loaded.farms).toEqual(before.farms);
  expect(loaded.items).toEqual(before.items);
  await page
    .getByRole("button", { name: /Gather/ })
    .first()
    .click();
  await page.mouse.click(loaded.point.x, loaded.point.y);
  expect((await read()).jobs).toContainEqual({
    target: { x: 32, y: 30, z: 0 },
    status: "open",
  });
  await page.getByRole("button", { name: "4×", exact: true }).click();
  await expect
    .poll(
      async () =>
        (await read()).jobs.some(
          (j: { target: { x: number; y: number }; status: string }) =>
            j.target.x === 32 && j.target.y === 30 && j.status === "done",
        ),
      { timeout: 15000 },
    )
    .toBe(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  expect((await read()).tree?.visible).toBe(false);
  const wood = (await read()).items.filter(
    (i: { resource: string }) => i.resource === "wood",
  );
  expect(wood).toHaveLength(2);
  expect(new Set(wood.map((i: { id: string }) => i.id)).size).toBe(2);
  await page.goto("/scenery-preview.html");
  await expect(page.locator("main img")).toHaveCount(185);
  await expect
    .poll(() =>
      page.locator("main img").evaluateAll((images) =>
        images.every((img) => {
          const i = img as HTMLImageElement;
          return (
            i.complete &&
            i.naturalWidth === (i.alt.startsWith("tree-") ? 96 : 32) &&
            i.naturalHeight === i.naturalWidth
          );
        }),
      ),
    )
    .toBe(true);
  await page.screenshot({
    path: "docs/screenshots/scenery-gallery.png",
    fullPage: true,
  });
});
