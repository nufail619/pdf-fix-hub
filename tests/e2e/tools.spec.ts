import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Compress PDF tool debugging', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the preview/served site
    await page.goto('http://localhost:4173');
    await page.waitForLoadState('networkidle');
  });

  test('Compress PDF tool flow with logging', async ({ page }) => {
    // Listen for console logs and errors
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));

    // Navigate to tool
    const link = page.getByRole('link', { name: 'Compress PDF', exact: true });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/.*compress-pdf/);

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
    await fileInput.setInputFiles('./tests/fixtures/multi-page.pdf');

    // Process file
    // Move the expectation before the button click to ensure it's actionable
    await expect(page.getByRole('button', { name: 'Process' })).toBeEnabled();

    const downloadPromise = page.waitForEvent('download', { timeout: 30000 });
    await page.getByRole('button', { name: 'Process' }).click();

    // Wait for the download
    const download = await downloadPromise;

    // Verify
    expect(download.suggestedFilename()).toContain('compressed');
    await download.delete();
  });
});
