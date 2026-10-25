# CMS implementation and validation

Implemented on `develop/pdf-tools-repair`, preserving PDF repair commit
`b3fcaeedcc2ff59d27dc8b8275de9900dc0889ad`.
No live GitHub writes, pushes, merges or deployments were made.

## Completed

- `/admin/` with pinned Sveltia CMS, two content collections, Markdown editor,
  live previews, image upload and publication controls.
- Create, edit, preview, publish, unpublish and delete, targeting only the
  development branch. Publication is controlled by the status field and takes
  effect after a successful site build.
- Title, slug, summary, SEO description, date, author, reading time, featured
  image, alternative text and categories.
- Six original articles migrated without changing their original field values
  or paragraph text. Existing article URLs and canonical metadata retained.
- Fixed the pre-existing blog/guide route nesting that displayed listings at
  article URLs. Index routes now allow article components to render correctly.
- Published-only content generation and sitemap; drafts are excluded before
  bundling. Safe Markdown rendering and script-safe Article JSON-LD serialization.
- Deployable official GitHub OAuth authenticator, with a mandatory exact-host
  allowlist, CSRF checks, server-only client secret and no-cache/security headers.
- Fail-closed setup screen until a valid HTTPS authenticator origin is supplied.
- Cloudflare Pages admin security headers and self-hosted CMS fonts/assets.

## Actual verification results

| Check | Result |
| --- | --- |
| CMS/content/OAuth unit tests | 12 passed, 0 failed, 0 skipped |
| CMS Playwright production-browser tests | 8 passed, 0 failed, 0 skipped |
| Existing PDF tool Playwright regression suite | 44 passed, 0 failed, 0 skipped |
| TypeScript | Passed |
| Production build and static prerender | Passed; sitemap contains 37 URLs |
| Lint on changed application TypeScript | Passed |
| Official Sveltia configuration JSON schema | Valid |
| Cloudflare OAuth Worker bundle | Wrangler dry run passed; no deployment |
| Cloudflare Pages local emulator | Admin loads, security headers apply, article renders, source content JSON returns 404 |
| Original-content comparison | All six original articles retain their original fields and paragraph text |

Browser tests ran the actual Sveltia UI with a test-only OAuth popup and an
in-memory GitHub API. Both collections completed the full create/preview/edit/
publish/unpublish/delete flow. Blog testing also uploaded an actual raster image
and verified the saved image reference and asset. Read-only GitHub permissions
were rejected. No mocked credentials or test backend are included in production
configuration.

A separate isolated production build created new blog/guide entries, unpublished
one original entry and deleted another, without changing checkout content. It
verified public pages, featured images, SEO/canonical/Open Graph metadata, sitemap
changes and that a unique draft marker was absent from all generated public text
files. Hostile article titles, HTML and JavaScript links did not execute. This
test caught and verified the fix for script-breaking JSON-LD content.

Browser evidence is retained in `playwright-report/cms/index.html` and
`test-results/cms-results.json`; PDF results are in their existing report folders.
Generated reports, images, downloads and fixtures are ignored by Git.

## External setup still required

Live GitHub OAuth consent, real repository writes, deployment hooks and deployed
hostname behavior have **not** been verified. They need an approved deployment,
GitHub OAuth App, Worker credentials/hostname allowlist and the Pages
`CMS_AUTH_URL` setting. The production admin currently displays setup guidance
instead of offering a fallback login.

Follow [CMS-SETUP.md](CMS-SETUP.md) for exact dashboard steps, editing instructions,
security scope and repeatable test commands. Publication dates are informational,
not a scheduler; Git-backed drafts and public uploads are not confidential storage.
