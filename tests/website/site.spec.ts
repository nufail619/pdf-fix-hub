import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const routes = readdirSync("src/routes")
  .filter((name) => name.endsWith(".tsx") && !name.startsWith("__") && !name.includes("$"))
  .map((name) => name.replace(/\.tsx$/, "").replace(/\.index$/, ""))
  .map((name) => (name === "index" ? "/" : "/" + name));
for (const kind of ["blog", "guides"])
  for (const file of readdirSync(`content/${kind}`)) {
    const article = JSON.parse(readFileSync(`content/${kind}/${file}`, "utf8"));
    if (article.status === "published") routes.push(`/${kind}/${article.slug}`);
  }

for (const path of routes) {
  test(`${path}: public content, SEO, accessibility and responsive layout`, async ({
    page,
    request,
  }, info) => {
    await page.route("https://**/*", (route) => route.abort());
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    expect(response?.request().redirectedFrom()).toBeNull();
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toBeEmpty();
    expect(await page.title()).toContain("MY PDF FIX");
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{10,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://mypdffix.com${path}`,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /^https:\/\/mypdffix.com\/.*\.(png|jpg|jpeg|webp)$/,
    );
    const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
    for (const text of structured) expect(() => JSON.parse(text)).not.toThrow();
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    await info.attach("accessibility.json", {
      body: JSON.stringify({ path, violations: audit.violations }, null, 2),
      contentType: "application/json",
    });
    expect(
      audit.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Overflow on ${path} at ${width}px`,
      ).toBe(true);
    }
    const html = await (await request.get(path)).text();
    expect(html).toMatch(/<h1[\s>]/);
    expect(errors).toEqual([]);
  });
}

test("homepage and original articles have readable HTML without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  try {
    for (const path of [
      "/",
      "/blog/merge-pdfs-without-losing-quality",
      "/guides/rotating-scanned-pdfs",
    ]) {
      await page.goto("http://127.0.0.1:4173" + path);
      await expect(page.locator("h1")).toBeVisible();
    }
  } finally {
    await context.close();
  }
});

test("all internal links and local images resolve to actual static output", async ({
  request,
}, info) => {
  const links = new Set<string>();
  const images = new Set<string>();
  for (const path of routes) {
    const html = await (await request.get(path)).text();
    for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
      const value = match[1].replaceAll("&amp;", "&");
      if (value.startsWith("//") || value.includes("__spa_shell")) continue;
      if (/\.(svg|png|jpe?g|webp)$/.test(value)) images.add(value);
      if (!value.startsWith("/assets/")) links.add(value);
    }
  }
  for (const path of links) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
  for (const path of images) {
    const response = await request.get(path);
    expect(response.headers()["content-type"], path).toMatch(/^image\//);
  }
  await info.attach("internal-links.json", {
    body: JSON.stringify({ links: [...links], images: [...images] }, null, 2),
    contentType: "application/json",
  });
});

test("mobile navigation traps focus, closes with Escape and restores focus", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.click();
  const menu = page.getByRole("dialog", { name: "Menu", exact: true });
  await expect(menu).toBeVisible();
  for (let i = 0; i < 35; i++) {
    await page.keyboard.press("Tab");
    expect(await menu.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await menu.getByRole("link", { name: "Unlock PDF", exact: true }).click();
  await expect(page).toHaveURL(/\/unlock-pdf$/);
  await expect(menu).toHaveCount(0);
});

test("desktop tools menu is usable with the keyboard", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Tools", exact: true });
  await trigger.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("dialog", { name: "PDF tools menu" });
  await expect(menu).toBeVisible();
  const first = menu.getByRole("link", { name: "Merge PDF", exact: true });
  await expect(menu).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(menu.getByRole("link", { name: "Split PDF", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("skip link, search filters and empty states work", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  const section = page.getByRole("region", { name: "PDF tools", exact: true });
  await section.getByLabel("Find a PDF tool").fill("brightness");
  await expect(section.locator("a")).toHaveCount(1);
  await section.getByLabel("Find a PDF tool").fill("no-such-document-tool");
  await expect(section.getByText("No tools match your search.")).toBeVisible();
  await section.getByRole("button", { name: "Show all tools" }).click();
  await expect(section.locator("a")).toHaveCount(25);
  await section.getByRole("button", { name: "Convert", exact: true }).click();
  await expect(section.locator("a")).toHaveCount(6);
});

for (const kind of ["blog", "guides"]) {
  test(`${kind}: searchable CMS content, categories and empty results`, async ({ page }) => {
    await page.goto(`/${kind}`);
    const search = page.getByRole("searchbox");
    await search.fill("zz-no-article");
    await expect(page.getByText("No articles match your search.")).toBeVisible();
    await page.getByRole("button", { name: "Show all articles" }).click();
    await expect(page.locator("main time")).toHaveCount(3);
    const category = page.getByLabel("Category", { exact: true });
    const value = await category.locator("option").nth(1).getAttribute("value");
    await category.selectOption(value!);
    await expect(page.getByRole("status")).toContainText("articles found");
  });
}

test("file chooser supports keyboard, rejects invalid files, and accepts reselecting the same PDF", async ({
  page,
}) => {
  await page.goto("/merge-pdf");
  const upload = page.getByRole("button", { name: "Upload files", exact: true });
  await upload.focus();
  const choice = page.waitForEvent("filechooser");
  await page.keyboard.press("Space");
  await (await choice).setFiles(resolve("test-results/pdf-tools-fixtures/sample.pdf"));
  await expect(page.getByText("sample.pdf", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove sample.pdf" }).click();
  await page
    .locator('input[type="file"]')
    .setInputFiles(resolve("test-results/pdf-tools-fixtures/sample.pdf"));
  await expect(page.getByText("sample.pdf", { exact: true })).toBeVisible();
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "wrong.png", mimeType: "image/png", buffer: Buffer.from("fixture") });
  await expect(page.getByRole("alert")).toContainText("not added");
  await page
    .locator('input[type="file"]')
    .setInputFiles({ name: "empty.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(0) });
  await expect(page.getByRole("alert")).toContainText("non-empty PDF");
});

test("unknown URLs return 404 with one layout and no indexing", async ({ page, request }) => {
  const response = await request.get("/not-a-page");
  expect(response.status()).toBe(404);
  expect(await response.text()).toMatch(/name="robots" content="noindex,nofollow"/);
  await page.goto("/not-a-page");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  await expect(page).toHaveTitle("Page not found — MY PDF FIX");
  await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
  await expect(page.getByText("Requested page: /not-a-page", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.locator("header")).toHaveCount(1);
});

test("legacy directory-index links redirect to the preserved canonical URLs", async ({
  request,
}) => {
  for (const path of [
    "/merge-pdf",
    "/blog",
    "/blog/merge-pdfs-without-losing-quality",
    "/guides/rotating-scanned-pdfs",
  ]) {
    const response = await request.get(`${path}/index.html`, { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe(path);
    const canonical = await request.get(path, { maxRedirects: 0 });
    expect(canonical.status()).toBe(200);
  }
});

test("security headers, local fonts, social image and sitemap are production-ready", async ({
  page,
  request,
}) => {
  const external: string[] = [];
  page.on("request", (req) => {
    if (new URL(req.url()).protocol.startsWith("http") && !req.url().startsWith("http://127.0.0.1"))
      external.push(req.url());
  });
  await page.goto("/");
  await page.evaluate(() => document.fonts.ready);
  expect(external).toEqual([]);
  const response = await request.get("/");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  const image = await request.get("/og-default.png");
  expect(image.status()).toBe(200);
  expect(image.headers()["content-type"]).toContain("image/png");
  expect((await image.body()).subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap.match(/<loc>/g) || []).toHaveLength(40);
  expect(sitemap).not.toContain("/admin");
  expect(sitemap).not.toContain("<lastmod>");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Disallow: /admin/");
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Privacy preferences" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Privacy settings", exact: true })).toBeFocused();
});
