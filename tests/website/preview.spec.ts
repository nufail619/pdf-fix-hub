import { test, expect } from "../browser";
import { execFileSync, spawn } from "node:child_process";
import {
  mkdtemp,
  mkdir,
  copyFile,
  symlink,
  rm,
  readFile,
  writeFile,
  access,
} from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { tmpdir } from "node:os";
import { websiteServer } from "./serve.mjs";

test("isolated Preview and production builds separate indexing and enforce consent/loading/revocation", async ({
  browser,
}, info) => {
  test.setTimeout(180000);
  const root = await mkdtemp(join(tmpdir(), "pdf-hub-website-preview-"));
  let server;
  const contexts = [];
  try {
    const files = [
      ...new Set(
        execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
          encoding: "utf8",
        })
          .split("\0")
          .filter(Boolean),
      ),
    ];
    for (const file of files) {
      if (file.split("/").some((part) => part.startsWith(".env"))) continue;
      try {
        await mkdir(dirname(join(root, file)), { recursive: true });
        await copyFile(file, join(root, file));
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
    }
    await symlink(resolve("node_modules"), join(root, "node_modules"), "dir");
    async function buildSite(branch: string, logName: string) {
      const log = createWriteStream(info.outputPath(logName));
      await new Promise<void>((done, fail) => {
        const build = spawn("npm", ["run", "build"], {
          cwd: root,
          env: {
            ...process.env,
            CF_PAGES_BRANCH: branch,
            VITE_SITE_URL: "https://mypdffix.com",
            VITE_NOINDEX: "false",
            // Simulate the stale template value reported in hosting settings.
            VITE_CONTACT_EMAIL: "hello@example.com",
            VITE_GA_ID: "G-TEST123456",
            VITE_GTM_ID: "",
            VITE_CLARITY_ID: "test12345",
            VITE_ADSENSE_ID: "ca-pub-1234567890123456",
            CMS_AUTH_URL: "",
          },
          stdio: ["ignore", "pipe", "pipe"],
        });
        build.stdout.pipe(log, { end: false });
        build.stderr.pipe(log, { end: false });
        build.once("error", fail);
        build.once("exit", (code) => {
          log.end();
          if (code === 0) done();
          else fail(new Error(`${branch} build failed (${code})`));
        });
      });
    }
    await buildSite("develop/pdf-tools-repair", "preview-build.log");
    const robots = await readFile(join(root, "dist/robots.txt"), "utf8");
    expect(robots).toBe("User-agent: *\nDisallow: /\n");
    expect(await readFile(join(root, "dist/_headers"), "utf8")).toContain(
      "X-Robots-Tag: noindex, nofollow",
    );
    server = websiteServer(join(root, "dist"));
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const origin = `http://127.0.0.1:${server.address().port}`;
    async function scenario() {
      const context = await browser.newContext();
      contexts.push(context);
      const requests: string[] = [];
      await context.route(
        /^https:\/\/(www\.googletagmanager\.com|www\.clarity\.ms|pagead2\.googlesyndication\.com)\//,
        (route) => {
          requests.push(route.request().url());
          return route.fulfill({
            status: 200,
            contentType: "application/javascript",
            body: "window.fixtureTrackerLoaded = (window.fixtureTrackerLoaded || 0) + 1;",
          });
        },
      );
      const page = await context.newPage();
      return { context, page, requests };
    }
    const rejected = await scenario();
    const response = await rejected.page.goto(origin);
    expect(response?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(rejected.page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,nofollow",
    );
    await expect(rejected.page.getByRole("region", { name: "Cookie choices" })).toBeVisible();
    expect(rejected.requests).toEqual([]);
    await rejected.page.getByRole("button", { name: "Reject optional", exact: true }).click();
    await rejected.page.reload();
    await expect(rejected.page.getByRole("region", { name: "Cookie choices" })).toHaveCount(0);
    expect(rejected.requests).toEqual([]);
    const accepted = await scenario();
    await accepted.page.goto(origin);
    await accepted.page.getByRole("button", { name: "Choose preferences", exact: true }).click();
    await accepted.page.getByRole("checkbox", { name: /^Analytics/ }).check();
    await accepted.page.getByRole("button", { name: "Save preferences", exact: true }).click();
    await expect(accepted.page.locator("#head-ga")).toHaveCount(1);
    await expect(accepted.page.locator("#head-clarity")).toHaveCount(1);
    await expect(accepted.page.locator("#head-adsense")).toHaveCount(0);
    await expect.poll(() => accepted.requests.length).toBe(2);
    await accepted.page
      .getByRole("contentinfo")
      .getByRole("link", { name: "Blog", exact: true })
      .click();
    await expect(accepted.page.getByRole("heading", { level: 1 })).toHaveText(
      "The MY PDF FIX Blog",
    );
    expect(accepted.requests).toHaveLength(2);
    await accepted.page.getByRole("button", { name: "Privacy settings", exact: true }).click();
    await accepted.page.getByRole("checkbox", { name: /^Analytics/ }).uncheck();
    await accepted.page.getByRole("button", { name: "Save preferences", exact: true }).click();
    await expect(accepted.page.locator("#head-ga")).toHaveCount(0);
    await expect(accepted.page.locator("#head-clarity")).toHaveCount(0);
    expect(accepted.requests).toHaveLength(2);
    const all = await scenario();
    await all.page.goto(origin);
    await all.page.getByRole("button", { name: "Accept optional", exact: true }).click();
    await expect.poll(() => all.requests.length).toBe(3);
    await expect(all.page.locator("#head-adsense")).toHaveCount(1);
    const upgraded = await scenario();
    await upgraded.page.goto(origin);
    await upgraded.page.getByRole("button", { name: "Reject optional", exact: true }).click();
    await upgraded.page.getByRole("button", { name: "Privacy settings", exact: true }).click();
    await upgraded.page.getByRole("checkbox", { name: /^Analytics/ }).check();
    await upgraded.page.getByRole("button", { name: "Save preferences", exact: true }).click();
    await expect.poll(() => upgraded.requests.length).toBe(2);
    const consentCommands = await upgraded.page.evaluate(() =>
      ((window as Window & { dataLayer?: ArrayLike<unknown>[] }).dataLayer || [])
        .map((entry) => Array.from(entry))
        .filter((entry) => entry[0] === "consent"),
    );
    expect(consentCommands[0]).toEqual([
      "consent",
      "default",
      expect.objectContaining({ analytics_storage: "denied", ad_storage: "denied" }),
    ]);
    expect(consentCommands.at(-1)).toEqual([
      "consent",
      "update",
      expect.objectContaining({ analytics_storage: "granted", ad_storage: "denied" }),
    ]);
    const signal = await scenario();
    await signal.context.addInitScript(() =>
      Object.defineProperty(navigator, "globalPrivacyControl", { value: true }),
    );
    await signal.page.goto(origin);
    await signal.page.getByRole("button", { name: "Privacy settings", exact: true }).click();
    await expect(signal.page.getByRole("checkbox", { name: /^Analytics/ })).toBeDisabled();
    await expect(signal.page.getByRole("checkbox", { name: /^Advertising/ })).toBeDisabled();
    expect(signal.requests).toEqual([]);
    const unavailable = await scenario();
    await unavailable.context.addInitScript(() => {
      Storage.prototype.getItem = () => {
        throw new Error("test storage unavailable");
      };
      Storage.prototype.setItem = () => {
        throw new Error("test storage unavailable");
      };
    });
    await unavailable.page.goto(origin);
    await unavailable.page.getByRole("button", { name: "Reject optional", exact: true }).click();
    await expect(
      unavailable.page.getByText("Your choice applies to this visit.", { exact: false }),
    ).toBeVisible();
    expect(unavailable.requests).toEqual([]);
    await expect(
      rejected.page.getByRole("contentinfo").getByRole("link", {
        name: "mypdffix@gmail.com",
        exact: true,
      }),
    ).toHaveAttribute("href", "mailto:mypdffix@gmail.com");
    await writeFile(join(root, "dist/stale-unpublished.html"), "OLD_PRIVATE_DRAFT_MARKER");
    // Rebuild the same checkout to catch Preview output leaking into production.
    for (const context of contexts) await context.close();
    contexts.length = 0;
    await new Promise<void>((done) => server.close(() => done()));
    server = undefined;
    await buildSite("main", "production-build.log");
    await expect(access(join(root, "dist/stale-unpublished.html"))).rejects.toThrow();
    const redirects = (await readFile(join(root, "dist/_redirects"), "utf8"))
      .split("\n")
      .filter((line) => line && !line.startsWith("#"));
    expect(new Set(redirects).size).toBe(redirects.length);
    expect(redirects).toHaveLength(39);
    expect(await readFile(join(root, "dist/robots.txt"), "utf8")).toBe(
      "User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: https://mypdffix.com/sitemap.xml\n",
    );
    expect(await readFile(join(root, "dist/_headers"), "utf8")).toBe(
      await readFile(join(root, "public/_headers"), "utf8"),
    );
    server = websiteServer(join(root, "dist"));
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const productionOrigin = `http://127.0.0.1:${server.address().port}`;
    const production = await scenario();
    for (const path of ["/", "/merge-pdf", "/blog", "/guides"]) {
      const response = await production.page.goto(productionOrigin + path);
      expect(response?.status()).toBe(200);
      expect(response?.headers()["x-robots-tag"]).toBeUndefined();
      await expect(production.page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        "index,follow",
      );
      await expect(
        production.page.getByRole("contentinfo").getByRole("link", {
          name: "mypdffix@gmail.com",
          exact: true,
        }),
      ).toHaveAttribute("href", "mailto:mypdffix@gmail.com");
      await expect(production.page.getByText("hello@example.com", { exact: false })).toHaveCount(0);
      await expect(production.page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://mypdffix.com${path}`,
      );
    }
    const adminResponse = await production.context.request.get(productionOrigin + "/admin/");
    expect(adminResponse.status()).toBe(200);
    expect(adminResponse.headers()["x-robots-tag"]).toContain("noindex");
    await info.attach("preview-and-consent-evidence.json", {
      body: JSON.stringify(
        {
          indexingBlocked: true,
          productionIndexableAfterPreviewRebuild: true,
          productionAdminRemainsNoindex: true,
          staleBuildFilesRemoved: true,
          duplicateRedirectRules: 0,
          staleContactEnvironmentIgnored: true,
          consentUpdatesAfterChangingPreferences: true,
          requestsBeforeConsent: 0,
          requestsAfterRejection: 0,
          analyticsOnlyRequests: accepted.requests,
          requestsAfterAcceptAll: all.requests,
          browserOptOutHonored: true,
          storageFailureHandled: true,
          realExternalRequests: 0,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  } finally {
    for (const context of contexts) await context.close();
    if (server) await new Promise<void>((done) => server.close(() => done()));
    await rm(root, { recursive: true, force: true });
  }
});
