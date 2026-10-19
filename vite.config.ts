import { defineConfig } from "@lovable.dev/vite-tanstack-config";

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
    build: {
      outDir: "dist",
    },
    // Bind the prerender preview server to IPv4 (some hosts/CI have no IPv6).
    preview: {
      host: "127.0.0.1",
    },
  },
});
