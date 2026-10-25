import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/website",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/pdf-tools/setup.ts",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 2,
  retries: 0,
  outputDir: "test-results/website",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/website-results.json" }],
    ["html", { outputFolder: "playwright-report/website", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "node tests/website/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
