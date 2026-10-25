# PDF tool repair validation

Validated locally on `develop/pdf-tools-repair`, starting at commit
`7f64f6f2427f77b3f43a63f5df7957b47bb56f9c`. No commits, pushes, merges or
deployments were made. The starting checkout was clean.

The completed production-browser run: **44 passed, 0 failed, 0 skipped**.
TypeScript and the production build passed. Build prerendered the site's linked
routes and generated the static SPA and 37-URL sitemap.

“Passed” means the tested behavior already worked. “Fixed” means a defect was
changed and the resulting behavior verified. This is evidence for the supplied
fixtures and scenarios, not a claim of compatibility with every possible PDF.

| Tool | Result | Download evidence |
| --- | --- | --- |
| Merge PDF | Passed | 3-page + 1-page inputs produced a 4-page PDF with correct source text. |
| Split PDF | Fixed | ZIP contains two valid PDFs of 2 and 1 pages; invalid ranges rejected; ZIP Blob TypeScript error repaired. |
| Compress PDF | Passed | All 3 levels preserved 3 pages; default reduced 2,214 to 1,423 bytes. |
| JPG/JPEG to PDF | Passed | .jpg and .jpeg inputs produced a 2-page PDF with embedded images and matching dimensions. |
| PNG to PDF | Passed | Valid 1-page PDF with embedded image and matching dimensions. |
| PDF to JPG/JPEG | Fixed | Decoded JPEGs; single image, 3-image ZIP, 72/300 dpi and rotated dimensions; filled field text visible. |
| PDF to PNG | Fixed | Decoded PNG; single image and 3-image ZIP; filled field text visible. |
| PDF to Text | Passed | UTF-8 download includes original text from all 3 pages in order. |
| Word to PDF | Passed | Real DOCX produced 1 page with selectable heading and paragraph text. |
| Extract Pages | Fixed | Pages 1 and 3 retained; mixed valid/out-of-bounds input rejected instead of silently dropping pages. |
| Remove Pages | Fixed | Removed page 2; empty selection and removing every page rejected. |
| Reorder Pages | Fixed | Verified text order 3,1,2; omitted and duplicate page selections rejected. |
| Rotate PDF | Passed | 3 pages retained with 90-degree rotation. |
| Add Page Numbers | Passed | Each page contains its correct n / 3 label. |
| Add Text to PDF | Fixed | Text added only on page 2; explicit x=0/y=0 preserved in PDF text positioning. |
| Add Blank Page | Passed | 4 pages; inserted page is empty at the requested position. |
| Add Margin | Fixed | 20pt yields 400×520pt pages; 0pt correctly preserves 360×480pt. |
| Watermark PDF | Fixed | Text appears on every page; 0 opacity preserved in PDF graphics state. |
| Flatten PDF | Fixed | Filled text retained in forms mode; full mode now paints field values; no remaining editable widgets. |
| Crop PDF | Passed | Requested first-page crop measured; unselected page dimensions unchanged. |
| Grayscale PDF | Passed | 3-page PDF; independently decoded images have matching RGB channels. |
| Edit PDF Metadata | Passed | Title/author read back correctly; clearing metadata verified. |

No tools remain failing in the tested scenarios.

## Reproduced defects

- PDF.js used `AnnotationMode.ENABLE_FORMS`, which excludes form widgets from
  canvas output so an interactive viewer can paint them separately. These exports
  have no HTML overlay. A filled form downloaded as a JPEG with **zero dark pixels**
  in its value region. Changing to `AnnotationMode.ENABLE` retains its appearance;
  browser downloads and independent pixel checks now pass for JPG/PNG/full flatten.
- TypeScript rejected Split PDF's typed-array ZIP data as a BlobPart. Copying into
  an ArrayBuffer-backed Uint8Array fixes the type without suppressing the check.
- Page range parsing silently accepted `1,99` as `[1]` and `1-99` as `[1,2,3]`
  for a 3-page PDF. Invalid ranges now stop processing with an explicit error.
- Reordering previously omitted unspecified pages and accepted partial numeric
  input. It now requires a valid permutation of every source page.
- Numeric `value || default` expressions replaced valid zero coordinates,
  margins and opacity. Explicit numeric validation now preserves zero values.

## Limits

The reported original broken PDF was not provided. A concrete form-rendering
failure was reproduced and repaired; ordinary text/graphics PDFs already converted.
Testing used Chromium; other browsers and very large files were not assessed.
Word conversion supports DOCX with simplified layouts and Latin standard fonts;
the existing UI reports substitutions for unsupported scripts. PDF-to-text does
not perform OCR. Rasterized outputs intentionally lose selectable text. These are
existing product limitations, not newly implemented capabilities.
