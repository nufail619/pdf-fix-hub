import { openPdf } from "./pdfjs";

export async function pdfToText(file: File) {
  const doc = await openPdf(file);
  const parts: string[] = [];
  let chars = 0;
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let text = "";
    for (const item of content.items) {
      if (!("str" in item)) continue;
      text += item.str + (item.hasEOL ? "\n" : "");
    }
    text = text.replace(/[ \t]+\n/g, "\n").trim();
    chars += text.length;
    parts.push(`--- Page ${i} ---\n${text}`);
    page.cleanup();
  }
  await doc.destroy();
  if (chars === 0) {
    throw new Error(
      "No text found. This PDF is probably a scanned image — it needs OCR, which this tool doesn't do.",
    );
  }
  return new Blob([parts.join("\n\n") + "\n"], { type: "text/plain;charset=utf-8" });
}
