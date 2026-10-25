// Lazy-loaded pdf.js helpers. pdf.js is only downloaded when a tool that
// needs page rendering or text extraction actually runs.
import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

export function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = (async () => {
      const pdfjs = await import("pdfjs-dist");
      const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    })();
  }
  return pdfjsPromise;
}

export async function openPdf(file: File): Promise<PDFDocumentProxy> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    return await pdfjs.getDocument({ data }).promise;
  } catch (err) {
    if (err instanceof Error && err.name === "PasswordException") {
      throw new Error("This PDF is password-protected. Remove the password and try again.");
    }
    throw new Error("Couldn't read this PDF. The file may be damaged or not a real PDF.");
  }
}

/** Render one page (1-indexed) to a canvas. `scale` 1 = 72 dpi. */
export async function renderPage(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale: number,
  { annotations = true }: { annotations?: boolean } = {},
) {
  const pdfjs = await loadPdfJs();
  const page = await doc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const base = page.getViewport({ scale: 1 });
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext("2d", { willReadFrequently: false })!;
  // White background so transparent PDFs don't turn black in JPEG.
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({
    canvasContext: ctx,
    viewport,
    // Exports have no HTML form overlay: paint widget appearances into the canvas.
    annotationMode: annotations ? pdfjs.AnnotationMode.ENABLE : pdfjs.AnnotationMode.DISABLE,
  }).promise;
  page.cleanup();
  return { canvas, widthPt: base.width, heightPt: base.height };
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Image encoding failed."))),
      type,
      quality,
    ),
  );
}

export function toGrayscale(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const y = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
    d[i] = d[i + 1] = d[i + 2] = y;
  }
  ctx.putImageData(img, 0, 0);
}

export function baseName(file: File) {
  return file.name.replace(/\.[^.]+$/, "") || "document";
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
