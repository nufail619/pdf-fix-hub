import { PDFDocument, degrees } from "pdf-lib";

export async function rotatePdf(file: File, angle: 90 | 180 | 270): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  const data = await doc.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
