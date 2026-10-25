import { test, expect } from "@playwright/test";

test.describe("PDF Tools E2E Debugging", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:4173/compress-pdf");
  });

  test("Check console for PDF worker errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.toString()));

    await page.waitForLoadState("networkidle");

    // Wait and check for errors
    await page.waitForTimeout(5000);
    console.log("Errors found:", errors);

    // Fail if we see PDF.js related errors
    expect(errors.some((e) => e.includes("PDF"))).toBe(false);
  });
});
