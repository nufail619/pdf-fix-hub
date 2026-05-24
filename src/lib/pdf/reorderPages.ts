import { PDFDocument } from "pdf-lib";

export async function reorderPages(file: File, order: string): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const sequence = order
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= total);
  if (sequence.length === 0)
    throw new Error("Enter a comma-separated page order, e.g. 3,1,2");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, sequence.map((n) => n - 1));
  copied.forEach((p) => out.addPage(p));
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
