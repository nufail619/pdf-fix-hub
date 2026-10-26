import { defineConfig } from "@playwright/test";
import { resolve } from "node:path";

export default defineConfig({
  testDir: "./tests/pages",
  timeout: 180000,
  expect: { timeout: 15000 },
  workers: 1,
  retries: 0,
  outputDir: "test-results/pages",
  reporter: [
    ["list"],
    ["json", { outputFile: "test-results/pages-results.json" }],
    ["html", { outputFolder: "playwright-report/pages", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:4188",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer: {
    // Local emulator only. This command does not upload assets or deploy.
    command:
      "wrangler pages dev dist --local --ip 127.0.0.1 --port 4188 --inspector-port 0 --persist-to test-results/pages-runtime/state",
    env: {
      WRANGLER_SEND_METRICS: "false",
      WRANGLER_LOG_PATH: resolve("test-results/pages-runtime/wrangler.log"),
      XDG_CONFIG_HOME: resolve("test-results/pages-runtime/config"),
      XDG_CACHE_HOME: resolve("test-results/pages-runtime/cache"),
    },
    url: "http://127.0.0.1:4188",
    reuseExistingServer: false,
    timeout: 120000,
  },
});
