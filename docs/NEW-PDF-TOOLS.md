# Brightness, visual editing and password unlocking

Implemented on `develop/pdf-tools-repair`, retaining PDF repair commit
`b3fcaeedcc2ff59d27dc8b8275de9900dc0889ad` and CMS commit
`c40e05c6c8289b984878927a303ac6c5f6166cd0`. No push, merge or deployment
was performed for this work.

The registry now contains 25 tools. The original 22 retain their order; the new
cards are appended. Each new page has its own title, description, canonical URL,
instructions, FAQ, related tools and sitemap entry. Existing design components,
upload handling, processing runner and download panel are reused.

## Features and actual results

| Tool | Status | Implemented and verified |
| --- | --- | --- |
| Adjust PDF Brightness | Passed | Brightness/contrast sliders, before/after previews, page navigation, adjustment of every page and PDF download. Real pixel values and page dimensions checked on three-page, cropped and rotated documents. |
| Edit PDF | Passed | Page preview; text, rectangle, ellipse, highlight and whiteout overlays; pointer dragging, position/size/color controls, selection and deletion across pages. Downloads checked for added/deleted text, vector shapes, highlight opacity, whiteout appearance and preserved original text. All four page rotations and cropped pages checked. |
| Unlock PDF | Passed | Permission confirmation, password input, local decryption in a dedicated WebAssembly worker, password clearing, safe error messages and download. Real encrypted inputs decrypted without losing text, page geometry or filled form values. |

Brightness deliberately rasterizes all pages at 144 dpi into PNG images. Text
stops being selectable, links/forms become static and output can be larger. This
is explained before processing and in the download result. A neutral preview is
identical to the original preview; even neutral export is still rasterized.

The editor adds overlays and does not rewrite original text. Added text uses a
standard Latin font; unsupported characters, overflowing text and invalid
elements are rejected. Whiteout is explicitly **not secure redaction**: tests
confirm that covered original text remains extractable.

Form fields remain interactive by default. An explicit **Flatten form fields in
edited copy** checkbox permits overlays above field appearances while preserving
visible values; only that choice removes form interactivity. Other existing PDF
annotations can appear above overlays, as explained beside the controls. PDF
rewrites can invalidate digital signatures; retain original signed documents.

Unlock uses pinned `@neslinesli93/qpdf-wasm@0.3.0`, with its checksum recorded in
`bun.lock`. Its script and WASM are bundled as local assets and loaded when needed.
Each attempt uses a fresh worker, which is terminated afterwards. Passwords never
enter persistent browser storage, URLs, HTTP requests or logs. Raw engine
diagnostics are suppressed inside the worker; only fixed error messages reach
the UI. The output is independently parsed before a download is offered.

Successfully decrypted fixtures cover **RC4-40, RC4-128, AES-128, AES-256-R5 and
AES-256**, as well as an owner password and a file with an empty opening password.
Unsupported cases include forgotten passwords, certificate encryption, DRM,
damaged files and unsupported security handlers. The unsupported-handler test
uses a synthetic Adobe.PubSec fixture; it is not a claim of testing every
certificate-encryption or DRM product.

## Verification

| Check | Result |
| --- | --- |
| New pixel/editor unit tests | 6 passed |
| New Playwright browser tests | 19 passed |
| Existing PDF Playwright regression tests | 44 passed |
| Existing CMS/content/OAuth unit tests | 12 passed |
| Existing CMS Playwright tests | 8 passed |
| Total automated tests | **89 passed; 0 failed, skipped or flaky** |
| TypeScript | Passed |
| Production build/static prerender | Passed; sitemap contains 40 URLs |
| ESLint on all changed/new application TypeScript | Passed, no warnings |
| Desktop and 390-pixel mobile layout | Passed; no horizontal overflow |
| PDF visual review | Exported normal/rotated editor PDFs and mobile previews inspected |

The new browser suite verifies **16 real PDF downloads** with independent Python
checks using pypdf, Pillow and Poppler. Gray patches were measured at 101, 48 and
89 for brightened, darkened and neutral exports respectively, matching expected
values; transformed patches were also verified on every output page. Editor
outputs were rendered to check shape/highlight pixels, overlay positioning and
whiteout appearance. Unlock outputs contain no encryption dictionary and retain
all three pages, original text and filled form values.

Unlock tests observe requests during password entry and processing: no external
requests or password-bearing requests occurred. Browser storage and console
messages were checked for the fixture password, and the form was confirmed empty
after attempts. Existing public-site font requests happen when the page loads;
the unlock engine itself uses only same-origin assets.

Browser coverage is Chromium, including a mobile viewport. These results do not
claim testing physical iOS/Android devices or every encrypted PDF in existence.
CMS tests retain their existing test-only GitHub/OAuth interception; live OAuth
setup remains as described in `CMS-SETUP.md`.

## Repeat the checks

Install dependencies using the existing frozen Bun lockfile workflow. PDF fixture
and verifier dependencies are listed in `tests/pdf-tools/requirements.txt`;
encryption fixtures additionally require Python `cryptography`. Poppler supplies
`pdftoppm` for independent rendering. Run from the repository root:

```sh
npm run test:new-tools:unit
npm run test:cms:unit
npm run typecheck
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:new-tools
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:pdf-tools
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:cms
```

Run browser suites sequentially because they use the same local test-server port.
New fixtures, downloads, screenshots, renderings and reports stay ignored under
`test-results/` and `playwright-report/`. Detailed evidence is in:

- `test-results/new-tools-results.json` and `playwright-report/new-tools/index.html`.
- Per-test `verified-pdf.json` attachments, actual PDFs and Poppler renderings.
- `test-results/pdf-tools-results.json` and `test-results/cms-results.json`.

The application does not upload source documents or invoke any deployment service.
