import { PDFDocument } from "pdf-lib";

export async function imagesToPdf(files: File[], kind: "jpg" | "png"): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const image = kind === "jpg" ? await out.embedJpg(bytes) : await out.embedPng(bytes);
    const page = out.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
