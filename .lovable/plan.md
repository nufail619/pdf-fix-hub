## Convert TanStack Start project to static SPA build

Switch the project from a Cloudflare Worker SSR build to a fully static SPA bundle that any static server (Express, nginx) can serve from `dist/`.

### 1. Enable SPA mode in TanStack Start

Update `vite.config.ts` to disable SSR and enable SPA prerender mode. TanStack Start supports this via the `spa` option:

```ts
export default defineConfig({
  tanstackStart: {
    spa: { enabled: true },
    // remove the `server: { entry: "server" }` override
  },
});
```

This makes the build emit a static `index.html` shell that hydrates client-side. All routes resolve through client-side routing.

### 2. Remove Cloudflare/Worker artifacts from the build output

- The Lovable preset includes the `@cloudflare/vite-plugin` for the production build, which targets Workers (`dist/_worker.js`, `wrangler.jsonc`). For a pure static SPA, override the Vite build target so the output is a plain `dist/` with `index.html` + `assets/`.
- Pass `vite: { build: { ssr: false } }` plus an explicit `outDir: "dist"` through `@lovable.dev/vite-tanstack-config`'s `defineConfig`.
- Keep `wrangler.jsonc` and `src/server.ts` in the repo (they're harmless and used only when the Worker plugin runs), but rely on the SPA build output for deployment.

### 3. Head/SEO behaviour

No code changes required to route files. Every route already uses `head: () => seoHead(...)` or `head: ({ loaderData }) => ...`. In SPA mode TanStack Router runs `head()` client-side on navigation and updates `<title>` and `<meta>` through `<HeadContent />`, which is already wired in `src/routes/__root.tsx`. AdSense and analytics in `HeadScripts.tsx` continue to work (they already run in `useEffect`).

Note: the initial HTML served by Express will have a generic title/description until React hydrates. This is acceptable for AdSense; for crawler SEO we'd need prerendering (out of scope for this task).

### 4. 404 fallback

The SPA build emits a single `index.html`. The Express server should be configured to serve `index.html` for any unmatched route — the existing `NotFoundComponent` in `__root.tsx` then handles the 404 UI client-side. No code change needed in the app.

### 5. Scripts

`npm run build` already runs `vite build`. With the SPA config it will output to `dist/`. No script changes required, but verify `dist/index.html` + `dist/assets/` are produced (and no `_worker.js`).

### 6. Verification

After the config change:
- Run the build and confirm it completes without errors.
- List `dist/` contents and confirm: one `index.html`, an `assets/` folder with hashed JS/CSS, and the static files from `public/` (favicon, robots.txt, ads.txt, logo.svg, og-default.svg).
- Spot-check by serving `dist/` with a static server and navigating to `/`, `/merge-pdf`, `/split-pdf`, and an unknown route to confirm client-side routing and the 404 fallback both work.
- Report the final `dist/` size and file tree.

### Files touched

- `vite.config.ts` — switch to SPA mode, set `dist` outDir, disable Worker SSR output.
- (Possibly) `package.json` — only if a build script tweak is needed; expected: no change.
- No changes to any route files, components, or `src/routes/__root.tsx`.

### Out of scope

- True prerendering of each route's HTML (would require enabling TanStack's prerender list — can be added later if SEO crawlers need per-route HTML).
- Express server code itself (user is hosting separately).
