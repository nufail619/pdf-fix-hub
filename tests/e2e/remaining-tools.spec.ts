import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import fs from "fs/promises";

test.describe("Remaining PDF Tools E2E Testing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4173");
    await page.waitForLoadState("networkidle");
  });

  async function validatePdf(path: string, expectedPages: number) {
    const bytes = await fs.readFile(path);
    const doc = await PDFDocument.load(bytes);
    return doc.getPageCount() === expectedPages;
  }

  test("Compress PDF tool flow", async ({ page }) => {
    await page.getByRole("link", { name: "Compress PDF", exact: true }).click();
    await page.setInputFiles('input[type="file"]', "./tests/fixtures/multi-page.pdf");

    // Select "recommended" (default)
    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "Process" }).click();
    const download = await downloadPromise;
    const downloadPath = `./tests/fixtures/${download.suggestedFilename()}`;
    await download.saveAs(downloadPath);

    const originalSize = (await fs.stat("./tests/fixtures/multi-page.pdf")).size;
    const compressedSize = (await fs.stat(downloadPath)).size;

    expect(await validatePdf(downloadPath, 5)).toBe(true);
    expect(compressedSize).toBeLessThan(originalSize);

    console.log(`Compress PDF PASS: Original: ${originalSize}B, Compressed: ${compressedSize}B`);
    await fs.unlink(downloadPath);
  });

  test("Grayscale PDF tool flow", async ({ page }) => {
    await page.getByRole("link", { name: "Grayscale PDF", exact: true }).click();
    await page.setInputFiles('input[type="file"]', "./tests/fixtures/multi-page.pdf");

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "Process" }).click();
    const download = await downloadPromise;
    const downloadPath = `./tests/fixtures/${download.suggestedFilename()}`;
    await download.saveAs(downloadPath);

    expect(await validatePdf(downloadPath, 5)).toBe(true);

    console.log("Grayscale PDF PASS");
    await fs.unlink(downloadPath);
  });

  test("PDF to Text tool flow", async ({ page }) => {
    await page.getByRole("link", { name: "PDF to Text", exact: true }).click();
    await page.setInputFiles('input[type="file"]', "./tests/fixtures/multi-page.pdf");

    const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
    await page.getByRole("button", { name: "Process" }).click();
    const download = await downloadPromise;
    const downloadPath = `./tests/fixtures/${download.suggestedFilename()}`;
    await download.saveAs(downloadPath);

    const content = await fs.readFile(downloadPath, "utf-8");
    expect(content).toContain("Page 1");
    expect(content).toContain("Page 5");

    console.log("PDF to Text PASS");
    await fs.unlink(downloadPath);
  });

  test("PDF to JPG tool flow", async ({ page }) => {
    await page.getByRole("link", { name: "PDF to JPG", exact: true }).click();
    await page.setInputFiles('input[type="file"]', "./tests/fixtures/multi-page.pdf");

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Process" }).click();
    const download = await downloadPromise;
    // PDF to JPG tool likely returns a ZIP
    expect(download.suggestedFilename()).toMatch(/\.zip$/);

    console.log("PDF to JPG NOT FULLY TESTED (Zip content not validated)");
    await download.delete();
  });

  test("Word to PDF tool flow", async ({ page }) => {
    // Cannot test without a .docx fixture.
    console.log("Word to PDF NOT TESTED (Missing .docx fixture)");
    test.skip();
  });
});
