import { PDFDocument } from "pdf-lib";
import { parsePageRanges } from "./download";

export async function removePages(file: File, ranges: string): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const remove = new Set(parsePageRanges(ranges, total));
  const keep: number[] = [];
  for (let i = 1; i <= total; i++) if (!remove.has(i)) keep.push(i);
  if (keep.length === 0) throw new Error("Cannot remove every page.");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    keep.map((n) => n - 1),
  );
  copied.forEach((p) => out.addPage(p));
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
