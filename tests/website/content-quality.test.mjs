import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PDFDocument, PDFName } from "pdf-lib";
import { estimateReadTime } from "../../scripts/reading-time.mjs";
import { loadContent } from "../../scripts/content.mjs";
import { publicRoutes } from "../../scripts/public-routes.mjs";
import {
  isAdEligiblePath,
  addAdSenseVerification,
  ADSENSE_PUBLISHER_ID,
  ADSENSE_SCRIPT_URL,
} from "../../scripts/adsense.mjs";
import { reorderPages } from "../../src/lib/pdf/reorderPages.ts";
import { editMetadata } from "../../src/lib/pdf/metadata.ts";
import { toolContent } from "../../src/data/toolContent.ts";

test("ad eligibility fails closed for missing content, utilities and every searchable listing", async () => {
  const routes = await publicRoutes();
  for (const path of [
    "/",
    "/blog",
    "/guides",
    "/contact",
    "/privacy",
    "/terms",
    "/cookie-policy",
    "/disclaimer",
    "/admin/",
    "/not-a-page",
    "/blog/missing",
    "/guides/missing",
  ])
    assert.equal(isAdEligiblePath(path, routes), false, path);
  for (const path of [
    "/merge-pdf",
    "/adjust-pdf-brightness",
    "/edit-pdf",
    "/unlock-pdf",
    "/blog/merge-pdfs-without-losing-quality",
    "/guides/rotating-scanned-pdfs",
  ])
    assert.equal(isAdEligiblePath(path, routes), true, path);
  assert.equal(isAdEligiblePath("/merge-pdf/", routes), true);
  const metaOnly = addAdSenseVerification("<html><head></head><body>Search</body></html>", {
    allowAds: false,
  });
  assert(metaOnly.includes(`name="google-adsense-account" content="${ADSENSE_PUBLISHER_ID}"`));
  assert(!metaOnly.includes(ADSENSE_SCRIPT_URL));
  assert.throws(
    () => addAdSenseVerification(metaOnly, { allowAds: false }),
    /duplicate AdSense ownership/,
  );
});

test("reading time is a text estimate, not a stale manual value or a task-duration claim", async () => {
  assert.equal(estimateReadTime(""), "1 min read");
  assert.equal(estimateReadTime("word ".repeat(200)), "1 min read");
  assert.equal(estimateReadTime("word ".repeat(201)), "2 min read");
  assert.equal(
    estimateReadTime(
      "[Read](https://example.test/" + "path/".repeat(300) + ") ![ignored](image.png)",
    ),
    "1 min read",
  );
  const content = await loadContent();
  for (const article of [...content.blog, ...content.guides])
    assert.equal(article.readTime, estimateReadTime(article.body));
});

test("all original and new articles retain their URLs, useful sections and valid contextual tool links", async () => {
  const { blog, guides } = await loadContent();
  const routes = new Set(await publicRoutes());
  assert.equal(blog.length, 13);
  assert.equal(guides.length, 3);
  for (const article of [...blog, ...guides]) {
    assert((article.body.match(/^## /gm) || []).length >= 3, article.slug);
    const links = [...article.body.matchAll(/\]\((\/[^)#]+)(?:#[^)]*)?\)/g)].map(
      (match) => match[1],
    );
    assert(links.length >= 2, article.slug);
    for (const path of links) {
      if (path.startsWith("/samples/") || path.startsWith("/uploads/"))
        await readFile("public" + path);
      else assert(routes.has(path), `${article.slug}: ${path}`);
    }
    assert(
      !/copies pages byte-for-byte|millions of PDFs|triples the file size|wrong more often|10 times larger/.test(
        article.body,
      ),
    );
  }
});

test("reorder documentation matches strict page validation and the resulting page count", async () => {
  const doc = await PDFDocument.create();
  for (const size of [100, 200, 300]) doc.addPage([size, 400]);
  const file = new File([await doc.save()], "three-pages.pdf", { type: "application/pdf" });
  for (const order of ["1,1,2", "1,2", "1,2,4", "1,2,3,3", "1,2,0"])
    await assert.rejects(reorderPages(file, order), /every page from 1 to 3 exactly once/);
  const reordered = await PDFDocument.load(await (await reorderPages(file, "3,1,2")).arrayBuffer());
  assert.deepEqual(
    reordered.getPages().map((page) => page.getWidth()),
    [300, 100, 200],
  );
  const help = JSON.stringify(toolContent["reorder-pdf-pages"]);
  assert(help.includes("exactly once"));
  assert(!/are ignored|includes that page twice|are dropped/.test(help));
});

test("metadata clear has the limited scope described to users: six strings, retained creation date and XMP", async () => {
  const source = await PDFDocument.create();
  source.addPage();
  source.setTitle("Private title");
  source.setAuthor("Author");
  source.setSubject("Subject");
  source.setKeywords(["keyword"]);
  source.setCreator("Creator");
  source.setProducer("Producer");
  const date = new Date("2020-01-02T00:00:00Z");
  source.setCreationDate(date);
  source.setModificationDate(date);
  const xmp = source.context.register(
    source.context.stream("<xmpmeta>kept</xmpmeta>", { Type: "Metadata", Subtype: "XML" }),
  );
  source.catalog.set(PDFName.of("Metadata"), xmp);
  const file = new File([await source.save()], "metadata.pdf", { type: "application/pdf" });
  const output = await PDFDocument.load(
    await (await editMetadata(file, { clear: true })).arrayBuffer(),
    { updateMetadata: false },
  );
  for (const value of [
    output.getTitle(),
    output.getAuthor(),
    output.getSubject(),
    output.getKeywords(),
    output.getCreator(),
    output.getProducer(),
  ])
    assert.equal(value, "");
  assert.equal(output.getCreationDate().toISOString(), date.toISOString());
  assert(output.getModificationDate() > date);
  const retainedXmp = output.context.lookup(output.catalog.get(PDFName.of("Metadata")));
  assert(retainedXmp.getContentsString().includes("<xmpmeta>kept</xmpmeta>"));
  assert(JSON.stringify(toolContent["edit-pdf-metadata"]).includes("not removed"));
});

test("tool help avoids the confirmed false promises about flattening, output format, printer ink and file sizes", async () => {
  const help = JSON.stringify(toolContent);
  assert(
    !/70%|locks a PDF so it can't be changed|Send or print the locked|four times the size|prints the page number only|uses only black ink/.test(
      help,
    ),
  );
  assert(JSON.stringify(toolContent["add-page-numbers-to-pdf"]).includes("1 / 3"));
  assert(JSON.stringify(toolContent["pdf-to-jpg"]).includes("white background"));
  assert(JSON.stringify(toolContent["grayscale-pdf"]).includes("printer and driver"));
  const faq = await readFile("src/data/faqs.ts", "utf8");
  assert(!/100 MB|without any limits|works in any modern browser/.test(faq));
});
