import { test as base } from "@playwright/test";
import type { BrowserContext } from "@playwright/test";

// Test the real HTML/consent integration without generating real ad traffic.
export async function stubAdSense(context: BrowserContext) {
  await context.route("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body:
        "window.adSenseFixtureLoads=(window.adSenseFixtureLoads||0)+1;" +
        "window.adSensePauseAtLoad=window.adsbygoogle?.pauseAdRequests;",
    }),
  );
}

export const test = base.extend({
  context: async ({ context }, run) => {
    await stubAdSense(context);
    await run(context);
  },
});
export { expect } from "@playwright/test";
export type { Page, TestInfo } from "@playwright/test";
