import type { BlogPost } from "./blogPosts";

export const guides: BlogPost[] = [
  {
    slug: "complete-guide-to-pdf-page-numbers",
    title: "The complete guide to adding page numbers to a PDF",
    excerpt:
      "Where to place them, what format to use, and how to handle a mix of portrait and landscape pages without making a mess.",
    date: "2026-04-05",
    author: "The MY PDF FIX Team",
    readTime: "8 min read",
    body: [
      "Page numbers seem like a tiny detail, but they're the most-requested formatting fix in legal, academic, and corporate workflows. A 300-page document without numbers is almost impossible to navigate, reference, or cite. This guide walks through every decision you need to make.",
      "Start with position. The default for most documents is bottom-center: easy to find, doesn't fight with content, and works in both portrait and landscape orientations. Bottom-right is the second-most-common choice, especially for documents that will be printed and bound on the left edge — the page number stays visible after binding. Bottom-left is unusual outside of academic typesetting. Top-of-page numbers are reserved for documents with deep headers that already use the bottom margin for footnotes.",
      "Next, format. The simplest is just '1', '2', '3' and so on. For longer documents, 'Page 1 of 50' is friendlier because the reader always knows how much is left. Legal and academic documents often use Roman numerals for front matter (i, ii, iii) and Arabic numerals for the body (1, 2, 3) — that's a two-pass operation: number the front matter, then start numbering the body at page 1.",
      "Font size and color matter more than people realize. 10–12 points is the sweet spot for most documents. Too small and they vanish; too large and they become an eyesore. Use a dark gray (#333) rather than pure black — it draws less attention to the chrome and more to the content. Avoid bold unless you have a specific reason; page numbers should disappear into the design.",
      "Mixed orientations need extra care. If your document has landscape pages interspersed with portrait pages, a page number placed at the bottom of a portrait page will appear on the long edge of a landscape page when bound. Most tools place page numbers relative to the page rotation, which is what you want — but verify the output, especially on the first landscape page after a portrait run.",
      "Finally, think about reprints. If you add numbers and later need to add or remove pages, every page number after the change will be wrong. Consider using a tool that lets you re-run the numbering pass quickly, and always keep an unnumbered master copy of the document.",
      "MY PDF FIX's page numbers tool covers the four most common positions and any font size you need. Numbering is non-destructive: we draw the numbers on top of the existing page, so the original content is untouched and you can re-run if needed.",
    ],
  },
  {
    slug: "rotating-scanned-pdfs",
    title: "Rotating scanned PDFs: a step-by-step guide for non-technical users",
    excerpt:
      "Scanners flip pages, document feeders mis-orient pages, and you end up with a 40-page PDF where half the pages are sideways. Here's how to fix it.",
    date: "2026-02-20",
    author: "The MY PDF FIX Team",
    readTime: "5 min read",
    body: [
      "Sideways pages are the bane of scanned documents. Modern document feeders try to detect orientation automatically, but they're wrong more often than they're right, especially on mixed-content pages where text and images don't agree on which way is up. Here's how to fix the result without re-scanning.",
      "First, decide whether you need to rotate every page or only some. If the scan came from a duplex feeder where odd pages came out one way and even pages came out the other, you need to rotate only the wrong-facing pages. If the entire scan came out sideways because the original was loaded the wrong way, a single bulk rotation of the whole file is the fix.",
      "For a bulk rotation, the choice is between 90° clockwise, 90° counter-clockwise (which is the same as 270° clockwise), and 180°. The easiest way to figure out which one you need: look at the top of a page. If the top of the text is on the right side of the screen, rotate counter-clockwise. If the top is on the left, rotate clockwise. If the text is upside down, rotate 180°.",
      "For selective rotation — fixing only some pages — you have two options. Either rotate the whole document and then rotate the now-misaligned pages back, or rotate only the problem pages individually. Most browser-based tools support both approaches.",
      "After rotating, save and re-open the file to verify. Some PDF viewers cache page orientation and may show stale results until reloaded. If you're delivering the file to someone else, ask them to open it in their viewer of choice — different viewers respect rotation metadata differently.",
      "A final tip: if you scan documents often, take 30 seconds to learn your scanner's orientation settings. Most scanners have an 'auto-rotate' toggle that's off by default. Turning it on saves a step on every future scan.",
    ],
  },
  {
    slug: "image-to-pdf-best-practices",
    title: "Image to PDF: best practices for sharper, smaller files",
    excerpt:
      "JPGs, PNGs, and a clean PDF on the other side. Small choices about resolution and color depth make a huge difference.",
    date: "2026-01-30",
    author: "The MY PDF FIX Team",
    readTime: "6 min read",
    body: [
      "Converting images to PDF is one of the most common workflows in modern offices, especially for receipts, whiteboard photos, and signed documents captured with a phone camera. The mechanics are simple, but the choices you make before conversion determine whether the output is a crisp 200 KB file or a bloated 20 MB monster.",
      "Start with resolution. A phone camera shoots 12 megapixels or more, which is wildly excessive for a printed page. For most document use cases, 150–200 DPI is plenty — you can read the text comfortably and print without seeing pixels. A standard letter-size page at 200 DPI is roughly 1700×2200, or about 3.7 megapixels. Anything more than that is wasted bytes.",
      "Next, pick the right source format. JPG is best for photos and anything with continuous color gradients — receipts, signs, photographed documents. PNG is best for screenshots, line art, and anything with sharp edges or transparency. Mixing them in the same PDF is fine, but be aware that PNG files are typically larger for the same content.",
      "Color depth is the silent killer. A scanned receipt converted to PDF in full color is often 10 times larger than the same receipt converted to grayscale. If your image is monochrome anyway — black text on a white background — convert it to grayscale before making the PDF. Most image apps have a one-click grayscale conversion.",
      "Order your images deliberately. Most image-to-PDF tools combine in the order you upload, so drag and drop in the order you want the pages to appear. If you have a long sequence, name your files numerically (01.jpg, 02.jpg, 03.jpg) so they sort correctly when selected together.",
      "Finally, think about the destination. If the PDF is going to be printed, match the page size to the printer's paper (US letter or A4). If it's going to be viewed on screen, the original image's aspect ratio is fine — it's actually easier to read because there's no scaling.",
      "MY PDF FIX's image conversion tools support both JPG and PNG, accept multiple files in a single batch, and embed images at their original resolution so you can decide upstream whether to downscale. Drag your images in the order you want, click Process, and you're done.",
    ],
  },
];
