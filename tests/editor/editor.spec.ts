import { test, expect, type Page, type TestInfo } from "../browser";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
async function upload(page: Page, name = "editing-practice.pdf", folder = "public/samples") {
  await page.goto("/edit-pdf");
  await page.locator("input[type=file]").setInputFiles(resolve(folder, name));
  await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
}
async function choose(page: Page, match: string) {
  const select = page.getByRole("combobox", { name: "Select existing text", exact: true });
  await expect(select.locator("option").filter({ hasText: match })).toHaveCount(1);
  await select.selectOption(
    (await select.locator("option").filter({ hasText: match }).getAttribute("value"))!,
  );
}
async function apply(page: Page, text: string) {
  await page.getByLabel("Replacement text", { exact: true }).fill(text);
  await page.getByRole("button", { name: "Apply text replacement", exact: true }).click();
  await expect(page.getByRole("button", { name: "Process", exact: true })).toBeEnabled();
}
async function output(page: Page, info: TestInfo, kind: string) {
  await page.getByRole("button", { name: "Process", exact: true }).click();
  const link = page.getByRole("link", { name: "Download", exact: true });
  await expect(link).toBeVisible();
  const pending = page.waitForEvent("download");
  await link.click();
  const d = await pending,
    path = info.outputPath(d.suggestedFilename());
  await d.saveAs(path);
  const proof = execFileSync("python3", ["tests/editor/verify.py", kind, path], {
    encoding: "utf8",
  });
  console.log(proof);
  await info.attach("download-proof.json", { body: proof, contentType: "application/json" });
}
test("real text replacement, exact preview, style, position and undo/redo preserve mixed pages", async ({
  page,
}, info) => {
  const privacyLeaks: string[] = [];
  page.context().on("request", (request) => {
    const payload = request.url() + " " + (request.postData() || "");
    if (
      request.method() !== "GET" ||
      payload.includes("Invoice Total 99.00") ||
      payload.includes("%PDF-")
    )
      privacyLeaks.push(request.method() + " " + request.url());
  });
  await upload(page);
  await choose(page, "Invoice Total");
  await page.getByLabel("Existing text color", { exact: true }).fill("#ff0000");
  await page.getByLabel("Existing horizontal position (%)", { exact: true }).fill("20");
  await apply(page, "Invoice Total 99.00");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Replacement text", { exact: true })).toHaveValue(
    "Invoice Total 125.00",
  );
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.getByLabel("Replacement text", { exact: true })).toHaveValue(
    "Invoice Total 99.00",
  );
  await expect(page.getByRole("button", { name: "Process", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByRole("group", { name: "PDF editor page 2", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Previous page", exact: true }).click();
  await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
  await page.screenshot({ path: info.outputPath("native-text-preview.png"), fullPage: true });
  await output(page, info, "native");
  expect(privacyLeaks).toEqual([]);
});
test("existing deletion removes the selected object without whiteout", async ({ page }, info) => {
  await upload(page);
  await choose(page, "Invoice Total");
  await page.getByRole("button", { name: "Delete existing text", exact: true }).click();
  await expect(page.getByRole("button", { name: "Process", exact: true })).toBeEnabled();
  await output(page, info, "delete");
});
test("embedded subset supports reused characters and blocks missing glyphs", async ({
  page,
}, info) => {
  await upload(page, "embedded-font-practice.pdf");
  await choose(page, "Embedded Sample Text");
  await apply(page, "Sample Text");
  await output(page, info, "embedded");
});
test("unsupported replacement stays unsaved and Undo restores a valid session", async ({
  page,
}) => {
  await upload(page, "embedded-font-practice.pdf");
  await choose(page, "Embedded Sample Text");
  await page.getByLabel("Replacement text", { exact: true }).fill("Zebra");
  await page.getByRole("button", { name: "Apply text replacement", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("embedded font");
  await expect(page.getByRole("button", { name: "Process", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Process", exact: true })).toBeEnabled();
});
test("scan has an explicit OCR limitation and can receive a separate note", async ({
  page,
}, info) => {
  await upload(page, "dark-scan-practice.pdf");
  await expect(page.getByText(/No selectable text on this page/)).toBeVisible();
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("SCAN NOTE");
  await output(page, info, "scan");
});
test("multiline formatted text, zoom, resizing and history export accurately", async ({
  page,
}, info) => {
  await upload(page);
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("First line\nSecond line");
  await page.getByLabel("Text font", { exact: true }).selectOption("Courier");
  await page.getByLabel("Bold", { exact: true }).check();
  await page.getByLabel("Italic", { exact: true }).check();
  await page.getByLabel("Height (%)", { exact: true }).fill("20");
  await page.getByLabel("Zoom", { exact: true }).selectOption("150");
  const before = await page.getByLabel("Width (%)", { exact: true }).inputValue();
  const handle = page.getByRole("button", { name: "Resize selected element", exact: true });
  await handle.scrollIntoViewIfNeeded();
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + 4, box.y + 4);
  await page.mouse.down();
  await page.mouse.move(box.x + 34, box.y + 30, { steps: 4 });
  await page.mouse.up();
  expect(Number(await page.getByLabel("Width (%)", { exact: true }).inputValue())).toBeGreaterThan(
    Number(before),
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByLabel("Width (%)", { exact: true })).toHaveValue(before);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await output(page, info, "formatted");
});
test("native replacement keeps unrelated filled form fields interactive", async ({
  page,
}, info) => {
  await upload(page, "sample.pdf", "test-results/new-tools-fixtures");
  await choose(page, "Original selectable page 1");
  await apply(page, "Edited");
  await output(page, info, "form");
});
test("all ten new entries and binary practice downloads are published correctly", async ({
  page,
  request,
}) => {
  const { loadContent } = await import("../../scripts/content.mjs");
  const { blog } = await loadContent();
  const articles = blog.filter((post) => post.date === "2026-10-26");
  expect(articles).toHaveLength(10);
  for (const article of articles) {
    const response = await page.goto("/blog/" + article.slug);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveText(article.title);
    await expect(page.locator("article")).toContainText(article.readTime);
    const json = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(json.some((text) => JSON.parse(text).headline === article.title)).toBe(true);
  }
  for (const name of [
    "editing-practice.pdf",
    "dark-scan-practice.pdf",
    "receipt.jpg",
    "diagram.png",
  ]) {
    const response = await request.get("/samples/" + name);
    expect(response.status()).toBe(200);
    expect(await response.body()).toEqual(await readFile("public/samples/" + name));
  }
});
