# PDF Fix Hub admin setup and owner guide

The admin panel is `/admin/`. It uses **Sveltia CMS 0.251.0**, GitHub OAuth and
GitHub repository permissions. There are no application passwords, embedded
credentials, public write endpoints or anonymous content writes.

## What is already implemented

- Separate Blog posts and Guides collections, with create/edit/delete and live
  editor previews. Existing content is migrated to `content/blog/*.json` and
  `content/guides/*.json`, retaining all six original URLs and paragraphs.
- Title, URL slug, summary, SEO description, date, author, reading time, image,
  alternative text, categories and Markdown body fields.
- Publication status defaults to Draft. Only Published entries reach public
  HTML, JavaScript bundles, listings and the sitemap. Source JSON is not copied
  into the public site. Markdown HTML is skipped, and unsafe link protocols are
  removed by the renderer. Images are validated as supported local raster files.
- All CMS writes target **`develop/pdf-tools-repair`**, never `main`. Saving an
  entry later creates a Git commit through GitHub in that branch. This is separate
  from committing the CMS implementation itself.
- A separate deployable Cloudflare OAuth Worker lives in `cms-auth/`. It uses the
  official MIT-licensed Sveltia authenticator, pinned in `UPSTREAM.md`, with a
  required exact hostname allowlist, CSRF cookie checks and security headers.
- Cloudflare Pages static `_headers` set noindex, no-store, CSP and anti-framing
  protections for the admin. `/uploads/` has restrictive content-type protections.

## Account setup still required

Nothing has been deployed or connected to your GitHub account by this work. The
following steps require your approval and access to the relevant dashboards.

### 1. Create the Cloudflare OAuth Worker

After approving deployment, deploy the `cms-auth` directory as a Cloudflare
Worker. Its `wrangler.toml` selects `index.js`. From the repository root, the local
Wrangler CLI can later deploy it with:

```sh
./node_modules/.bin/wrangler deploy --config cms-auth/wrangler.toml
```

This command **deploys**; do not run it until deployment is approved. Copy the
Worker HTTPS origin displayed by Cloudflare, for example
`https://pdf-fix-hub-cms-auth.YOUR-SUBDOMAIN.workers.dev`.

### 2. Register a GitHub OAuth App

In GitHub Settings → Developer settings → OAuth Apps → New OAuth App:

- Application name: `PDF Fix Hub Admin`.
- Homepage URL: the exact HTTPS website that will host `/admin/`.
- Authorization callback URL: the Worker origin followed by `/callback`.

Generate a client secret. Enter it **only in the Worker's encrypted secret
settings**, not in chat, Git, a Pages public variable or an admin configuration
file. Use GitHub two-factor authentication for editor accounts.

### 3. Configure the Worker

In that Worker's Settings → Variables and Secrets, add:

| Name                   | Where/value                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `GITHUB_CLIENT_ID`     | OAuth App Client ID                                                            |
| `GITHUB_CLIENT_SECRET` | OAuth App client secret; encrypted Worker secret                               |
| `ALLOWED_DOMAINS`      | Exact website hostname(s), comma-separated; no scheme, path, port or wildcards |

Include only the intended admin hosts. For a Pages preview, copy its stable
branch-alias hostname from the Cloudflare dashboard. Do not allow every Pages
preview, `*.pages.dev` or every branch: untrusted preview code must not receive
editor credentials. The wrapper refuses empty or wildcard allowlists.

Open the admin using that stable branch-alias address when reviewing new builds.
An individual deployment's hash-based hostname changes on each deployment; allowing
only an old hash hostname will cause “Your domain is not allowed” on the next one.

The GitHub app requests repository access (`repo`, plus Sveltia's user scope).
GitHub OAuth Apps cannot limit this scope to one repository. Prefer an editor
account with access only to the repositories it needs. Authorization to change
content is still enforced by GitHub permissions: grant only intended editors
Write access to `nufail619/pdf-fix-hub`; read-only users cannot save content.

OAuth access tokens are necessarily used by the signed-in browser to call GitHub.
They are never build-time configuration or publicly embedded site credentials.
Use a trusted browser, sign out after editing and revoke the OAuth App in GitHub
Settings → Applications if access must be removed. The client secret never enters
the browser and the Worker does not log tokens.

### 4. Configure Cloudflare Pages

For the existing Pages project:

- Build command: `npm run build` (or the existing equivalent).
- Build output directory: `dist`.
- Node version: the validated Node 24 environment, or a compatible Vite-supported
  Node release. Keep Bun available for the existing frozen-lockfile install.
- Add **`CMS_AUTH_URL`**: the Worker's HTTPS origin, without `/auth`, `/callback`,
  query strings or credentials. This is a public endpoint URL, not a secret.
- Retain the existing **`VITE_SITE_URL`**, canonical production website origin,
  and other current site configuration.
- If testing this branch on Pages, enable a preview build for
  `develop/pdf-tools-repair` and set `CMS_AUTH_URL` in its Preview environment.
  Keep the project's existing production branch unchanged.
- Retain Pages Git integration so later approved CMS commits trigger builds.

After approving the implementation for commit/push and deployment, rebuild the
Pages branch. Without `CMS_AUTH_URL`, `/admin/` intentionally shows setup guidance
and does not initialize the CMS or a fallback login. With it, the panel shows
**Sign In with GitHub**. Normal production hosts offer no local or token-login
option; Sveltia's real filesystem option appears only on localhost for developers.

Admin assets are generated from pinned npm packages during `vite dev` and
`vite build`; do not edit or commit generated `public/admin/vendor`, configuration
or `src/generated` files. Edit `scripts/prepare-cms.mjs` if configuration changes
are needed. No Node server or Pages Functions are needed for the website; OAuth
is handled by the separate Worker. The existing app Wrangler configuration is not
used to upload the static Pages build.

## Everyday editing

1. Visit `/admin/` on the approved Pages branch and sign in with GitHub.
2. Select Blog posts or Guides, then New or an existing entry.
3. Fill in the fields. Use lowercase hyphenated slugs, such as `working-with-pdfs`.
   Keep existing slugs unchanged to preserve search links; a deliberate URL change
   needs a corresponding redirect before deployment.
4. Use the live preview to review your entry, including image and Markdown body.
5. **Save a draft:** leave Publication status at Draft / unpublished, then Save.
6. **Publish:** choose Published, then Save. It appears on that branch's website
   after the next successful Pages build. On this development branch, this does
   **not** publish to the production `main` branch.
7. **Unpublish:** change the status back to Draft / unpublished, then Save. The next
   successful build removes the page from the public site and sitemap. A failed
   build leaves the previous deployed site in place; inspect the Pages build log.
8. **Delete:** use the entry's delete action and confirm. The next successful
   build removes the page. Git history preserves the old content for recovery.

The publication date is a displayed date, **not a scheduling service**. Upload
JPG/JPEG, PNG, WebP, GIF or AVIF images, up to 5 MB, with descriptive alt text.
Files are stored in `public/uploads`. SVG uploads and unsafe paths are rejected by
the site build. Delete unused media deliberately; removing an article does not
automatically remove images that other articles may use.

Draft status prevents publication in the website build; it does not make Git
history or uploaded assets confidential. Never put secrets or sensitive personal
information in content files or uploads, especially in a public repository.

## Local checks and test boundaries

```sh
npm run typecheck
npm run test:cms:unit
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:cms
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:pdf-tools
```

Browser CMS tests run the actual Sveltia bundle against a **test-only in-memory
GitHub API and OAuth popup**. They never send live GitHub writes or modify the
checkout's content. This checks UI loading and persistence contracts, not live
GitHub authorization. Worker tests exercise CSRF, allowlists, missing secrets and
token exchange with a stubbed GitHub response. Content tests exercise publication
filtering and validation. Reports/downloads remain ignored under `test-results`
and `playwright-report`.

Live OAuth consent, real GitHub writes, Pages deployment hooks and live hostname
headers remain unverified until the account setup above is completed and deployment
is explicitly approved. No secret or credential is needed to run the local tests.

Sources: [Sveltia GitHub backend](https://sveltiacms.app/en/docs/backends/github),
[official authenticator](https://github.com/sveltia/sveltia-cms-auth),
[Cloudflare Pages Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/),
[Pages headers](https://developers.cloudflare.com/pages/configuration/headers/).
