import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Static SPA build: disable Cloudflare Worker output and enable TanStack Start
// SPA mode so `vite build` emits a static dist/ (index.html + assets/) servable
// by any static file server (Express, nginx, etc.).
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    spa: { enabled: true },
  },
  vite: {
    build: {
      outDir: "dist",
    },
  },
});
