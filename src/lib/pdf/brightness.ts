import { PDFDocument } from "pdf-lib";
import { openPdf, renderPage, canvasToBlob } from "./pdfjs.ts";

export function validateAdjustments(brightness: number, contrast: number) {
  if (![brightness, contrast].every((v) => Number.isFinite(v) && v >= -100 && v <= 100))
    throw new Error("Brightness and contrast must be between -100 and 100.");
}

/** A neutral setting is an identity transform; alpha is deliberately untouched. */
export function adjustPixels(data: Uint8ClampedArray, brightness: number, contrast: number) {
  validateAdjustments(brightness, contrast);
  const factor = contrast >= 0 ? 1 + contrast / 25 : 1 + contrast / 100;
  for (let i = 0; i < data.length; i += 4)
    for (let channel = 0; channel < 3; channel++)
      data[i + channel] = Math.round((data[i + channel] - 128) * factor + 128 + brightness * 2.55);
}

export function adjustCanvas(canvas: HTMLCanvasElement, brightness: number, contrast: number) {
  const context = canvas.getContext("2d")!;
  const image = context.getImageData(0, 0, canvas.width, canvas.height);
  adjustPixels(image.data, brightness, contrast);
  context.putImageData(image, 0, 0);
}

export async function adjustBrightness(file: File, brightness: number, contrast: number) {
  validateAdjustments(brightness, contrast);
  const source = await openPdf(file);
  try {
    const output = await PDFDocument.create();
    for (let n = 1; n <= source.numPages; n++) {
      const { canvas, widthPt, heightPt } = await renderPage(source, n, 2);
      try {
        adjustCanvas(canvas, brightness, contrast);
        const png = await canvasToBlob(canvas, "image/png");
        const image = await output.embedPng(await png.arrayBuffer());
        output.addPage([widthPt, heightPt]).drawImage(image, {
          x: 0,
          y: 0,
          width: widthPt,
          height: heightPt,
        });
      } finally {
        canvas.width = canvas.height = 0;
      }
    }
    return new Blob([(await output.save()) as BlobPart], { type: "application/pdf" });
  } finally {
    await source.destroy();
  }
}
