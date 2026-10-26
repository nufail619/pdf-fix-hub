import { test, expect, type Page, type TestInfo } from "../browser";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const fixtures = resolve("test-results/new-tools-fixtures");
const input = (name = "sample.pdf") => resolve(fixtures, name);

async function upload(page: Page, slug: string, name = "sample.pdf") {
  await page.goto(`/${slug}`);
  await page.locator('input[type="file"]').setInputFiles(input(name));
}

async function download(page: Page, info: TestInfo, kind: string, source = "sample.pdf") {
  await page.getByRole("button", { name: "Process", exact: true }).click();
  const link = page.getByRole("link", { name: "Download", exact: true });
  await expect(link).toBeVisible({ timeout: 45000 });
  const pending = page.waitForEvent("download");
  await link.click();
  const result = await pending;
  const path = info.outputPath(result.suggestedFilename());
  await result.saveAs(path);
  expect(await result.failure()).toBeNull();
  const evidence = execFileSync(
    "python3",
    ["tests/new-tools/verify.py", kind, path, input(source)],
    { encoding: "utf8" },
  );
  await info.attach("verified-pdf.json", { body: evidence, contentType: "application/json" });
  console.log(evidence);
  return path;
}

async function slider(page: Page, label: string, value: number) {
  await page.getByRole("slider", { name: label, exact: true }).fill(String(value));
}

test("grid has all 25 tools, new pages have SEO, instructions and mobile layouts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const grid = page.getByRole("region", { name: "PDF tools", exact: true });
  await expect(grid.locator("a[href]")).toHaveCount(25);
  for (const [slug, title] of [
    ["adjust-pdf-brightness", "Adjust PDF Brightness"],
    ["edit-pdf", "Edit PDF"],
    ["unlock-pdf", "Unlock PDF"],
  ]) {
    await page.goto(`/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /PDF/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/${slug}$`),
    );
    await expect(page.getByRole("heading", { name: "How to use it" })).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

for (const variant of [
  "brightness",
  "brightness-dark",
  "brightness-neutral",
  "brightness-rotated",
]) {
  test(`${variant}: preview and actual multipage pixel output`, async ({ page }, info) => {
    await upload(
      page,
      "adjust-pdf-brightness",
      variant.endsWith("rotated") ? "rotated.pdf" : "sample.pdf",
    );
    await expect(page.getByRole("img", { name: "Before adjustment, page 1" })).toBeVisible();
    const before = await page
      .getByRole("img", { name: "Before adjustment, page 1" })
      .getAttribute("src");
    const neutral = await page
      .getByRole("img", { name: "After adjustment, page 1" })
      .getAttribute("src");
    expect(before).toBe(neutral);
    const brightness = variant.includes("dark") ? -20 : variant.includes("neutral") ? 0 : 20;
    const contrast = variant.includes("dark") ? -25 : variant.includes("neutral") ? 0 : 25;
    await slider(page, "Brightness", brightness);
    await slider(page, "Contrast", contrast);
    if (brightness)
      expect(
        await page.getByRole("img", { name: "After adjustment, page 1" }).getAttribute("src"),
      ).not.toBe(before);
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(page.getByRole("img", { name: "After adjustment, page 2" })).toBeVisible();
    await expect(
      page.getByText(/selectable text, links and interactive forms will be lost/i),
    ).toBeVisible();
    await download(page, info, variant);
  });
}

async function position(page: Page, x: number, y: number, width: number, height: number) {
  await page.getByLabel("Horizontal position (%)", { exact: true }).fill(String(x));
  await page.getByLabel("Vertical position (%)", { exact: true }).fill(String(y));
  await page.getByLabel("Width (%)", { exact: true }).fill(String(width));
  await page.getByLabel("Height (%)", { exact: true }).fill(String(height));
}

test("editor adds, drags, repositions and deletes overlays across pages and exports real content", async ({
  page,
}, info) => {
  await upload(page, "edit-pdf");
  await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("VISIBLE NOTE");
  await position(page, 10, 25, 70, 10);
  const element = page.getByRole("button", { name: "Select text element", exact: true });
  await element.scrollIntoViewIfNeeded();
  const box = (await element.boundingBox())!;
  await page.mouse.move(box.x + 15, box.y + 10);
  await page.mouse.down();
  await page.mouse.move(box.x + 50, box.y + 35, { steps: 6 });
  await page.mouse.up();
  expect(
    Number(await page.getByLabel("Horizontal position (%)", { exact: true }).inputValue()),
  ).toBeGreaterThan(10);
  await position(page, 10, 25, 70, 10);
  await page.getByRole("button", { name: "Add rectangle", exact: true }).click();
  await position(page, 10, 50, 25, 15);
  await page.getByRole("button", { name: "Add ellipse", exact: true }).click();
  await position(page, 55, 50, 25, 15);
  await page.getByRole("button", { name: "Add highlight", exact: true }).click();
  await position(page, 10, 70, 50, 10);
  await page.getByRole("button", { name: "Add whiteout", exact: true }).click();
  await position(page, 10, 14, 80, 8);
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("DELETED NOTE");
  await page.getByRole("button", { name: "Delete selected element", exact: true }).click();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByRole("group", { name: "PDF editor page 2", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("SECOND PAGE");
  await position(page, 10, 35, 70, 10);
  await page.getByRole("button", { name: "Previous page", exact: true }).click();
  await expect(page.getByRole("button", { name: "Select text element", exact: true })).toHaveCount(
    1,
  );
  await download(page, info, "editor");
});

test("editor flattens form fields only on request and can cover their appearances", async ({
  page,
}, info) => {
  await upload(page, "edit-pdf");
  await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
  await expect(
    page.getByRole("checkbox", { name: "Flatten form fields in edited copy" }),
  ).not.toBeChecked();
  await page.getByRole("checkbox", { name: "Flatten form fields in edited copy" }).check();
  await page.getByRole("button", { name: "Add whiteout", exact: true }).click();
  await position(page, 10, 30, 80, 10);
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("VISIBLE NOTE");
  await position(page, 10, 25, 70, 10);
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByRole("group", { name: "PDF editor page 2", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("SECOND PAGE");
  await position(page, 10, 25, 70, 10);
  await download(page, info, "editor-flattened");
});

for (const source of ["rotated.pdf", "upside-down.pdf", "counterclockwise.pdf"]) {
  test(`editor handles ${source} and cropped pages`, async ({ page }, info) => {
    await upload(page, "edit-pdf", source);
    await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Add text", exact: true }).click();
    await page.getByLabel("Text to add", { exact: true }).fill("VISIBLE NOTE");
    await position(page, 10, 25, 70, 10);
    await page.getByRole("button", { name: "Next page", exact: true }).click();
    await expect(page.getByRole("group", { name: "PDF editor page 2", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Add text", exact: true }).click();
    await page.getByLabel("Text to add", { exact: true }).fill("SECOND PAGE");
    await position(page, 10, 35, 70, 10);
    await download(page, info, "editor-rotated", source);
  });
}

for (const algorithm of ["RC4-40", "RC4-128", "AES-128", "AES-256-R5", "AES-256"]) {
  test(`unlock ${algorithm}: decrypted download, text, forms, no uploads or password persistence`, async ({
    page,
  }, info) => {
    const unexpected: string[] = [];
    const consoleMessages: string[] = [];
    await upload(page, "unlock-pdf", `${algorithm}.pdf`);
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (["http:", "https:"].includes(url.protocol) && url.hostname !== "127.0.0.1")
        unexpected.push(url.origin);
      if (request.postData()?.includes("fixture-open") || request.url().includes("fixture-open"))
        unexpected.push("Password in request");
    });
    page.on("console", (message) => consoleMessages.push(message.text()));
    await page.getByLabel("PDF password", { exact: true }).fill("fixture-open");
    await page.getByRole("checkbox").check();
    await download(page, info, "unlock", `${algorithm}.pdf`);
    expect(unexpected).toEqual([]);
    expect(consoleMessages.join("\n")).not.toContain("fixture-open");
    expect(
      await page.evaluate(() =>
        JSON.stringify({
          local: { ...localStorage },
          session: { ...sessionStorage },
          cookie: document.cookie,
        }),
      ),
    ).not.toContain("fixture-open");
    await page.getByRole("button", { name: "Process another file", exact: true }).click();
    await expect(page.getByLabel("PDF password", { exact: true })).toHaveValue("");
  });
}

test("unlock accepts a valid owner password and an empty opening password", async ({
  page,
}, info) => {
  for (const [source, password] of [
    ["AES-256.pdf", "fixture-owner"],
    ["empty-password.pdf", ""],
  ]) {
    await upload(page, "unlock-pdf", source);
    await page.getByLabel("PDF password", { exact: true }).fill(password);
    await page.getByRole("checkbox").check();
    await download(page, info, "unlock", source);
  }
});

test("unlock rejects missing permission, wrong password, unsupported encryption and damaged input", async ({
  page,
}) => {
  await upload(page, "unlock-pdf", "AES-128.pdf");
  await page.getByLabel("PDF password", { exact: true }).fill("fixture-open");
  await page.getByRole("button", { name: "Process", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Confirm that you own" })).toBeVisible();
  await expect(page.getByLabel("PDF password", { exact: true })).toHaveValue("");
  await page.getByRole("checkbox").check();
  await page.getByLabel("PDF password", { exact: true }).fill("wrong-fixture-password");
  await page.getByRole("button", { name: "Process", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "password is incorrect" })).toBeVisible();
  await expect(page.getByLabel("PDF password", { exact: true })).toHaveValue("");
  for (const source of ["unsupported.pdf", "broken.pdf"]) {
    await page.locator('input[type="file"]').setInputFiles(input(source));
    await page.getByRole("checkbox").check();
    await page.getByLabel("PDF password", { exact: true }).fill("fixture-open");
    await page.getByRole("button", { name: "Process", exact: true }).click();
    await expect(page.getByRole("alert").filter({ hasText: /unsupported|damaged/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download", exact: true })).toHaveCount(0);
    await expect(page.getByLabel("PDF password", { exact: true })).toHaveValue("");
  }
});

test("new previews report protected/damaged inputs and reset edits when replacing a file", async ({
  page,
}) => {
  for (const slug of ["edit-pdf", "adjust-pdf-brightness"]) {
    await upload(page, slug, "broken.pdf");
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("button", { name: "Process", exact: true })).toBeDisabled();
    await page.locator('input[type="file"]').setInputFiles(input("AES-128.pdf"));
    await expect(page.getByRole("alert")).toContainText("password-protected");
    await page.locator('input[type="file"]').setInputFiles(input());
    await expect(page.getByRole("button", { name: "Process", exact: true })).toBeEnabled();
  }
  await upload(page, "edit-pdf");
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await expect(page.getByRole("combobox", { name: "Added elements", exact: true })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles(input("rotated.pdf"));
  await expect(page.getByRole("combobox", { name: "Added elements", exact: true })).toHaveCount(0);
  await expect(page.getByRole("group", { name: "PDF editor page 1", exact: true })).toBeVisible();
});

test("editor and brightness controls work at a mobile viewport", async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await upload(page, "edit-pdf");
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Text to add", { exact: true }).fill("Mobile note");
  await position(page, 10, 35, 70, 10);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("mobile-editor.png"), fullPage: true });
  await upload(page, "adjust-pdf-brightness");
  await expect(page.getByRole("img", { name: "After adjustment, page 1" })).toBeVisible();
  await slider(page, "Brightness", 20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: info.outputPath("mobile-brightness.png"), fullPage: true });
});
