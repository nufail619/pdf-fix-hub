import { PDFDocument } from "pdf-lib";
import { parsePageRanges } from "./download";
import { zipSync } from "fflate";

export type SplitResult = { blob: Blob; filename: string };

export async function splitPdf(
  file: File,
  ranges: string,
  mode: "single" | "multiple" = "multiple",
): Promise<SplitResult | SplitResult[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const src = await PDFDocument.load(bytes);
  const total = src.getPageCount();
  const base = file.name.replace(/\.[^.]+$/, "");

  const parts = ranges
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) throw new Error("No valid ranges provided.");

  const results: SplitResult[] = [];

  if (mode === "single") {
    // Extract all selected pages into ONE PDF
    const pages = parsePageRanges(ranges, total);
    if (pages.length === 0) throw new Error("No valid pages selected.");
    const out = await PDFDocument.create();
    const copied = await out.copyPages(
      src,
      pages.map((n) => n - 1),
    );
    copied.forEach((p) => out.addPage(p));
    const data = await out.save();
    return {
      blob: new Blob([data as BlobPart], { type: "application/pdf" }),
      filename: `${base}-extracted.pdf`,
    };
  } else {
    // Split into MULTIPLE PDFs (one per range/part)
    for (const part of parts) {
      const pages = parsePageRanges(part, total);
      if (pages.length === 0) continue;

      const out = await PDFDocument.create();
      const copied = await out.copyPages(
        src,
        pages.map((n) => n - 1),
      );
      copied.forEach((p) => out.addPage(p));
      const data = await out.save();
      results.push({
        blob: new Blob([data as BlobPart], { type: "application/pdf" }),
        filename: `${base}-${part.replace(/\s+/g, "")}.pdf`,
      });
    }

    if (results.length === 0) throw new Error("No valid pages selected.");
    if (results.length === 1) return results[0];

    // Create ZIP for multiple files
    const zipData: Record<string, Uint8Array> = {};
    for (const res of results) {
      zipData[res.filename] = new Uint8Array(await res.blob.arrayBuffer());
    }
    const zipped = zipSync(zipData);
    return {
      blob: new Blob([zipped], { type: "application/zip" }),
      filename: `${base}-split.zip`,
    };
  }
}
