import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

export async function watermarkPdf(
  file: File,
  options: { text: string; opacity: number; fontSize: number },
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  doc.getPages().forEach((page) => {
    const { width, height } = page.getSize();
    const size = options.fontSize;
    const textWidth = font.widthOfTextAtSize(options.text, size);
    page.drawText(options.text, {
      x: width / 2 - textWidth / 2,
      y: height / 2,
      size,
      font,
      color: rgb(0.6, 0.05, 0.05),
      opacity: options.opacity,
      rotate: degrees(-30),
    });
  });
  const data = await doc.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
