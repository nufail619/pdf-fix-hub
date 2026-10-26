import { test, expect } from "../browser";
import type { Page } from "../browser";
import { publicRoutes } from "../../scripts/public-routes.mjs";
import {
  ADSENSE_SCRIPT_URL,
  ADSENSE_PUBLISHER_ID,
  isAdEligiblePath,
} from "../../scripts/adsense.mjs";
import { PRIVACY_STORAGE_KEY } from "../../src/lib/privacy-consent";

type AdvertisingWindow = Window & {
  adSenseFixtureLoads?: number;
  adSensePauseAtLoad?: number;
  adsbygoogle?: { pauseAdRequests?: number };
  __TSR_ROUTER__?: { navigate: (options: { href: string }) => Promise<void> };
};
const loader = 'head script[src*="/pagead/js/adsbygoogle.js"]';
const paused = (page: Page) =>
  page.evaluate(() => (window as AdvertisingWindow).adsbygoogle?.pauseAdRequests ?? 1);

async function saveConsent(page: Page, advertising = true) {
  await page.context().addInitScript(
    ({ key, advertising }) => {
      localStorage.setItem(
        key,
        JSON.stringify({ version: 1, analytics: false, advertising, savedAt: Date.now() }),
      );
    },
    { key: PRIVACY_STORAGE_KEY, advertising },
  );
}
async function navigate(page: Page, href: string) {
  await page.evaluate((href) => {
    void (window as AdvertisingWindow).__TSR_ROUTER__!.navigate({ href });
  }, href);
}

test("all 40 production pages retain ownership metadata; only content pages contain one paused verification loader", async ({
  request,
  page,
}) => {
  const routes = await publicRoutes();
  for (const path of routes) {
    const response = await request.get(path);
    const html = await response.text();
    expect(response.status(), path).toBe(200);
    const head = html.split("</head>")[0];
    expect(head, path).toContain(
      `<meta name="google-adsense-account" content="${ADSENSE_PUBLISHER_ID}">`,
    );
    const scripts = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      return [...doc.querySelectorAll('script[src*="/pagead/js/adsbygoogle.js"]')].map(
        (script) => ({ parent: script.parentElement?.tagName, src: script.getAttribute("src") }),
      );
    }, html);
    if (isAdEligiblePath(path, routes)) {
      expect(head, path).toContain(
        `<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`,
      );
      expect(head.indexOf('id="adsense-consent-default"')).toBeLessThan(
        head.indexOf(ADSENSE_SCRIPT_URL),
      );
      expect(scripts, path).toEqual([{ parent: "HEAD", src: ADSENSE_SCRIPT_URL }]);
    } else expect(scripts, path).toEqual([]);
  }
  expect(await (await request.get("/ads.txt")).text()).toBe(
    "google.com, pub-1040851064865171, DIRECT, f08c47fec0942fa0\n",
  );
  for (const path of ["/admin/", "/not-a-page", "/blog/no-such-post", "/guides/no-such-guide"])
    expect(await (await request.get(path)).text()).not.toContain(ADSENSE_SCRIPT_URL);
});

test("verification pauses by default; consent, eligible navigation, revocation and browser opt-out never duplicate it", async ({
  page,
}) => {
  await page.goto("/merge-pdf");
  await expect(page.locator(loader)).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => (window as AdvertisingWindow).adSenseFixtureLoads))
    .toBe(1);
  expect(await page.evaluate(() => (window as AdvertisingWindow).adSensePauseAtLoad)).toBe(1);
  expect(await paused(page)).toBe(1);
  await page.getByRole("button", { name: "Choose preferences", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Advertising/ }).check();
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await expect.poll(() => paused(page)).toBe(0);
  await navigate(page, "/split-pdf");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Split PDF");
  await expect.poll(() => paused(page)).toBe(0);
  await expect(page.locator(loader)).toHaveCount(1);
  expect(await page.evaluate(() => (window as AdvertisingWindow).adSenseFixtureLoads)).toBe(1);
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Advertising/ }).uncheck();
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await expect.poll(() => paused(page)).toBe(1);
  await expect(page.locator(loader)).toHaveCount(1);
  await page
    .context()
    .addInitScript(() => Object.defineProperty(navigator, "globalPrivacyControl", { value: true }));
  await page.reload();
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: /^Advertising/ })).toBeDisabled();
  expect(await paused(page)).toBe(1);
});

for (const path of ["/not-a-page", "/blog/no-such-post", "/guides/no-such-guide"]) {
  test(`${path}: saved consent cannot load ads on a direct 404 or after router navigation`, async ({
    page,
  }, info) => {
    await saveConsent(page);
    const adRequests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes("googlesyndication")) adRequests.push(request.url());
    });
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Privacy settings", exact: true })).toBeVisible();
    await expect(page.locator(loader)).toHaveCount(0);
    expect(await paused(page)).toBe(1);
    expect(adRequests).toEqual([]);
    const directRequests = [...adRequests];
    await page.goto("/merge-pdf");
    await expect.poll(() => paused(page)).toBe(0);
    await expect.poll(() => adRequests.length).toBe(1);
    await navigate(page, path);
    await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
    await expect(page.locator(loader)).toHaveCount(0);
    expect(await paused(page)).toBe(1);
    expect(adRequests).toHaveLength(1);
    await page.reload();
    await expect(page.getByRole("heading", { name: "Page not found", exact: true })).toBeVisible();
    expect(adRequests).toHaveLength(1);
    await info.attach("ad-exclusion-evidence.json", {
      body: JSON.stringify(
        {
          path,
          directStatus: response?.status(),
          directRequests,
          totalRequestsAfterEligiblePageAndReturn: adRequests,
          finalLoaderCount: await page.locator(loader).count(),
          finalPaused: await paused(page),
        },
        null,
        2,
      ),
      contentType: "application/json",
    });
  });
}

for (const path of ["/", "/blog", "/guides"]) {
  test(`${path}: empty searches stay ad-free before and after client navigation with saved consent`, async ({
    page,
  }) => {
    await saveConsent(page);
    let requests = 0;
    page.on("request", (request) => {
      if (request.url().includes("googlesyndication")) requests++;
    });
    await page.goto(path);
    await page.getByRole("searchbox").fill("zz-no-matching-result");
    await expect(
      page.getByText(
        path === "/" ? "No tools match your search." : "No articles match your search.",
      ),
    ).toBeVisible();
    expect(requests).toBe(0);
    await expect(page.locator(loader)).toHaveCount(0);
    expect(await paused(page)).toBe(1);
    await page
      .getByRole("button", { name: path === "/" ? "Show all tools" : "Show all articles" })
      .click();
    expect(requests).toBe(0);
    await navigate(page, "/merge-pdf");
    await expect.poll(() => paused(page)).toBe(0);
    expect(requests).toBe(1);
    if (path === "/")
      await page.getByRole("link", { name: "MY PDF FIX home", exact: true }).click();
    else
      await page
        .getByRole("contentinfo")
        .getByRole("link", { name: path === "/blog" ? "Blog" : "Guides", exact: true })
        .click();
    await expect(page).toHaveURL(new RegExp(`${path === "/" ? "/" : path}$`));
    await page.getByRole("searchbox").fill("zz-no-matching-result");
    await expect(
      page.getByText(
        path === "/" ? "No tools match your search." : "No articles match your search.",
      ),
    ).toBeVisible();
    await expect(page.locator(loader)).toHaveCount(0);
    expect(await paused(page)).toBe(1);
    expect(requests).toBe(1);
    await page.goBack();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Merge PDF");
    await expect.poll(() => paused(page)).toBe(0);
    await page.goForward();
    await expect(page.getByRole("searchbox")).toBeVisible();
    await expect(page.locator(loader)).toHaveCount(0);
    expect(await paused(page)).toBe(1);
  });
}
