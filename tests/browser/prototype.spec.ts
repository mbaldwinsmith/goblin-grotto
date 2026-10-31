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
