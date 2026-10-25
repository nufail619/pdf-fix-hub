# PDF tool browser regression tests

This suite tests all 22 tools against the **finalized production SPA**. It does
not upload documents to any service or deploy the website. Existing exploratory
tests under `tests/e2e` are preserved; this configuration selects only this suite.

## Run

Install the repository's Bun dependencies with its frozen lockfile. Test fixture
generation and independent output validation require Python 3 with the packages
in `tests/pdf-tools/requirements.txt` (already available in this cloud runtime).
If setting up another machine, install those into a Python virtual environment.

Use a Playwright Chromium installation, or select a local Chromium executable:

```sh
# This cloud environment:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:pdf-tools:build
npm run typecheck

# With Playwright's Chromium installed instead:
npm run test:pdf-tools:build
```

`npm run test:pdf-tools` reuses an existing `dist` build. Stop other processes on
port 4173 before running; the suite starts and stops its own static server.
`vite preview` is unsuitable here because `finalize-spa.mjs` intentionally removes
the SSR server bundle. The test server uses the existing `sirv` dependency via
`sirv-cli` and binds explicitly to the test port.

## What is verified

The suite generates genuine multipage PDFs, a filled AcroForm, a rotated PDF,
JPG/JPEG/PNG images and a Word DOCX document. For each successful flow, Playwright
uploads inputs, configures the tool, clicks Process, waits for the result, clicks
Download and saves the actual downloaded bytes. No processing functions are
mocked. Python independently validates downloads using pypdf, Pillow and zipfile.

- PDF page counts, page order, rotation, crop/margin dimensions and embedded images.
- Added text, page numbers, watermarks, metadata edits/removal and Word text.
- JPEG/PNG decoding and dimensions, rendered colors and white backgrounds.
- ZIP CRC integrity, exact entry lists, every image and every split PDF inside.
- Filled form values remain visible in JPG, PNG and full-flatten outputs.
- Flattened PDFs have no editable fields or widget annotations.
- All three compression levels return valid PDFs no larger than the source.
- Grayscale image channels match; real extracted text preserves page order.
- Zero-valued coordinates, margins and opacity are respected.
- Invalid selections and damaged inputs produce errors without a download.

## Evidence

The latest run writes `test-results/pdf-tools-results.json` and an HTML report at
`playwright-report/pdf-tools/index.html`. Each successful download has its original
filename, a result screenshot, and attached `download-verification.json` including
byte sizes and measured properties. Failures retain browser traces and screenshots.
Artifacts and generated fixtures are ignored by Git and replaced on subsequent runs.

The repaired production run completed **44 passed, 0 failed, 0 skipped**. See
`REPORT.md` for the per-tool results and limitations.
