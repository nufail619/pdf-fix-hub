# AdSense readiness improvements — review copy

Work is on `develop/pdf-tools-repair`, based on commit
`5582183ecd3c6c7ddbf1470640a699c4a7faf5dd`. The checkout was clean before this
work. These changes are uncommitted. Nothing has been pushed, merged or deployed;
the live website is unchanged by this task.

## Advertising eligibility and ownership

- Missing URLs, missing blog posts and missing guides receive no Google ad loader,
  even with previously accepted advertising consent.
- The searchable homepage, Blog and Guides listings remain ad-free in both their
  populated and empty states. Contact and legal pages are also excluded as a site
  placement choice. This is not a claim that Google prohibits ads on every legal page.
- Known, published content routes are eligible only after successful settled router
  matches, on an indexable build, with advertising consent. Manual ad slots use the
  same gate; the slot component is currently unused.
- Leaving a document containing the Google loader for an excluded URL pauses ad
  requests and opens a fresh document. Removing a script tag alone would leave its
  executed code active. Content-to-content navigation retains the client router
  and deduplicates the loader.
- All 40 valid public production pages retain the owner's AdSense account meta
  tag. The 32 content pages also retain the exact asynchronous Google loader and
  anonymous crossorigin attribute. The publisher remains
  `ca-pub-1040851064865171`; `ads.txt` is unchanged.
- Preview/noindex builds remain excluded from the ad runtime, including after
  advertising consent. Consent defaults, rejection, revocation and browser opt-out
  handling remain in place. Analytics consent is handled separately.

See [the ownership and eligibility implementation notes](ADSENSE-VERIFICATION.md).
Google's official [ownership instructions](https://support.google.com/adsense/answer/7584263?hl=en)
include the meta-tag option. Its [publisher-content policy](https://support.google.com/publisherpolicies/answer/11112688?hl=en)
excludes screens without publisher content or with low-value content, including
error/dead-end examples. Both official pages were read during this task.

## Corrected tool instructions and claims

| Page                                        | Correction                                                                                                                                                                                                                                                                                  |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/reorder-pdf-pages`                        | Every original page must appear exactly once. Missing, duplicate and out-of-range numbers cause an error; they are not silently dropped or ignored.                                                                                                                                         |
| `/flatten-pdf`                              | Flattening is not a PDF lock, password protection or secure redaction. Instructions, SEO and the full-flatten result message distinguish flattened appearances from prevention of later editing.                                                                                            |
| `/edit-pdf-metadata`                        | The clear option blanks title, author, subject, keywords, creator and producer. It retains an existing creation date and updates modification time. XMP, comments, attachments and page contents can remain. The checkbox and nearby explanation no longer promise removal of all metadata. |
| `/split-pdf`                                | A comma-separated part creates one PDF. One part downloads as a PDF; several parts are bundled in a ZIP. Examples use the real Process button. There is no automatic every-page/bookmark/size-based split mode.                                                                             |
| `/add-page-numbers-to-pdf`                  | The format is current / total, with four available positions. There is no custom numbering text or Roman-numeral control. Re-running adds another overlay rather than replacing old numbers.                                                                                                |
| `/pdf-to-jpg`                               | Both image converters use a white background. Doubling DPI gives four times the pixels, not a guaranteed fourfold compressed file size.                                                                                                                                                     |
| `/grayscale-pdf`                            | Gray page appearance does not guarantee black-ink-only printing; printer/driver settings determine that. Rasterization and loss of selectable text are explained.                                                                                                                           |
| `/compress-pdf`                             | Removed the unsupported 70% saving claim and guaranteed quality/attachment-limit implications. Recommended and Strong may choose a rasterized result; savings depend on the source.                                                                                                         |
| `/merge-pdf`                                | Uses the actual Process button and file-list ordering. Removed absolute privacy, device-compatibility and exact-preservation promises; added a concrete page-count example and output checks.                                                                                               |
| Homepage, About, shared help, cards and SEO | Replaced “every tool,” “free forever,” universal browser/device promises and the 100 MB guarantee with descriptions of the 25 current tools and practical browser-memory limits. Document privacy is distinguished from website/verification network traffic.                               |

Privacy and cookie notices describe the narrower ad eligibility. No benchmarks,
customer results, testimonials or new identity/credential claims were invented.

## Six revised articles

Existing slugs, publication dates, publication status, authors, categories and
image fields are preserved. Titles, summaries and descriptions were corrected
where necessary to match supported workflows. The bodies now use practical
headings, steps, limitations and contextual internal links.

| Existing URL                                 | Useful content now included                                                                                                                                 |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/blog/merge-pdfs-without-losing-quality`    | Report-plus-appendix example; verify page boundaries, selectable text and interactive features; no byte-for-byte or competitor generalizations.             |
| `/blog/pdf-privacy-where-files-go`           | Document contents versus normal website requests; harmless-file network checks; offline-test limitations; whiteout/crop/metadata cautions.                  |
| `/blog/splitting-pdfs-the-right-way`         | Six-page split example, PDF-versus-ZIP behavior, Split versus Extract, and explicit unsupported split methods.                                              |
| `/guides/complete-guide-to-pdf-page-numbers` | Actual current / total format and four positions; unnumbered-cover workflow; retain an unnumbered master to avoid repeated overlays.                        |
| `/guides/image-to-pdf-best-practices`        | Separate JPG/PNG batches, actual page-order controls, pixel dimensions used as PDF points, no A4/Letter picker, and merging/reordering mixed-format groups. |
| `/guides/rotating-scanned-pdfs`              | Whole-document rotation and a complete extract/rotate/remove/merge/reorder example for a single sideways page, without losing or duplicating pages.         |

Examples identify expected outcomes, not purported test results for a visitor's
files. Reading time is calculated at publication from article text at 200 words
per minute, rounded up to at least one minute. All six revised articles currently
show **3 min read**, replacing the previous 5–8 minute labels. Time spent doing a
task is not included. The legacy JSON field remains compatible but is hidden in
CMS editing, so manual labels cannot override the calculated public value.

## Validation

The stable local production build prerenders all 40 public URLs and generates
matching ownership metadata, indexing rules, `ads.txt`, sitemap and redirects.

Final automated result: **168 passed, zero failed, zero skipped**.

| Check                                                      | Result                                                    |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| CMS, PDF and website unit tests                            | 32 passed                                                 |
| Website browser suite, including eight AdSense checks      | 60 passed                                                 |
| Original PDF tool browser/download suite                   | 44 passed                                                 |
| Brightness, Edit PDF and Unlock PDF browser/download suite | 19 passed                                                 |
| Sveltia CMS browser/publication suite                      | 8 passed                                                  |
| Local Cloudflare Pages routing suite                       | 5 passed                                                  |
| TypeScript: `npm run typecheck`                            | Passed                                                    |
| Lint: `npm run lint`                                       | Passed, zero errors; eight existing Fast Refresh warnings |
| Production build: `npm run build`                          | Passed, all 40 public URLs prerendered                    |

Commands for the suites are `npm run test:cms:unit`,
`npm run test:new-tools:unit`, `npm run test:website:unit`,
`npm run test:website`, `npm run test:pdf-tools`, `npm run test:new-tools`,
`npm run test:cms` and `npm run test:pages`. The unit files were also run together
with Node's test runner. Browser checks used installed Chromium selected through
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.

Observed evidence from the test fixtures includes:

- Each of `/not-a-page`, `/blog/no-such-post` and `/guides/no-such-guide` returned
  HTTP 404 with no ad-loader request on direct visits with saved advertising
  consent. Visiting an eligible tool page made one intercepted verification
  request; returning to the missing page and refreshing added none. The final
  missing-page document contained zero ad loaders and remained paused.
- Empty searches on `/`, `/blog` and `/guides` made zero ad-loader requests before
  visiting an eligible page. Returning through site links left zero loaders on
  the empty search screen. Back/forward navigation also passed.
- The split fixture downloaded a ZIP containing `sample-1-2.pdf` (two pages) and
  `sample-3.pdf` (one page).
- Reorder produced three pages with source text in the order 3, 1, 2. Duplicate
  and incomplete orders were rejected.
- The numbered three-page fixture contained `1 / 3`, `2 / 3` and `3 / 3` in its
  extracted text.
- The form-only flattened fixture retained its filled `Alice Example` appearance
  as selectable text. The full-flatten output had one image page with no extracted
  text. The metadata unit test confirmed blanked properties, retained creation
  date, updated modification date and retained XMP content.
- The Pages emulator served all 40 public URLs directly and after refresh with
  HTTP 200 and one shared layout. All 25 homepage cards opened their correct
  tools; intentional 404s, legacy redirects and admin protections passed.

Per-suite JSON results, attachments and download evidence are generated under
ignored `test-results/`. The final command logs for this task are
`/tmp/pdf-phase-{website,pdf-tools,new-tools,cms,pages,unit,typecheck,lint,build}.log`.
These fixtures demonstrate the tested cases, not compatibility with every PDF or
all browsers. The full website suite also checks accessibility and widths of
320, 390, 768 and 1440 pixels on every public route.

## Scope preserved and remaining owner checks

All 25 tools, existing URLs, design components, publication workflow and Sveltia
OAuth configuration are retained. There are no dependency, Cloudflare account,
Worker, deployment-branch, production header or redirect-configuration changes.
The only PDF processing module edit changes Flatten's explanatory result text.

The automated ad checks use an inert replacement for Google's external script;
no real ad traffic is generated. They verify site-controlled loading, pause flags
and navigation, not actual ad fill or the AdSense account's review decision.
The CMS tests use the existing isolated GitHub fixture and do not write real posts.
Cloudflare routing is tested locally; this version has not been published to a
remote Preview or production environment.

Before requesting another Google review, the owner still needs an approved
release and a check of the live site/account. Confirm any applicable
Google-certified CMP requirements in the AdSense account, particularly for
EEA/UK/Switzerland traffic. The existing custom preference dialog is not evidence
of CMP certification. These improvements do not guarantee AdSense approval.

Generated fixtures, PDFs, images, downloads, screenshots, traces and reports stay
in ignored `test-results/` or `playwright-report/` folders, with command logs in
`/tmp`. They are not intended source changes.
