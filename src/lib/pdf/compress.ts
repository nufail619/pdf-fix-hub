import { PDFDocument } from "pdf-lib";
import { rasterizePdf } from "./rasterize";
import { formatBytes } from "./pdfjs";

export type CompressLevel = "light" | "recommended" | "strong";

const LEVELS: Record<Exclude<CompressLevel, "light">, { scale: number; quality: number }> = {
  recommended: { scale: 1.5, quality: 0.65 },
  strong: { scale: 1.0, quality: 0.45 },
};

/**
 * Light: lossless re-save (keeps text selectable).
 * Recommended / Strong: pages re-drawn as optimized images; the smaller of the
 * lossless and image versions is returned.
 */
export async function compressPdf(file: File, level: CompressLevel) {
  const original = file.size;
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()), {
    updateMetadata: false,
  });
  const lossless = new Blob([(await doc.save({ useObjectStreams: true })) as BlobPart], {
    type: "application/pdf",
  });
  let best = lossless;
  if (level !== "light") {
    const lossy = await rasterizePdf(file, LEVELS[level]);
    if (lossy.size < best.size) best = lossy;
  }
  // Less than 1% saved is not worth a new file.
  if (best.size >= original * 0.99) {
    return {
      blob: new Blob([await file.arrayBuffer()], { type: "application/pdf" }),
      note: `This PDF is already well optimized (${formatBytes(original)}). Try a stronger level for a smaller file.`,
    };
  }
  const saved = Math.round((1 - best.size / original) * 100);
  return {
    blob: best,
    note: `Reduced from ${formatBytes(original)} to ${formatBytes(best.size)} (${saved}% smaller).`,
  };
}
