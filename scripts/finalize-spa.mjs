// Flatten TanStack Start's SPA build output into a single static dist/ folder
// that any static server (Express, nginx) can serve.
//
// Before: dist/client/ (assets) + dist/client/_shell.html + dist/server/
// After:  dist/index.html + dist/assets/ + static files
import { existsSync, rmSync, renameSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dist = "dist";
const clientDir = join(dist, "client");
const serverDir = join(dist, "server");

if (!existsSync(clientDir)) {
  console.log("[finalize-spa] no dist/client — skipping");
  process.exit(0);
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
  if (existsSync(index)) rmSync(index);
  renameSync(shell, index);
}

// ---- SEO / AdSense files -------------------------------------------------
// Read VITE_* values from the process env or .env files (same as Vite).
function loadEnv() {
  const env = {};
  for (const f of [".env", ".env.production", ".env.local"]) {
    if (!existsSync(f)) continue;
    for (const line of readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
  return { ...env, ...process.env };
}
const env = loadEnv();
const siteUrl = (env.VITE_SITE_URL || "").replace(/\/$/, "");

// Every static route file becomes a sitemap entry; blog and guide slugs are
// read from the data files.
const routes = readdirSync("src/routes")
  .filter((f) => f.endsWith(".tsx") && !f.startsWith("__") && !f.includes("$"))
  .map((f) => f.replace(/\.tsx$/, ""))
  .map((r) => (r === "index" ? "/" : "/" + r));
for (const [file, prefix] of [
  ["src/data/blogPosts.ts", "/blog/"],
  ["src/data/guides.ts", "/guides/"],
]) {
  if (!existsSync(file)) continue;
  for (const m of readFileSync(file, "utf8").matchAll(/slug:\s*"([^"]+)"/g))
    routes.push(prefix + m[1]);
}

if (siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = routes
    .sort()
    .map(
      (r) => `  <url><loc>${siteUrl}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod></url>`,
    )
    .join("\n");
  writeFileSync(
    join(dist, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
  writeFileSync(
    join(dist, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  );
  console.log(`[finalize-spa] sitemap.xml written (${routes.length} URLs)`);
} else {
  console.warn("[finalize-spa] VITE_SITE_URL not set — skipped sitemap.xml");
}

const pub = (env.VITE_ADSENSE_ID || "").replace(/^ca-/, "");
if (pub) {
  writeFileSync(join(dist, "ads.txt"), `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`);
  console.log("[finalize-spa] ads.txt written");
}

console.log("[finalize-spa] static SPA ready at dist/");
