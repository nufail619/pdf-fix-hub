import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Generate CMS assets and published-only content for both dev and production.
execFileSync(process.execPath, ["scripts/prepare-cms.mjs"], { stdio: "inherit" });

// Static SPA build: disable Cloudflare Worker output and enable TanStack Start
// SPA mode so `vite build` emits a static dist/ (index.html + assets/) servable
// by any static file server (Express, nginx, etc.).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
    // Prerender every linked page to static HTML so search engines and the
    // AdSense reviewer see full content without running JavaScript.
    prerender: { enabled: true, crawlLinks: true, failOnError: true },
  },
  vite: {
    plugins: [
      {
        name: "cms-content-reload",
        configureServer(server) {
          const contentRoot = resolve("content");
          server.watcher.add(contentRoot);
          const refresh = (file: string) => {
            if (file.startsWith(contentRoot + "/") && file.endsWith(".json")) {
              try {
                execFileSync(process.execPath, ["scripts/content.mjs"], { stdio: "inherit" });
                server.ws.send({ type: "full-reload" });
              } catch (error) {
                server.config.logger.error(`CMS content validation failed: ${String(error)}`);
              }
            }
          };
          server.watcher.on("add", refresh).on("change", refresh).on("unlink", refresh);
        },
      },
    ],
    build: {
      outDir: "dist",
    },
    // Bind the prerender preview server to IPv4 (some hosts/CI have no IPv6).
    preview: {
      host: "127.0.0.1",
    },
  },
});
