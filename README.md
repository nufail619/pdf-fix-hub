# PDF Fix Hub / MY PDF FIX

Static React/TypeScript website with 25 browser-based PDF tools, published blog
posts and guides, and a separate Sveltia CMS admin panel. Documents are processed
locally. The website deploys to Cloudflare Pages; GitHub OAuth uses a separate
Worker in `cms-auth/`.

Current development branch: `develop/pdf-tools-repair`. Do not merge, push or
deploy changes without the owner's approval.

## Development

Use Node 24 and Bun 1.3.3. Keep the lockfile integrity checks and the existing
24-hour package release guard enabled.

```sh
bun install --frozen-lockfile
npm run dev
```

Vite prepares the CMS assets and published content manifest automatically.
Generated content, CMS vendor assets, build output and browser reports are ignored
by Git. Local configuration belongs in `.env.local`; never add credentials to
frontend variables or committed environment files. The existing tracked `.env`
contains only public website settings.

## Verification

Install Chromium for Playwright, Python dependencies from
`tests/new-tools/requirements.txt`, and Poppler (`pdftoppm`). Then run:

```sh
npm run lint
npm run typecheck
npm run test:cms:unit
npm run test:new-tools:unit
npm run test:website:unit
npm run build
npm run test:pdf-tools
npm run test:new-tools
npm run test:cms
npm run test:website
bun audit
```

On this cloud environment, set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` for browser tests. Other
machines can use `npx playwright install --with-deps chromium`. Run browser suites
sequentially because they share a test-server port. `npm run preview` is unsuitable
for the finalized static build because its SSR server is intentionally removed;
the Playwright configurations include static servers for the actual `dist/`.

The GitHub Actions workflow in `.github/workflows/ci.yml` runs these checks on
development/production branch pushes and pull requests. It has read-only repository
permissions and contains no deployment job. CI service execution must still be
confirmed after an approved push.

## Content and configuration

- Published JSON entries in `content/blog` and `content/guides` generate public
  listings, pages and the sitemap. Draft bodies are excluded before bundling.
- Existing slugs are public URLs. Preserve them; intentional slug changes need
  corresponding redirects.
- `VITE_SITE_URL` is the canonical HTTPS origin. It stays the production origin
  for Preview builds. Cloudflare branches other than `main` are automatically
  noindex; `VITE_NOINDEX=true` can also disable indexing explicitly.
- Optional tracking IDs are validated and remain inactive until the relevant
  visitor consent. Privacy settings are available in the footer. Tracking IDs
  are currently empty in the committed configuration.
- `CMS_AUTH_URL` is the public OAuth Worker origin. Client secrets belong only
  in that Worker's encrypted secret settings.

See [CMS setup](docs/CMS-SETUP.md), [PDF verification](tests/pdf-tools/README.md),
[new PDF tools](docs/NEW-PDF-TOOLS.md), and the
[website audit and release notes](docs/WEBSITE-READINESS.md).
