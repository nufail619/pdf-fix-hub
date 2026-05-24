import { PDFDocument } from "pdf-lib";

// margin in points (1pt = 1/72 inch)
export async function addMargin(file: File, marginPt: number): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  const indices = src.getPageIndices();
  const embedded = await out.embedPdf(src, indices);
  for (let i = 0; i < embedded.length; i++) {
    const embeddedPage = embedded[i];
    const srcPage = src.getPage(i);
    const { width, height } = srcPage.getSize();
    const newPage = out.addPage([width + marginPt * 2, height + marginPt * 2]);
    newPage.drawPage(embeddedPage, {
      x: marginPt,
      y: marginPt,
      width,
      height,
    });
  }
  const data = await out.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
