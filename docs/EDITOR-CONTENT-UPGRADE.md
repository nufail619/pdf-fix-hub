# Edit PDF and ten-article implementation report

Review date: 26 October 2026. Branch: `develop/pdf-tools-repair`.
Starting and current committed HEAD: `9c4e3eeb64fd9c4b7cfadcb92af57981dc84f638`.
All changes described here are local and uncommitted. No push, merge or deployment
was performed. They are not yet present on the live website or remote CMS branch.

## Editor capabilities delivered

- Genuine replacement and deletion of supported existing PDF text objects using
  PDFium, without whiteout or a covering rectangle. The edited PDF itself is
  rendered for the replacement preview and used for export.
- Selection through page outlines or an existing-text dropdown, with the original
  text available to read and copy. Selection follows PDF text objects rather than
  arbitrary word-processor character ranges.
- Existing text retains its font and supports replacement, size, color and
  displayed position controls. Unchanged original fill color is preserved,
  including the tested CMYK case. An explicitly chosen new color uses RGB.
- Added text boxes support explicit multiple lines, three standard font families,
  bold, italic, alignment, size and color. Existing shapes, highlights and whiteout
  remain available, with the whiteout/redaction warning retained.
- Added elements can be selected, dragged, resized or deleted. Percentage controls
  and keyboard-operable resize controls provide alternatives to pointer dragging.
- Undo/redo, 50–200% zoom, page navigation, preview updates and download. Editing
  history is limited to 100 snapshots. Selecting another source resets the session.
- Page rotation, CropBox coordinates and mixed page sizes are accounted for.
  Existing optional form flattening is retained; filled forms also remain
  interactive when flattening is not selected in the tested fixture.
- Unsupported changes fail with an explanation and block export until corrected
  or undone. Scans/pages without text receive a clear no-OCR limitation message.

### Exact genuine-text-editing limits

Supported text must be a visible, opaque, unclipped, top-level horizontal text
object with a simple supported transform. Standard nonembedded Helvetica, Times
and Courier variants are supported. Replacement is a single line of printable
ASCII/basic Latin, up to 500 characters, with a 6–96 pt size. It must fit the
original line width and remain within the visible page.

For embedded fonts, only characters already present in the selected original
object may be reused. The replacement is checked through fresh PDFium text
extraction before saving. This deliberately rejects many otherwise plausible
font substitutions rather than producing missing glyphs.

Nested Form XObjects, unsupported encodings, skewed/stretched/individually rotated
text, clipping, invisible OCR text and other complex text are not generally
editable. Whole-page rotations are supported. There is no paragraph reflow,
layout reconstruction or OCR. Existing form values are not changed through this
text-object UI. Font-family/bold/italic/alignment controls apply to newly added
boxes; replacement keeps the original font.

The editor inspects up to 2,000 page objects per page and reports when that limit
is reached. Analysis/export workers have a 60-second timeout. Retain an original
copy and inspect the saved result, especially for complex files. Saving may
invalidate signatures. Neither replacement/deletion nor whiteout is certified
secure redaction or a document-sanitization workflow.

## Engine, licensing and privacy

The exact dependency is `@embedpdf/pdfium` **2.15.1**, lazy-loaded in a dedicated
browser Web Worker. PDF.js continues rendering; pdf-lib continues overlay/export
processing. WASM and worker assets are self-hosted; no processing server, document
upload, account, API key or external runtime CDN was added. Edits remain in memory.
The new engine adds approximately 4.5 MiB of WASM plus a worker bundle, loaded when
the editor analyzes a selected PDF.

MuPDF was evaluated but not added because AGPL/commercial terms require a separate
licensing decision. The selected wrapper is MIT; its distributed PDFium binary
also carries BSD-style PDFium terms and Apache 2.0 text. Supplied notices are in
`public/licenses/`, alongside the DejaVu practice-font notice. Several upstream
editing APIs are experimental. Maintain the pinned engine and review notices and
binary provenance on upgrades; a passing package-advisory audit is not a native
binary security audit or exhaustive legal clearance.

See [PDF-EDITOR-ENGINE.md](PDF-EDITOR-ENGINE.md) for the comparison, source links,
security limits and integration details.

## Ten original articles integrated

All ten are published-content entries in the existing Sveltia JSON collection.
Each has a unique title, description, category and publication date, accurate
instructions, a worked example, troubleshooting/common mistakes, FAQs and relevant
internal links. Existing article rendering provides canonical URLs, social
metadata and Article structured data. Reading times use the site's existing
200-words-per-minute calculation rather than a manually invented duration.

| Article                                                    | Direct path                                             | Reading time |
| ---------------------------------------------------------- | ------------------------------------------------------- | ------------ |
| How to Edit Text in a PDF: What Actually Works             | `/blog/how-to-edit-text-in-a-pdf`                       | 4 min        |
| How to Reduce PDF File Size Without Losing Readability     | `/blog/reduce-pdf-file-size-without-losing-readability` | 4 min        |
| How to Merge PDF Files in the Correct Order                | `/blog/merge-pdf-files-in-correct-order`                | 3 min        |
| How to Remove Pages From a PDF Safely                      | `/blog/remove-pages-from-pdf-safely`                    | 3 min        |
| How to Convert JPG and PNG Images to PDF                   | `/blog/convert-jpg-and-png-images-to-pdf`               | 3 min        |
| How to Protect a PDF With a Password                       | `/blog/protect-pdf-with-password`                       | 4 min        |
| How to Unlock a PDF You Own                                | `/blog/unlock-a-pdf-you-own`                            | 3 min        |
| How to Brighten Dark Scanned PDF Documents                 | `/blog/brighten-dark-scanned-pdf-documents`             | 3 min        |
| How to Extract Text From a PDF and Recognize Scanned Pages | `/blog/extract-text-and-recognize-scanned-pdfs`         | 4 min        |
| How to Prepare a PDF for Printing                          | `/blog/prepare-pdf-for-printing`                        | 4 min        |

PDF Fix Hub has no password-protection/encryption tool. The protection article
states this explicitly and describes a documented LibreOffice source-document
export workflow instead. Official documentation was checked; the LibreOffice GUI
was not exercised in these browser tests. No 26th website tool is claimed or added.

Public synthetic practice assets cover selectable text, embedded fonts, a dark
scan, page order, print orientation and JPG/PNG conversion. Three original
screenshots show the real editor, brightness controls and merge order using those
examples. These are intentional article assets, not generated test reports or
customer documents. The generator and notices are included for reproducibility.

The blog now lists **13 posts**; the **three existing guides** remain. All original
six content files are unchanged. There are **50 published public routes**, with
the previous 40 preserved and ten new article routes added to the sitemap.

## Build problem found and repaired

Article links to binary practice downloads exposed a prerender-crawler bug:
linked PDF/image resources could be interpreted as HTML and corrupted in output.
Prerendering is now restricted to known published HTML routes and the SPA shell.
Static sample files remain byte-identical. A browser regression compares served
PDF, JPG and PNG response bytes against the source assets.

## Verification results

| Suite                                                           |  Passed |
| --------------------------------------------------------------- | ------: |
| Node unit tests: CMS, existing tools, website and native editor |      43 |
| Website/content/SEO/layout/AdSense browser tests                |      70 |
| Original PDF tool browser/download regressions                  |      44 |
| Brightness/Edit/Unlock browser regressions                      |      19 |
| New native editor and article/sample browser tests              |       8 |
| CMS browser/publication tests                                   |       8 |
| Local Cloudflare Pages routing browser tests                    |       5 |
| **Total**                                                       | **197** |

All browser result files report zero unexpected failures, zero flaky tests and
zero skipped tests. TypeScript, lint and the production build passed. Lint reports
eight existing Fast Refresh warnings and no errors. `bun audit` reported no known
package vulnerabilities. The production build emits 50 sitemap URLs and ads.txt.

Real output checks use pypdf/Pillow and native-engine inspection, not filenames
alone. They verify that the replaced amount is removed from active page content,
deletion does not add a whiteout, unrelated page labels/rotations/sizes survive,
embedded-font characters round-trip, unsupported glyphs fail, scanned image pixels
remain unchanged when adding a note, formatted multiline text exports, and a
filled form value remains interactive. Native tests also cover rotated/cropped
geometry, placement, font size, color and unchanged CMYK fill. An editor browser
test found no upload requests or document text/bytes in requests during editing.

Website checks cover every public route, direct navigation/refresh, blog listing,
article metadata, sitemap, mobile layouts and accessibility. CMS tests exercise
the real Sveltia UI with mocked GitHub OAuth/content operations; they do not write
to GitHub or re-prove a live external OAuth configuration. Local Pages tests use
the Cloudflare routing environment; no new hosted Preview was deployed.

## Preservation and remaining attention

- The 25-tool inventory, existing URLs, original three posts and three guides,
  Sveltia authentication code, AdSense publisher/verification, ads.txt and privacy
  controls are preserved. Existing regression suites pass.
- The package scripts and GitHub validation workflow now run editor tests too.
  No credentials, secret values or new external setup are required.
- Test downloads, screenshots used only as test evidence, generated content,
  reports and build output remain ignored. The three public article screenshots,
  sample files and license notices are intentional product assets.
- Broader Unicode editing, arbitrary embedded-font substitution, paragraph
  reflow, OCR and certified redaction remain unsupported. Use the source
  application or a separately licensed specialist editor for those cases.
- The changes are ready for review, not released. No commit, push, merge,
  production change or deployment has been performed.
