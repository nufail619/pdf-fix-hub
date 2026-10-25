import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/pdf-tools",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/pdf-tools/setup.ts",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 2,
  retries: 0,
  outputDir: "test-results/pdf-tools",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/pdf-tools-results.json" }],
    ["html", { outputFolder: "playwright-report/pdf-tools", open: "never" }],
  ],
  use: {
    baseURL: process.env.PDF_TOOLS_BASE_URL || "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    // finalize-spa removes the SSR bundle, so serve the actual static output.
    command: "node tests/pdf-tools/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
