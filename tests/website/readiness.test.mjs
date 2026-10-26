import test from "node:test";
import assert from "node:assert/strict";
import { siteSettings } from "../../scripts/site-settings.mjs";
import { articleDate } from "../../src/lib/article-date.ts";
import { parsePrivacyChoices, serviceIds } from "../../src/lib/privacy-consent.ts";
import { publicRoutes } from "../../scripts/public-routes.mjs";
import { validateStaticPage } from "../../scripts/validate-static-page.mjs";
import { addAdSenseVerification, ADSENSE_SCRIPT_URL } from "../../scripts/adsense.mjs";

test("AdSense verification uses the approved publisher once, after denied consent defaults", () => {
  const html = addAdSenseVerification("<html><head></head><body>Content</body></html>");
  assert.ok(
    html.includes(`<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`),
  );
  assert.equal((html.match(/<script async src=/g) || []).length, 1);
  assert.ok(html.indexOf("pauseAdRequests=1") < html.indexOf(ADSENSE_SCRIPT_URL));
  assert.ok(html.indexOf('ad_storage:"denied"') < html.indexOf(ADSENSE_SCRIPT_URL));
  assert.throws(() => addAdSenseVerification(html), /duplicate AdSense loader/);
  assert.throws(() => addAdSenseVerification("<body>No head</body>"), /HTML head/);
});

test("public route inventory includes published articles and all 25 tools without admin or duplicates", async () => {
  const routes = await publicRoutes();
  assert.equal(routes.length, 50);
  assert.equal(new Set(routes).size, routes.length);
  for (const path of [
    "/",
    "/adjust-pdf-brightness",
    "/edit-pdf",
    "/unlock-pdf",
    "/blog/merge-pdfs-without-losing-quality",
    "/guides/rotating-scanned-pdfs",
  ])
    assert.ok(routes.includes(path), path);
  assert.ok(!routes.some((path) => path.startsWith("/admin")));
});

test("publication guard rejects empty shells, duplicate layouts, 404s and template contact details", () => {
  const page =
    '<meta name="robots" content="index,follow"/><header>Navigation</header><main><h1>Merge PDF</h1></main><footer><a href="mailto:mypdffix@gmail.com">Contact</a></footer>';
  assert.doesNotThrow(() => validateStaticPage(page, "/merge-pdf"));
  const preview = page.replace("index,follow", "noindex,nofollow");
  assert.doesNotThrow(() => validateStaticPage(preview, "/merge-pdf", { noIndex: true }));
  assert.throws(() => validateStaticPage(preview, "/merge-pdf"), /indexing metadata/);
  for (const broken of [
    '<div id="root"></div>',
    '<html data-spa-fallback="true">' + page + "</html>",
    page + "<header>Duplicate</header>",
    page + "<footer>Duplicate</footer>",
    page.replace("Merge PDF", "404"),
    page.replace("mypdffix@gmail.com", "hello@example.com"),
  ])
    assert.throws(
      () => validateStaticPage(broken, "/merge-pdf"),
      /Invalid static page \/merge-pdf/,
    );
});

test("privacy choices reject malformed, future, expired and unexpected records", () => {
  const now = Date.now();
  const valid = { version: 1, analytics: true, advertising: false, savedAt: now };
  assert.deepEqual(parsePrivacyChoices(JSON.stringify(valid), now), valid);
  for (const value of [
    "invalid",
    null,
    JSON.stringify({ ...valid, version: 2 }),
    JSON.stringify({ ...valid, analytics: "true" }),
    JSON.stringify({ ...valid, savedAt: now + 1 }),
    JSON.stringify({ ...valid, savedAt: now - 181 * 86400000 }),
  ])
    assert.equal(parsePrivacyChoices(value, now), null);
});
test("service identifiers cannot inject markup or arbitrary script URLs", () => {
  assert.deepEqual(
    serviceIds({
      gaId: "G-TEST123",
      gtmId: "GTM-TEST123",
      clarityId: "test123",
      adsenseId: "ca-pub-1234567890123456",
    }),
    { ga: "G-TEST123", gtm: "GTM-TEST123", clarity: "test123", adsense: "ca-pub-1234567890123456" },
  );
  assert.deepEqual(
    serviceIds({
      gaId: "G-TEST'><script>",
      gtmId: "https://evil.test",
      clarityId: "javascript:alert(1)",
      adsenseId: "ca-pub-123&other=1",
    }),
    { ga: "", gtm: "", clarity: "", adsense: "" },
  );
});
test("Cloudflare Preview always disables indexing and production keeps canonical origin", () => {
  assert.equal(
    siteSettings(process.cwd(), {
      CF_PAGES_BRANCH: "develop/pdf-tools-repair",
      VITE_NOINDEX: "false",
    }).noIndex,
    true,
  );
  const production = siteSettings(process.cwd(), {
    CF_PAGES_BRANCH: "main",
    VITE_NOINDEX: "false",
  });
  assert.equal(production.noIndex, false);
  assert.equal(production.siteUrl, "https://mypdffix.com");
  assert.equal(
    siteSettings(process.cwd(), { CF_PAGES_BRANCH: "main", VITE_NOINDEX: "true" }).noIndex,
    true,
  );
});
test("canonical site origins reject insecure and credential-bearing URLs", () => {
  for (const value of [
    "http://example.test",
    "https://user:example@example.test",
    "https://example.test/path",
    "https://example.test?value=1",
  ])
    assert.throws(
      () => siteSettings(process.cwd(), { VITE_SITE_URL: value }),
      /HTTPS website origin/,
    );
});
test("CMS calendar dates are stable independently of reader timezone", () => {
  const previous = process.env.TZ;
  try {
    for (const tz of ["Pacific/Honolulu", "Asia/Qatar", "Pacific/Auckland"]) {
      process.env.TZ = tz;
      assert.equal(articleDate("2026-04-12"), "April 12, 2026");
    }
  } finally {
    if (previous) process.env.TZ = previous;
    else delete process.env.TZ;
  }
});
