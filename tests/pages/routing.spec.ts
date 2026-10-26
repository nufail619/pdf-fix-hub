import { test, expect } from "@playwright/test";
import { publicRoutes } from "../../scripts/public-routes.mjs";
import { tools } from "../../src/data/tools";

test("Cloudflare serves every public URL directly and after refresh with one site layout", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|Minified React error/i.test(message.text()))
      errors.push(message.text());
  });
  const evidence: { path: string; status: number; refreshedStatus: number }[] = [];
  for (const path of await publicRoutes()) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    expect(response?.request().redirectedFrom(), path).toBeNull();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).not.toHaveText("404");
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.getByRole("main")).toHaveCount(1);
    const refreshed = await page.reload();
    expect(refreshed?.status(), path).toBe(200);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator("h1")).not.toHaveText("404");
    evidence.push({ path, status: response!.status(), refreshedStatus: refreshed!.status() });
  }
  expect(errors).toEqual([]);
  await info.attach("cloudflare-direct-and-refresh.json", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
});

test("all 25 homepage cards open the correct PDF tool through client navigation", async ({
  page,
}) => {
  for (const tool of tools) {
    await page.goto("/");
    const grid = page.getByRole("region", { name: "PDF tools", exact: true });
    await expect(grid.locator("a")).toHaveCount(25);
    await grid.locator(`a[href="/${tool.slug}"]`).click();
    await expect(page).toHaveURL(new RegExp(`/${tool.slug}$`));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(tool.name);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await page.goBack();
    await expect(grid.locator("a")).toHaveCount(25);
  }
});

test("Cloudflare normalizes old HTML and directory URLs without loops or losing queries", async ({
  page,
  request,
}) => {
  for (const path of [
    "/merge-pdf",
    "/blog",
    "/blog/merge-pdfs-without-losing-quality",
    "/guides/rotating-scanned-pdfs",
  ]) {
    const legacy = await request.get(`${path}/index.html?source=legacy`, { maxRedirects: 0 });
    expect(legacy.status()).toBe(301);
    expect(new URL(legacy.headers().location, "http://127.0.0.1:4188").pathname).toBe(path);
    expect(new URL(legacy.headers().location, "http://127.0.0.1:4188").search).toBe(
      "?source=legacy",
    );
    await page.goto(`${path}/?source=directory`);
    await expect(page).toHaveURL(`http://127.0.0.1:4188${path}?source=directory`);
    await expect(page.locator("h1")).not.toHaveText("404");
    await page.goto(`${path}.html`);
    await expect(page).toHaveURL(`http://127.0.0.1:4188${path}`);
    await expect(page.locator("h1")).not.toHaveText("404");
  }
  await page.goto("/index.html");
  await expect(page).toHaveURL("http://127.0.0.1:4188/");
});

test("unknown URLs return intentional 404s, stay noindex and recover without duplicate layouts", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat|Minified React error/i.test(message.text()))
      errors.push(message.text());
  });
  const evidence: { path: string; status: number }[] = [];
  for (const path of ["/not-a-page", "/blog/no-such-post", "/guides/no-such-guide"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("404");
    await expect(page.getByText(`Requested page: ${path}`, { exact: true })).toBeVisible();
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,nofollow",
    );
    await page.getByRole("link", { name: "Go home", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "PDF tools", exact: true }).locator("a"),
    ).toHaveCount(25);
    await expect(page.getByRole("banner")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toHaveCount(1);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index,follow");
    evidence.push({ path, status: response!.status() });
  }
  await info.attach("intentional-404-urls.json", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
  expect(errors).toEqual([]);
});

test("Cloudflare preserves admin protections, correct legal contact details and production indexing", async ({
  page,
  request,
}) => {
  const home = await request.get("/");
  expect(home.headers()["x-robots-tag"]).toBeUndefined();
  for (const path of ["/contact", "/privacy", "/terms", "/disclaimer", "/cookie-policy"]) {
    await page.goto(path);
    await expect(
      page.getByRole("main").locator('a[href="mailto:mypdffix@gmail.com"]').first(),
    ).toBeVisible();
    await expect(page.getByText("hello@example.com", { exact: false })).toHaveCount(0);
  }
  const admin = await request.get("/admin/");
  expect(admin.status()).toBe(200);
  expect(admin.headers()["cache-control"]).toBe("no-store");
  expect(admin.headers()["x-robots-tag"]).toContain("noindex");
  expect(admin.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(admin.headers()["x-frame-options"]).toBe("DENY");
  expect((await request.get("/content/blog/merge-pdfs-without-losing-quality.json")).status()).toBe(
    404,
  );
});
