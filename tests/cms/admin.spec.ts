import { test, expect } from "../browser";
import { readFile } from "node:fs/promises";
import { installGitHubMock } from "./github-mock.mjs";
import { articleSchema } from "../../scripts/content.mjs";

test("admin fails closed until OAuth is configured", async ({ page }) => {
  await page.goto("/admin/");
  await expect(page.getByText(/GitHub sign-in is not configured yet/)).toBeVisible();
  await expect(page.getByRole("button", { name: /sign in/i })).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
});

test("admin responses apply Pages security headers", async ({ request }) => {
  const response = await request.get("/admin/");
  expect(response.headers()["cache-control"]).toBe("no-store");
  expect(response.headers()["x-robots-tag"]).toContain("noindex");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
});

test("existing articles retain content, SEO and public URLs", async ({ page, request }) => {
  for (const [collection, slug, title] of [
    ["blog", "merge-pdfs-without-losing-quality", "How to merge PDFs without losing quality"],
    [
      "guides",
      "complete-guide-to-pdf-page-numbers",
      "The complete guide to adding page numbers to a PDF",
    ],
  ]) {
    const article = JSON.parse(await readFile(`content/${collection}/${slug}.json`, "utf8"));
    await page.goto(`/${collection}/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      article.seoDescription,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/${collection}/${slug}$`),
    );
    await expect(page.locator("article")).toContainText(article.body.split("\n\n")[0]);
    expect((await request.get(`/${collection}/${slug}`)).status()).toBe(200);
  }
});

async function configureTestOAuth(context) {
  const config = JSON.parse(await readFile("public/admin/config.yml", "utf8"));
  config.backend.base_url = "https://cms-auth.example.test";
  // Test-only HTTP interceptions; production configuration is never changed.
  await context.route(
    (u) => u.pathname === "/admin/runtime.json",
    (r) => r.fulfill({ json: { authConfigured: true } }),
  );
  await context.route(
    (u) => u.pathname === "/admin/config.yml",
    (r) => r.fulfill({ json: config }),
  );
}

test("real Sveltia loads both collections through a mocked GitHub OAuth flow", async ({
  context,
  page,
}, info) => {
  await configureTestOAuth(context);
  const mock = await installGitHubMock(context);
  page.on("console", (m) => {
    if (m.type() === "error") console.log("CMS browser:", m.text().slice(0, 400));
  });
  await page.goto("/admin/");
  await expect(page.getByRole("button", { name: /sign in.*github/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /access token/i })).toHaveCount(0);
  await page.getByRole("button", { name: /sign in.*github/i }).click();
  await expect(page.getByRole("button", { name: "Show Account Menu" })).toBeVisible();
  await expect(
    page.getByRole("row", { name: "merge-pdfs-without-losing-quality", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: info.outputPath("cms-collections.png") });
  expect(mock.writes).toHaveLength(0);
  expect(mock.unexpected).toEqual([]);
});

test("GitHub read-only users cannot edit content", async ({ context, page }) => {
  await configureTestOAuth(context);
  const mock = await installGitHubMock(context, { canWrite: false });
  await page.goto("/admin/");
  await page.getByRole("button", { name: /sign in.*github/i }).click();
  await expect(
    page.getByText(/write access|permission|not allowed|cannot access/i).first(),
  ).toBeVisible();
  expect(mock.writes).toHaveLength(0);
});

for (const collection of ["blog", "guides"]) {
  test(`create, preview, edit, publish, unpublish and delete a ${collection} entry (mock GitHub only)`, async ({
    context,
    page,
  }, info) => {
    await configureTestOAuth(context);
    const mock = await installGitHubMock(context);
    await page.goto("/admin/");
    await page.getByRole("button", { name: /sign in.*github/i }).click();
    await page
      .getByRole("treeitem", { name: collection === "blog" ? "Blog posts" : "Guides", exact: true })
      .click();
    await page.getByRole("button", { name: "Create New Entry", exact: true }).click();
    const slug = `cms-test-${collection}`;
    const title = `CMS test ${collection} article`;
    await page.getByRole("textbox", { name: "Title", exact: true }).fill(title);
    await page.getByRole("textbox", { name: "URL slug", exact: true }).fill(slug);
    await page.getByRole("textbox", { name: "Summary", exact: true }).fill("Test article summary");
    await page
      .getByRole("textbox", { name: "SEO description", exact: true })
      .fill("Test SEO description");
    await page.getByRole("textbox", { name: "Publication date", exact: true }).fill("2026-10-25");
    await page
      .getByRole("textbox", { name: "Featured image alternative text", exact: true })
      .scrollIntoViewIfNeeded();
    if (collection === "blog") {
      const image = await page.evaluate(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 32;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#b42318";
        ctx.fillRect(0, 0, 64, 32);
        return canvas.toDataURL("image/png").split(",")[1];
      });
      await page
        .getByRole("group", { name: /^“.*Featured image.*” Field$/ })
        .first()
        .locator('input[type="file"]')
        .first()
        .setInputFiles({
          name: "cms-upload.png",
          mimeType: "image/png",
          buffer: Buffer.from(image, "base64"),
        });
      await page
        .getByRole("textbox", { name: "Featured image alternative text", exact: true })
        .fill("A test featured image");
    }
    await page.getByRole("textbox", { name: "Item Value", exact: true }).fill("CMS tests");
    await page
      .locator('[contenteditable="true"][role="textbox"]')
      .fill("A paragraph created through the real CMS editor.");
    await expect(
      page
        .getByRole("group", { name: "Preview Content", exact: true })
        .getByText(title, { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("group", { name: "Preview Content", exact: true })
        .getByText("A paragraph created through the real CMS editor.", { exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    const path = `content/${collection}/${slug}.json`;
    await expect.poll(() => mock.files.has(path)).toBe(true);
    expect(JSON.parse(mock.files.get(path)).status).toBe("draft");
    articleSchema.parse(JSON.parse(mock.files.get(path)));
    if (collection === "blog") {
      expect(JSON.parse(mock.files.get(path)).featuredImage).toMatch(/^\/uploads\/.+\.(png|webp)$/);
      expect([...mock.files.keys()].some((key) => key.startsWith("public/uploads/"))).toBe(true);
    }
    expect(JSON.parse(mock.files.get(path)).body).toContain(
      "A paragraph created through the real CMS editor.",
    );
    for (const status of ["Published", "Draft / unpublished"]) {
      await page.getByRole("row", { name: slug, exact: true }).click();
      await page.getByRole("radio", { name: status, exact: true }).check();
      await page.getByRole("textbox", { name: "Title", exact: true }).fill(`${title} edited`);
      await page.getByRole("button", { name: "Save", exact: true }).click();
      await expect
        .poll(() => JSON.parse(mock.files.get(path)).status)
        .toBe(status === "Published" ? "published" : "draft");
    }
    expect(JSON.parse(mock.files.get(path)).title).toBe(`${title} edited`);
    await page.screenshot({ path: info.outputPath("cms-saved-draft.png") });
    await page.getByRole("row", { name: slug, exact: true }).getByRole("checkbox").check();
    await page.getByRole("button", { name: "Delete Selected Entry", exact: true }).click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: "Delete", exact: true })
      .click();
    await expect.poll(() => mock.files.has(path)).toBe(false);
    expect(mock.writes.length).toBe(4);
    expect(mock.unexpected).toEqual([]);
    await info.attach("mock-github-evidence.json", {
      body: JSON.stringify(
        {
          collection,
          actualGitHubWrites: 0,
          operations: mock.writes.map((w) => ({
            branch: w.branch.branchName,
            additions: w.fileChanges.additions.map((f) => f.path),
            deletions: w.fileChanges.deletions.map((f) => f.path),
          })),
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });
}
