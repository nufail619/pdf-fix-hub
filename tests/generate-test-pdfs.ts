import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFile } from "fs/promises";
import { mkdir } from "fs/promises";

async function createTestPdf(name: string, pages: number) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 0; i < pages; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`Page ${i + 1}`, { x: 50, y: 750, font, size: 20 });
  }
  const bytes = await doc.save();
  await writeFile(`tests/fixtures/${name}`, bytes);
}

async function createFormPdf(name: string) {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const form = doc.getForm();
  form.createTextField("text-field").addToPage(page, { x: 50, y: 700, width: 200, height: 30 });
  const bytes = await doc.save();
  await writeFile(`tests/fixtures/${name}`, bytes);
}

await mkdir("tests/fixtures", { recursive: true });
await createTestPdf("multi-page.pdf", 5);
await createFormPdf("form-pdf.pdf");
