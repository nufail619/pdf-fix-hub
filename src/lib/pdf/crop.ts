import { PDFDocument } from "pdf-lib";
import { parsePageRanges } from "./download";

const MM = 72 / 25.4;

export async function cropPdf(
  file: File,
  mm: { top: number; right: number; bottom: number; left: number },
  ranges = "",
) {
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
  const pages = doc.getPages();
  const targets = ranges.trim()
    ? parsePageRanges(ranges, pages.length)
    : pages.map((_, i) => i + 1);
  if (targets.length === 0) throw new Error("No valid pages in that range.");
  const [t, r, b, l] = [mm.top, mm.right, mm.bottom, mm.left].map((v) => Math.max(0, v) * MM);
  for (const n of targets) {
    const page = pages[n - 1];
    const box = page.getCropBox();
    const width = box.width - l - r;
    const height = box.height - t - b;
    if (width < 36 || height < 36) {
      throw new Error(`Those margins would remove all of page ${n}. Use smaller values.`);
    }
    page.setCropBox(box.x + l, box.y + b, width, height);
    page.setTrimBox(box.x + l, box.y + b, width, height);
  }
  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
