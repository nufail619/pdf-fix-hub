# Browser PDF editor engine review

## Decision and sources

Use **@embedpdf/pdfium 2.15.1**, pinned exactly, only for analysis and genuine
page-text-object mutations. Continue using the existing PDF.js renderer and
pdf-lib annotation/export code. The new engine is lazy-loaded in a dedicated
Web Worker, with its WASM file bundled on the same origin. No document-processing
server, account, API key or third-party CDN is introduced.

The selected release was published on 16 September 2026, older than the existing
24-hour supply-chain guard. The guard and its exclusions were not changed.

Sources inspected during implementation:

- The published package README, type definitions, MIT LICENSE, and LICENSE.pdfium.
- [PDFium fpdf_edit.h](https://github.com/chromium/pdfium/blob/main/public/fpdf_edit.h):
  text-object access, FPDFText_SetText, removal, matrix/color changes, and
  FPDFPage_GenerateContent. Several APIs are marked experimental upstream.
- [PDF.js API](https://github.com/mozilla/pdf.js/blob/master/src/display/api.js):
  rendering and text extraction, rather than a general existing-text editing API.
- [MuPDF COPYING](https://github.com/ArtifexSoftware/mupdf/blob/master/COPYING):
  AGPL obligations; commercial licensing is an alternative, not assumed purchased.
- The installed pdf-lib API and MIT license: useful for overlays, form flattening
  and document construction, without a general text-layout replacement interface.

| Approach                           | Assessment                                                                                                                                                                                                                       |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PDF.js + pdf-lib alone             | Retain for rendering and overlays; a handwritten content-stream rewriter would need to correctly implement fonts, encodings, graphics state and nested resources. Rejected for broad original-text editing.                      |
| MuPDF WebAssembly                  | Capable native engine, but AGPL/commercial licensing requires a separate licensing decision. Not added.                                                                                                                          |
| Full EmbedPDF engines/viewer stack | MIT components, but introduces more viewer abstractions and regional font packages than needed. Not added.                                                                                                                       |
| Low-level EmbedPDF PDFium WASM     | Selected: a small focused integration with real object replacement, permissive package terms and testable restrictions. Approximately 4.5 MiB WASM plus a worker bundle, loaded only for the editor when a document is selected. |
| Commercial browser SDKs            | Could offer paragraph reflow and broader font handling; would require costs, license review and integration approval. Not assumed available.                                                                                     |

## Actual editing, not concealment

`nativeTextCore.ts` identifies top-level text objects, reads their existing fonts,
text, bounds, matrices and colors, and checks eligibility. Replacement calls
`FPDFText_SetText` on the original object, refreshes its extraction context to
verify encoding, and regenerates the page's content. Deletion removes the object.
Saving uses a non-incremental copy. No white rectangle is added for either action.

Each change is rebuilt from the immutable original plus the current edits. The
native-edited PDF is rendered by PDF.js for the preview; it is not simulated with
a cover layer. Export applies the same native changes before any optional overlays
or form flattening. Replacing one object does not reflow a paragraph.

## Supported and rejected cases

- Top-level, visible, opaque, unclipped, simple horizontal text objects.
- Supported nonembedded Helvetica, Times and Courier standard fonts; replacement
  text is a single line of basic Latin characters (ASCII printable range).
- Embedded fonts may reuse characters already present in the selected original
  object. New glyphs are rejected conservatively; no invented font substitution.
- Original font remains; size (6–96 pt), color and displayed position can change.
  Replacement must fit the original text line width and stay inside the CropBox.
- Rotated pages (0/90/180/270 degrees), CropBoxes, multipage documents and mixed
  sizes are accounted for by display-to-PDF coordinate transforms.
- Complex/skewed/stretched text, clipping/invisible/stroked/transparent text,
  unsupported fonts, nested Form XObjects and raster/outlined words are not
  universally editable. The UI explains limitations and offers separately added
  text boxes. Existing interactive form values are not edited through this feature.
- No OCR, arbitrary paragraph reflow, automatic layout reconstruction or guarantee
  for every PDF. A page without text can be a scan or outlines, so the UI does not
  incorrectly assert that every such page is scanned.

Selection is at PDF text-object granularity. A sentence may contain several
objects. The selected original text is also selectable/copyable in the controls.
Added boxes support explicit multiline text, Helvetica/Times/Courier variants,
bold, italic and alignment; they remain overlays with no secure-redaction claim.

## Security, privacy and limits

Workers are terminated after each result or failure; a 60-second timeout bounds
stalled analysis. The first 2,000 objects per page are inspected, with a visible
limit message on complex pages. Input memory allocated in PDFium is cleared and
freed and native pages/documents/writers are closed in finally blocks. No PDF
JavaScript/actions are invoked by this integration. Workers protect the UI from
long-running work but are not a proof against every parser or resource-exhaustion
risk. Keep the pinned engine under security and maintenance review.

No document bytes or user text are sent to a service. WASM and application files
are ordinary same-origin downloads. Session edits are held in memory, with no
new localStorage, IndexedDB or password persistence. The existing website privacy,
consent, AdSense and CMS authentication remain separate and unchanged.

Text replacement/deletion is **not certified secure redaction or sanitization**:
metadata, other occurrences, comments and attachments can still contain data.
Whiteout remains explicitly a visual overlay. Saving can invalidate signatures;
users must retain signed originals and inspect the downloaded result.

## Licenses and distribution

The wrapper's MIT notice and the package's complete combined PDFium license
file (BSD-style PDFium terms plus Apache 2.0 text) are redistributed at
`public/licenses/embedpdf-pdfium-MIT.txt` and `public/licenses/pdfium-notices.txt`.
Do not call the whole binary “MIT only” or rely on the README's abbreviated
Apache description. The PDFium binary has upstream components; retain supplied
notices and review notices/build provenance when upgrading. This is an engineering
licensing review, not legal advice or a guarantee of exhaustive upstream clearance.

The public embedded-font practice PDF uses DejaVu Sans; its available distribution
notice is included as `public/licenses/sample-font-notice.txt`. No standalone font
file or proprietary font is added. All practice documents contain synthetic data.
