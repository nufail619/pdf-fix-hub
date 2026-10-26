import { PDFDocument } from "pdf-lib";
import { rasterizePdf } from "./rasterize";

export async function flattenPdf(file: File, mode: "forms" | "full") {
  if (mode === "full") {
    return {
      blob: await rasterizePdf(file, { scale: 2, quality: 0.85, annotations: true }),
      note: "Every page was rendered as an image, including supported visible annotation appearances. Text is no longer selectable. This does not prevent later editing or securely redact content.",
    };
  }
  const doc = await PDFDocument.load(new Uint8Array(await file.arrayBuffer()));
  const form = doc.getForm();
  const count = form.getFields().length;
  if (count === 0) {
    throw new Error(
      "This PDF has no fillable form fields. Choose “Everything” to flatten comments and annotations instead.",
    );
  }
  form.flatten();
  const bytes = await doc.save({ useObjectStreams: true });
  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    note: `${count} form field${count === 1 ? "" : "s"} flattened. Text stays selectable.`,
  };
}
