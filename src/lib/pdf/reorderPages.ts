import { PDFDocument } from "pdf-lib";

export async function reorderPages(file: File, order: string): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const parts = order.split(",").map((s) => s.trim());
  const sequence = parts.map(Number);
  if (
    parts.some((s) => !/^\d+$/.test(s)) ||
    sequence.length !== total ||
    new Set(sequence).size !== total ||
    sequence.some((n) => n < 1 || n > total)
  ) {
    throw new Error(`Enter every page from 1 to ${total} exactly once, in the order you want.`);
  }
  const out = await PDFDocument.create();
  const copied = await out.copyPages(
    src,
    sequence.map((n) => n - 1),
  );
  copied.forEach((p) => out.addPage(p));
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
