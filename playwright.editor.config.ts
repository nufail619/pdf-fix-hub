import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/editor",
  testMatch: "*.spec.ts",
  globalSetup: "./tests/editor/setup.ts",
  timeout: 90000,
  expect: { timeout: 30000 },
  workers: 2,
  retries: 0,
  outputDir: "test-results/editor",
  reporter: [["list"], ["json", { outputFile: "test-results/editor-results.json" }]],
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
    },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node tests/website/serve.mjs",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
  },
});
