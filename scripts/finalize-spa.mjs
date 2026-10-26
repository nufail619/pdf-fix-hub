// Flatten TanStack Start's SPA build output into a single static dist/ folder
// that any static server (Express, nginx) can serve.
//
// Before: dist/client/ (assets) + dist/client/_shell.html + dist/server/
// After:  dist/index.html + dist/assets/ + static files
import {
  existsSync,
  copyFileSync,
  rmSync,
  renameSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { publicRoutes } from "./public-routes.mjs";
import { validateStaticPage } from "./validate-static-page.mjs";
import { siteSettings } from "./site-settings.mjs";
import { ADSENSE_PUBLISHER_ID, addAdSenseVerification } from "./adsense.mjs";

const dist = "dist";
const clientDir = join(dist, "client");
const serverDir = join(dist, "server");

if (!existsSync(clientDir)) {
  throw new Error("Missing dist/client: run npm run build to create the complete Pages output.");
}

// Drop the SSR server bundle — we're shipping a pure static SPA.
if (existsSync(serverDir)) rmSync(serverDir, { recursive: true, force: true });

// Move every file from dist/client/ up to dist/
for (const name of readdirSync(clientDir)) {
  const from = join(clientDir, name);
  const to = join(dist, name);
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  renameSync(from, to);
}
rmSync(clientDir, { recursive: true, force: true });

// Rename SPA shell to index.html
const shell = join(dist, "_shell.html");
const index = join(dist, "index.html");
if (existsSync(shell)) {
  // Cloudflare Pages serves 404.html (with a 404 status) for unknown URLs;
  // the client router then renders the "Page not found" screen.
  // Keep React's HTML and serialized head state in sync. Rewriting only the
  // HTML meta tag leaves orphaned tags when an article loader returns notFound.
  const notFound = readFileSync(shell, "utf8");
  if (!/<meta[^>]+name="robots"[^>]+content="noindex,nofollow"/.test(notFound))
    throw new Error("The SPA fallback must render its own noindex metadata.");
  copyFileSync(shell, join(dist, "404.html"));
  // Preserve the real prerendered homepage; the SPA shell has no page content.
  if (!existsSync(index)) copyFileSync(shell, index);
  rmSync(shell);
}

// ---- SEO / AdSense files -------------------------------------------------
// Read VITE_* values from the process env or .env files (same as Vite).
const { siteUrl, noIndex } = siteSettings();

const routes = await publicRoutes();
for (const route of routes) {
  const html = join(dist, route.slice(1), "index.html");
  if (!existsSync(html)) throw new Error(`Missing prerendered public page: ${route}`);
  validateStaticPage(readFileSync(html, "utf8"), route, { noIndex });
  if (!noIndex) writeFileSync(html, addAdSenseVerification(readFileSync(html, "utf8")));
}

// Pages serves route.html at /route, while route/index.html redirects to /route/.
// Keep the site's established slashless canonicals and links without redirect hops.
// The admin directory retains its separate /admin/ entry and security policy.
for (const route of routes) {
  if (route === "/") continue;
  const folder = join(dist, route.slice(1));
  const html = join(folder, "index.html");
  if (existsSync(html)) {
    const target = `${folder}.html`;
    if (existsSync(target)) rmSync(target);
    renameSync(html, target);
    if (readdirSync(folder).length === 0) rmSync(folder, { recursive: true });
  }
}
const redirectsPath = join(dist, "_redirects");
const existingRedirects = existsSync(redirectsPath)
  ? readFileSync(redirectsPath, "utf8").trim()
  : "";
const legacyRedirects = routes
  .filter((route) => route !== "/")
  .map((route) => `${route}/index.html ${route} 301`)
  .join("\n");
writeFileSync(
  redirectsPath,
  `${existingRedirects ? existingRedirects + "\n" : ""}# Preserve existing directory-index links\n${legacyRedirects}\n`,
);

if (siteUrl) {
  const urls = routes
    .sort()
    .map((r) => `  <url><loc>${siteUrl}${r === "/" ? "/" : r}</loc></url>`)
    .join("\n");
  writeFileSync(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  writeFileSync(
    join(dist, "robots.txt"),
    noIndex
      ? "User-agent: *\nDisallow: /\n"
      : `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  );
  console.log(`[finalize-spa] sitemap.xml written (${routes.length} URLs)`);
} else {
  console.warn("[finalize-spa] VITE_SITE_URL not set — skipped sitemap.xml");
}

if (noIndex) {
  const headersPath = join(dist, "_headers");
  writeFileSync(
    headersPath,
    readFileSync(headersPath, "utf8") + "\n/*\n  X-Robots-Tag: noindex, nofollow\n",
  );
  console.log("[finalize-spa] Preview indexing disabled in robots.txt, HTML and headers");
}

const pub = ADSENSE_PUBLISHER_ID.replace(/^ca-/, "");
if (/^pub-\d{16}$/.test(pub)) {
  writeFileSync(join(dist, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  console.log("[finalize-spa] ads.txt written");
}

console.log("[finalize-spa] static SPA ready at dist/");
