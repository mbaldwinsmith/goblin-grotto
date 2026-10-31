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
  await expect(page.locator("#notice")).toContainText("saved");
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
  await expect(page.locator("#notice")).toContainText("saved");
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
  await page.getByRole("button", { name: "Stockpile", exact: false }).click();
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
  await expect(page.locator(".goblin img")).toHaveCount(0);
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
      timeout: 12000,
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
    timeout: 12000,
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
