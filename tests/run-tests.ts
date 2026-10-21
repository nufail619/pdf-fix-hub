import { PDFDocument } from 'pdf-lib';
import { readFile, writeFile } from 'fs/promises';
import { mergePdfs } from '../src/lib/pdf/merge.ts';
import { splitPdf } from '../src/lib/pdf/split.ts';
import { extractPages } from '../src/lib/pdf/extractPages.ts';
import { removePages } from '../src/lib/pdf/removePages.ts';
import { reorderPages } from '../src/lib/pdf/reorderPages.ts';
import { rotatePdf } from '../src/lib/pdf/rotate.ts';
import { compressPdf } from '../src/lib/pdf/compress.ts';
import { flattenPdf } from '../src/lib/pdf/flatten.ts';
import { cropPdf } from '../src/lib/pdf/crop.ts';
import { watermarkPdf } from '../src/lib/pdf/watermark.ts';
import { addPageNumbers } from '../src/lib/pdf/pageNumbers.ts';
import { addTextToPdf } from '../src/lib/pdf/addText.ts';
import { addMargin } from '../src/lib/pdf/addMargin.ts';
import { addBlankPage } from '../src/lib/pdf/addBlankPage.ts';
import { editMetadata } from '../src/lib/pdf/metadata.ts';

async function runTest(name: string, fn: () => Promise<Blob | { blob: Blob; filename: string } | any>) {
  console.log(`--- Testing ${name} ---`);
  try {
    const result = await fn();
    const blob = result.blob || result;
    console.log(`PASS: ${name}, Size: ${(blob.size / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error(`FAIL: ${name}`, err);
  }
}

async function main() {
  const fileBuffer = await readFile('tests/fixtures/multi-page.pdf');
  const file = new File([fileBuffer], 'multi-page.pdf', { type: 'application/pdf' });

  await runTest('Merge PDF', () => mergePdfs([file, file]));
  await runTest('Split PDF (Multiple)', () => splitPdf(file, '1-2, 3-5', 'multiple'));
  await runTest('Split PDF (Single)', () => splitPdf(file, '1-2, 3-5', 'single'));
  await runTest('Extract Pages', () => extractPages(file, '1-2'));
  await runTest('Remove Pages', () => removePages(file, '1-2'));
  await runTest('Reorder Pages', () => reorderPages(file, '3,1,2'));
  await runTest('Rotate PDF', () => rotatePdf(file, 90));
  // await runTest('Compress PDF', () => compressPdf(file, 'recommended'));
  // await runTest('Flatten PDF', () => flattenPdf(file, 'forms'));
  await runTest('Crop PDF', () => cropPdf(file, { top: 10, right: 10, bottom: 10, left: 10 }, '1-2'));

  // Test Flatten with a form PDF
  const formFileBuffer = await readFile('tests/fixtures/form-pdf.pdf');
  const formFile = new File([formFileBuffer], 'form-pdf.pdf', { type: 'application/pdf' });
  await runTest('Flatten PDF (Forms)', () => flattenPdf(formFile, 'forms'));

  await runTest('Watermark PDF', () => watermarkPdf(file, { text: 'Test', opacity: 0.5, fontSize: 50 }));
  await runTest('Add Page Numbers', () => addPageNumbers(file, { position: 'bottom-center', fontSize: 12 }));
  await runTest('Add Text', () => addTextToPdf(file, { text: 'Hello', page: 1, x: 50, y: 50, fontSize: 20 }));
  await runTest('Add Margin', () => addMargin(file, 20));
  await runTest('Add Blank Page', () => addBlankPage(file, { position: 1 }));
  await runTest('Edit Metadata', () => editMetadata(file, { title: 'New Title', author: 'Author Name' }));
}

main().catch(console.error);
