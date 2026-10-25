import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/new-tools",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/new-tools/setup.ts",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 2,
  retries: 0,
  outputDir: "test-results/new-tools",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/new-tools-results.json" }],
    ["html", { outputFolder: "playwright-report/new-tools", open: "never" }],
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
    command: "node tests/pdf-tools/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
