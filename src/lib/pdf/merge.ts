import { PDFDocument } from "pdf-lib";

export async function mergePdfs(files: File[]): Promise<Blob> {
  const out = await PDFDocument.create();
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const src = await PDFDocument.load(bytes);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
