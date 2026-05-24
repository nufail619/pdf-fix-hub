import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function addTextToPdf(
  file: File,
  options: { text: string; page: number; x: number; y: number; fontSize: number },
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const pages = doc.getPages();
  const idx = Math.max(0, Math.min(pages.length - 1, options.page - 1));
  pages[idx].drawText(options.text, {
    x: options.x,
    y: options.y,
    size: options.fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });
  const data = await doc.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
