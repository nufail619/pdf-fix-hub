import { PDFDocument } from "pdf-lib";
import { parsePageRanges } from "./download";

export async function splitPdf(file: File, ranges: string): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const pages = parsePageRanges(ranges, total);
  if (pages.length === 0) throw new Error("No valid pages selected.");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    pages.map((n) => n - 1),
  );
  copied.forEach((p) => out.addPage(p));
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
