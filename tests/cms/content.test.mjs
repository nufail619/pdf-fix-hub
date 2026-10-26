import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm, unlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { articleSchema, loadContent, prepareContent } from "../../scripts/content.mjs";
import { createCmsConfig, prepareCms } from "../../scripts/prepare-cms.mjs";
import { serializeStructuredData } from "../../src/lib/structured-data.ts";

test("article structured data cannot close its script element", () => {
  const value = { headline: "</script><script>window.injected=true</script>" };
  const json = serializeStructuredData(value);
  assert(!json.includes("<"));
  assert.deepEqual(JSON.parse(json), value);
});

const sample = {
  title: "Test article",
  slug: "test-article",
  excerpt: "Article summary",
  seoDescription: "Search description",
  date: "2026-10-25",
  author: "Test author",
  readTime: "3 min read",
  body: "# Test heading\n\nOriginal text.",
  status: "draft",
  featuredImage: "",
  featuredImageAlt: "",
  categories: ["PDF tips"],
};

test("all six migrated articles keep their original slugs and are published", async () => {
  const content = await loadContent();
  assert.equal(content.blog.length, 3);
  assert.equal(content.guides.length, 3);
  assert.equal(content.blog[0].slug, "merge-pdfs-without-losing-quality");
  assert.equal(content.guides[0].slug, "complete-guide-to-pdf-page-numbers");
  for (const article of [...content.blog, ...content.guides]) {
    assert.equal(article.seoDescription, article.excerpt);
    assert(article.body.length > 1000);
  }
});

test("create, edit, publish, unpublish and delete regenerate only published content", async () => {
  const root = await mkdtemp(join(tmpdir(), "pdf-hub-content-"));
  try {
    for (const dir of ["content/blog", "content/guides", "public/uploads"])
      await mkdir(join(root, dir), { recursive: true });
    const file = join(root, "content/blog/test-article.json");
    const save = async (entry) => writeFile(file, JSON.stringify(entry));
    await save(sample);
    await prepareContent(root);
    assert.equal((await loadContent(root)).blog.length, 0);
    assert(!(await readFile(join(root, "src/generated/content.ts"), "utf8")).includes(sample.body));
    await save({ ...sample, status: "published", title: "Edited title" });
    const published = (await prepareContent(root)).blog[0];
    assert.equal(published.title, "Edited title");
    assert.equal(published.readTime, "1 min read", "The stale manual 3-minute value is ignored");
    await save({ ...sample, status: "draft" });
    assert.equal((await prepareContent(root)).blog.length, 0);
    await unlink(file);
    assert.equal((await prepareContent(root)).blog.length, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("unsafe slugs, remote images, SVGs, invalid dates and missing image descriptions are rejected", () => {
  for (const overrides of [
    { slug: "../../admin" },
    { featuredImage: "https://evil.test/pixel.png" },
    { featuredImage: "/uploads/../../secret.png" },
    { featuredImage: "/uploads/payload.svg" },
    { date: "2026-02-31" },
    { featuredImage: "/uploads/photo.png", featuredImageAlt: "" },
  ]) {
    assert.equal(articleSchema.safeParse({ ...sample, ...overrides }).success, false);
  }
});

test("CMS config targets only the development branch and requires OAuth", () => {
  const config = createCmsConfig("https://cms-auth.example.test");
  assert.equal(config.backend.branch, "develop/pdf-tools-repair");
  assert.equal(config.backend.repo, "nufail619/pdf-fix-hub");
  assert.deepEqual(config.backend.auth_methods, ["oauth"]);
  assert.equal(config.backend.open_authoring, undefined);
  assert.equal(config.collections.length, 2);
  for (const collection of config.collections) {
    assert.equal(collection.create, true);
    assert.equal(collection.delete, true);
    assert.equal(collection.fields.find((f) => f.name === "status").default, "draft");
  }
});

test("CMS preparation refuses insecure or credential-bearing OAuth origins", async () => {
  for (const value of [
    "http://auth.example.test",
    "https://user:secret@auth.example.test",
    "https://auth.example.test/path",
    "https://auth.example.test?token=secret",
  ]) {
    await assert.rejects(prepareCms(process.cwd(), { CMS_AUTH_URL: value }));
  }
});
