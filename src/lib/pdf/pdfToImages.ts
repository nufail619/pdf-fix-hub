import { zipSync } from "fflate";
import { baseName, canvasToBlob, openPdf, renderPage } from "./pdfjs";
import { parsePageRanges } from "./download";

export async function pdfToImages(file: File, format: "jpg" | "png", dpi: number, ranges = "") {
  const doc = await openPdf(file);
  const pages = ranges.trim()
    ? parsePageRanges(ranges, doc.numPages)
    : Array.from({ length: doc.numPages }, (_, i) => i + 1);
  if (pages.length === 0) throw new Error("No valid pages in that range.");
  const scale = Math.min(Math.max(dpi, 36), 300) / 72;
  const mime = format === "png" ? "image/png" : "image/jpeg";
  const name = baseName(file);
  const images: { name: string; bytes: Uint8Array }[] = [];
  for (const n of pages) {
    const { canvas } = await renderPage(doc, n, scale);
    const blob = await canvasToBlob(canvas, mime, 0.9);
    canvas.width = canvas.height = 0;
    images.push({
      name: `${name}-page-${n}.${format}`,
      bytes: new Uint8Array(await blob.arrayBuffer()),
    });
  }
  await doc.destroy();
  if (images.length === 1) {
    return {
      blob: new Blob([images[0].bytes as BlobPart], { type: mime }),
      filename: images[0].name,
    };
  }
  const zip = zipSync(Object.fromEntries(images.map((i) => [i.name, [i.bytes, { level: 0 }]])));
  return {
    blob: new Blob([zip as BlobPart], { type: "application/zip" }),
    filename: `${name}-${format}-images.zip`,
    note: `${images.length} pages converted and bundled into a ZIP file.`,
  };
}
