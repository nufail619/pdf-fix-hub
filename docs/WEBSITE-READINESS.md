# Website audit and release readiness

Development branch: `develop/pdf-tools-repair`. Base commit:
`10b1c1999514d0f8bf49bdd56d7a0484ebc34cdc`. The audit preserves the completed
PDF tools and CMS from that baseline. Validation was performed locally;
no push, merge, website deployment or authentication Worker deployment was made.
The owner has separately confirmed real GitHub CMS login on the existing Preview.

## Completed improvements

| Area                   | Completed                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Homepage and discovery | Search across all 25 tools, category filters, result counts, empty-state recovery; original tool order preserved.                                                                                                                                                                                                                                                                                                                                                    |
| Blog and guides        | Search, category filtering, empty states, consistent date/author metadata, semantic dates and stable calendar dates in every timezone. All six existing JSON entries and slugs remain unchanged.                                                                                                                                                                                                                                                                     |
| Rendering and SEO      | Fixed the SPA shell overwriting the rendered homepage. All 40 public URLs contain real HTML without JavaScript. Static pages are emitted as route.html so Cloudflare serves the established slashless URLs without redirecting to a different canonical. Canonicals, social metadata, a PNG sharing image, Article/Organization/SoftwareApplication/Breadcrumb schemas and sitemap preserved or completed. Removed fabricated per-build sitemap last-modified dates. |
| Preview indexing       | Non-main Cloudflare branch builds emit noindex HTML and headers, plus robots exclusion. Production canonical URLs remain unchanged. Preview cannot opt into indexing accidentally by setting `VITE_NOINDEX=false`.                                                                                                                                                                                                                                                   |
| Accessibility          | Skip link, labeled controls, native keyboard file chooser, visible focus, improved red/gray text contrast, reduced-motion support, accessible FAQ controls, keyboard desktop navigation and a mobile dialog with Escape/focus restoration. Removed duplicate layouts/main landmarks on 404 pages.                                                                                                                                                                    |
| Responsive design      | Checked every public page at 320, 390, 768 and 1440 pixels; long email/content handling and bounded menus/dialogs. Existing cards, typography and overall layout retained. Primary red and muted text were slightly darkened to meet contrast requirements.                                                                                                                                                                                                          |
| Privacy                | Granular optional analytics/advertising consent; no optional scripts before consent; persistent/revisitable choices, revocation reload, expiry and storage-failure handling; browser privacy signals honored. Fixed inert innerHTML-based script injection using validated script URLs and DOM creation. Tool workspaces are marked for Clarity masking.                                                                                                             |
| Performance            | Self-hosted Inter font, hashed-asset caching, lazy article images and an actual prerendered homepage. No external font request is needed.                                                                                                                                                                                                                                                                                                                            |
| Security               | Shared Pages headers, existing admin CSP/auth protections retained, validated canonical origin and tracking IDs, and dependency remediation. No application passwords or embedded API credentials added.                                                                                                                                                                                                                                                             |
| Admin                  | Current GitHub OAuth behavior and development content branch preserved; logo stays legible on dark backgrounds. No authentication Worker code changed.                                                                                                                                                                                                                                                                                                               |
| Maintainability        | Full lint now passes after scoped formatting/type cleanup; generated/vendor files are excluded from lint. Added a read-only CI verification workflow and a root developer guide.                                                                                                                                                                                                                                                                                     |

## Development verification evidence

| Check                                         | Result                                                                                             |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Existing PDF browser regression suite         | 44 passed                                                                                          |
| New PDF tool browser suite                    | 19 passed                                                                                          |
| CMS browser suite                             | 8 passed                                                                                           |
| Existing CMS/OAuth/content unit tests         | 12 passed                                                                                          |
| PDF pixel/editor unit tests                   | 6 passed                                                                                           |
| Website browser suite                         | 52 passed                                                                                          |
| Website privacy/configuration/date unit tests | 5 passed                                                                                           |
| Total                                         | **146 passed; 0 failed, skipped or flaky**                                                         |
| TypeScript                                    | Passed                                                                                             |
| Production build/prerender                    | Passed; 40 sitemap entries                                                                         |
| Full project lint                             | Passed; 8 pre-existing Fast Refresh warnings, 0 errors                                             |
| Dependency audit                              | 0 known advisories after remediation; initial audit reported 76 advisories across 20 package names |
| Frozen lockfile install                       | Passed with checksums/TLS/release-age protections retained                                         |

Cloudflare's actual local Pages emulator also passed checks for the rendered
homepage, canonical URLs without redirect hops, legacy directory-index redirects,
admin security headers, hydrated 404/noindex behavior and exclusion of content
source JSON. This local runtime check does not replace testing the approved live
Preview build.

The 52 website browser cases include automated axe WCAG A/AA checks on every
public page, four viewport widths per page, local-link/image checks, no-JavaScript
content, menus and focus, search/filter recovery, file validation and 404 behavior.
No automated accessibility violations were found in those scans; this is not a
claim of complete manual accessibility certification.

An isolated additional Preview build validates actual noindex HTML/headers/robots
and privacy behavior with public fixture tracking IDs. Third-party requests are
intercepted: rejection produces zero requests, analytics consent loads only the
analytics category, accepting both categories loads all configured services, and
withdrawal reloads without tracking. Privacy signals and unavailable browser
storage are tested. No real visitor tracking or live CMS content writes occur.
The same isolated checkout is then rebuilt with `CF_PAGES_BRANCH=main` to verify
that Preview noindex output is replaced: public pages allow indexing while the
admin remains excluded. Consent tests also verify that changing a saved choice
sends Google's consent update command rather than repeating its default command.

Existing PDF tests still independently inspect actual downloads with pypdf,
Pillow and Poppler. CMS browser tests use the real Sveltia UI with a test-only
GitHub API. The owner-confirmed live OAuth result is separate from these mocks.

Detailed local evidence (ignored by Git):

- `test-results/website-results.json`, `playwright-report/website/index.html`.
- Per-page `accessibility.json` and the isolated Preview consent/build evidence.
- `test-results/pdf-tools-results.json`, `test-results/new-tools-results.json`,
  `test-results/cms-results.json`, verified downloads and rendered PDFs.

Desktop/mobile homepage, menu, article listing, privacy dialog and sharing image
were also visually reviewed.

## Dependency changes

Updated the compatible TanStack framework/router packages and removed obsolete
framework overrides that forced vulnerable versions. Updated Vite, fflate,
Mammoth and Zod, and resolved affected build/transitive packages to patched
versions. The fresh lockfile was generated by Bun and installed frozen; existing
PDF processing source modules and the pinned Sveltia bundle version are unchanged.
No checksum, TLS or minimum-release-age check was disabled. A stale cached
registry response was resolved by refreshing package metadata, not weakening
verification.

## Owner decisions and external checks before release

1. Push only after separate approval, then test the new Preview build. The
   currently deployed Preview still contains the earlier commit.
2. Use Cloudflare's exact stable development-branch Preview hostname for admin
   sign-in and include it in the authentication Worker's `ALLOWED_DOMAINS`. Do not
   use a wildcard. Individual hash-based deployment URLs change with each build.
3. Before an approved production release, confirm the Production Pages environment
   also has `CMS_AUTH_URL`, the canonical `VITE_SITE_URL`, and intended indexing
   settings. Keep `main` as the production branch. Approve the exact production
   admin hostname in the authenticator separately.
4. The CMS still writes to `develop/pdf-tools-repair`. Promoting the website does
   not silently grant CMS writes to `main`. Agree the ongoing content review and
   production publishing branch before enabling production editorial work.
5. Analytics/advertising IDs are currently empty. If enabling them, confirm account
   ownership, provider settings and privacy text. GTM tags must honor the supplied
   consent state. This site's preference controls do not replace a Google-certified
   consent-management platform where Google's advertising policies require one.
6. After an approved Preview push, perform the owner review on real mobile devices,
   Safari/Firefox, assistive technology and the real GitHub login. Automated browser
   coverage here is Chromium with desktop/mobile viewports. Verify actual Cloudflare
   response headers, redirects, DNS/TLS and canonical hostname during the release
   check, rather than assuming local checks establish live hosting behavior.

The added GitHub Actions workflow has not executed on GitHub yet because these
changes have not been pushed. It only runs checks and cannot deploy.
