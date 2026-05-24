import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type PageNumberPosition = "bottom-center" | "bottom-right" | "bottom-left" | "top-center";

export async function addPageNumbers(
  file: File,
  options: { position: PageNumberPosition; fontSize: number } = {
    position: "bottom-center",
    fontSize: 12,
  },
): Promise<Blob> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const pages = doc.getPages();
  pages.forEach((page, i) => {
    const text = `${i + 1} / ${pages.length}`;
    const { width, height } = page.getSize();
    const size = options.fontSize;
    const textWidth = font.widthOfTextAtSize(text, size);
    let x = (width - textWidth) / 2;
    let y = 24;
    if (options.position === "bottom-right") x = width - textWidth - 24;
    if (options.position === "bottom-left") x = 24;
    if (options.position === "top-center") y = height - size - 16;
    page.drawText(text, { x, y, size, font, color: rgb(0.1, 0.1, 0.1) });
  });
  const data = await doc.save();
  return new Blob([data as BlobPart], { type: "application/pdf" });
}
