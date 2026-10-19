import { PDFDocument } from "pdf-lib";
import { canvasToBlob, openPdf, renderPage, toGrayscale } from "./pdfjs";

export type RasterOptions = {
  /** Render scale: 1 = 72 dpi, 2 = 144 dpi. */
  scale: number;
  /** JPEG quality 0–1. */
  quality: number;
  grayscale?: boolean;
  annotations?: boolean;
  onProgress?: (done: number, total: number) => void;
};

/** Re-draw every page as a JPEG image inside a new PDF of the same page sizes. */
export async function rasterizePdf(file: File, opts: RasterOptions): Promise<Blob> {
  const src = await openPdf(file);
  const out = await PDFDocument.create();
  for (let i = 1; i <= src.numPages; i++) {
    const { canvas, widthPt, heightPt } = await renderPage(src, i, opts.scale, {
      annotations: opts.annotations ?? true,
    });
    if (opts.grayscale) toGrayscale(canvas);
    const jpg = await canvasToBlob(canvas, "image/jpeg", opts.quality);
    const img = await out.embedJpg(new Uint8Array(await jpg.arrayBuffer()));
    const page = out.addPage([widthPt, heightPt]);
    page.drawImage(img, { x: 0, y: 0, width: widthPt, height: heightPt });
    canvas.width = canvas.height = 0; // free memory
    opts.onProgress?.(i, src.numPages);
  }
  await src.destroy();
  const bytes = await out.save({ useObjectStreams: true });
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
