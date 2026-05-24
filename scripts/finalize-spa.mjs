// Flatten TanStack Start's SPA build output into a single static dist/ folder
// that any static server (Express, nginx) can serve.
//
// Before: dist/client/ (assets) + dist/client/_shell.html + dist/server/
// After:  dist/index.html + dist/assets/ + static files
import { existsSync, rmSync, renameSync, readdirSync, cpSync } from "node:fs";
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

console.log("[finalize-spa] static SPA ready at dist/");
