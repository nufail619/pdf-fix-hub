import { test, expect } from "@playwright/test";

test.describe("Compress PDF tool debug flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4173/compress-pdf");
    await page.waitForLoadState("networkidle");
  });

  test("Process and Download", async ({ page }) => {
    // 1. Upload
    await page.setInputFiles('input[type="file"]', "./tests/fixtures/multi-page.pdf");
    await expect(page.locator("text=multi-page.pdf")).toBeVisible();

    // 2. Process
    const processButton = page.getByRole("button", { name: "Process" });
    await processButton.click();

    // Check for success state instead of waiting for download event immediately
    // Wait for the ResultPanel to appear
    await expect(page.getByRole("heading", { name: "Your file is ready" })).toBeVisible({
      timeout: 10000,
    });

    // Click the download link
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("link", { name: "Download" }).click();

    // 3. Verify
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("multi-page-compressed.pdf");
    await download.delete();
  });
});
