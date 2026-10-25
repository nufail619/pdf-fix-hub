import { test, expect } from "@playwright/test";
import { execFileSync, spawn } from "node:child_process";
import { createServer } from "node:http";
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  copyFile,
  symlink,
  rm,
  readdir,
} from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import sirv from "sirv";

test("an isolated production build publishes new CMS entries, removes unpublished/deleted pages, and excludes drafts", async ({
  browser,
}, info) => {
  test.setTimeout(120000);
  const root = await mkdtemp(join(tmpdir(), "pdf-hub-cms-publication-"));
  let server;
  let context;
  try {
    // Copy source only; never change the real checkout or copy local environment files.
    const paths = [
      ...new Set(
        execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
          encoding: "utf8",
        })
          .split("\0")
          .filter(Boolean),
      ),
    ];
    for (const path of paths) {
      if (path.split("/").some((part) => part.startsWith(".env"))) continue;
      try {
        await mkdir(dirname(join(root, path)), { recursive: true });
        await copyFile(path, join(root, path));
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    await symlink(resolve("node_modules"), join(root, "node_modules"), "dir");
    const original = "merge-pdfs-without-losing-quality";
    const originalPath = join(root, `content/blog/${original}.json`);
    const unpublished = JSON.parse(await readFile(originalPath, "utf8"));
    unpublished.status = "draft";
    unpublished.body = "CMS_PRIVATE_DRAFT_MARKER_7e268b4b";
    await writeFile(originalPath, JSON.stringify(unpublished));
    await rm(join(root, "content/guides/rotating-scanned-pdfs.json"));
    await writeFile(
      join(root, "public/uploads/cms-test.png"),
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jB9kAAAAASUVORK5CYII=",
        "base64",
      ),
    );
    const title = "CMS demo </script><script>window.cmsInjected=true</script>";
    for (const collection of ["blog", "guides"]) {
      await writeFile(
        join(root, `content/${collection}/cms-demo.json`),
        JSON.stringify({
          ...unpublished,
          slug: "cms-demo",
          title,
          status: "published",
          excerpt: "Listing summary",
          seoDescription: "Independent search description",
          date: "2026-10-25",
          categories: ["CMS tests"],
          featuredImage: "/uploads/cms-test.png",
          featuredImageAlt: "CMS test image",
          body: "## Live CMS heading\n\nPublished article paragraph.\n\n<script>window.cmsInjected=true</script>\n\n[Unsafe link](javascript:alert(1))",
        }),
      );
    }
    const log = createWriteStream(info.outputPath("isolated-production-build.log"));
    await new Promise<void>((done, fail) => {
      const build = spawn("npm", ["run", "build"], {
        cwd: root,
        env: { ...process.env, CMS_AUTH_URL: "", VITE_SITE_URL: "https://cms.example.test" },
        stdio: ["ignore", "pipe", "pipe"],
      });
      build.stdout.pipe(log, { end: false });
      build.stderr.pipe(log, { end: false });
      build.once("error", fail);
      build.once("exit", (code) => {
        log.end();
        code === 0
          ? done()
          : fail(new Error(`Isolated CMS production build exited ${code}; see attached log`));
      });
    });
    const serve = sirv(join(root, "dist"), { single: true });
    server = createServer(serve);
    await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
    const origin = `http://127.0.0.1:${server.address().port}`;
    context = await browser.newContext();
    const page = await context.newPage();
    for (const collection of ["blog", "guides"]) {
      await page.goto(`${origin}/${collection}/cms-demo`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("heading", { name: "Live CMS heading" })).toBeVisible();
      await expect(page.getByRole("img", { name: "CMS test image" })).toBeVisible();
      await expect(page.locator('meta[name="description"]')).toHaveAttribute(
        "content",
        "Independent search description",
      );
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        "content",
        "https://cms.example.test/uploads/cms-test.png",
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `https://cms.example.test/${collection}/cms-demo`,
      );
      expect(
        await page.evaluate(
          () => (window as typeof window & { cmsInjected?: boolean }).cmsInjected,
        ),
      ).toBeUndefined();
      expect(await page.getByText("Unsafe link", { exact: true }).getAttribute("href")).not.toMatch(
        /^javascript:/i,
      );
      const articleData = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      expect(
        articleData.map((value) => JSON.parse(value)).find((value) => value["@type"] === "Article")
          .headline,
      ).toBe(title);
    }
    const sitemap = await readFile(join(root, "dist/sitemap.xml"), "utf8");
    expect(sitemap).toContain("/blog/cms-demo");
    expect(sitemap).toContain("/guides/cms-demo");
    expect(sitemap).not.toContain(original);
    expect(sitemap).not.toContain("rotating-scanned-pdfs");
    expect(sitemap).not.toContain("/admin");
    await page.goto(`${origin}/blog/${original}`);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
    const checkDraft = async (directory: string) => {
      for (const item of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, item.name);
        if (item.isDirectory()) await checkDraft(path);
        else if (/\.(html|js|json|xml)$/.test(item.name))
          expect(await readFile(path, "utf8")).not.toContain("CMS_PRIVATE_DRAFT_MARKER_7e268b4b");
      }
    };
    await checkDraft(join(root, "dist"));
    await info.attach("publication-evidence.json", {
      body: JSON.stringify(
        {
          isolatedBuild: true,
          liveGitHubWrites: 0,
          publishedPaths: ["/blog/cms-demo", "/guides/cms-demo"],
          unpublished: original,
          deleted: "rotating-scanned-pdfs",
          draftMarkerAbsentFromAllPublicTextFiles: true,
          xssExecuted: false,
          seoAndImagesVerified: true,
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  } finally {
    await context?.close();
    if (server) await new Promise<void>((done) => server.close(() => done()));
    await rm(root, { recursive: true, force: true });
  }
});
