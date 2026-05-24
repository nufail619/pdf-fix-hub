import { PDFDocument } from "pdf-lib";

export async function addBlankPage(
  file: File,
  options: { position: number } = { position: 0 },
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  const total = doc.getPageCount();
  const firstSize = total > 0 ? doc.getPages()[0].getSize() : { width: 595.28, height: 841.89 };
  const idx = Math.max(0, Math.min(total, options.position));
  doc.insertPage(idx, [firstSize.width, firstSize.height]);
  const data = await doc.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
