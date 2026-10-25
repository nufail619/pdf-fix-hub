import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/cms",
  testMatch: "*.spec.ts",
  timeout: 60000,
  expect: { timeout: 15000 },
  workers: 1,
  retries: 0,
  outputDir: "test-results/cms",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/cms-results.json" }],
    ["html", { outputFolder: "playwright-report/cms", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node tests/cms/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
