import { test, expect } from "../browser";
import { publicRoutes } from "../../scripts/public-routes.mjs";
import { ADSENSE_SCRIPT_URL } from "../../scripts/adsense.mjs";

type AdvertisingWindow = Window & {
  adSenseFixtureLoads?: number;
  adSensePauseAtLoad?: number;
  adsbygoogle?: { pauseAdRequests?: number };
};

const loader = 'head script[src*="/pagead/js/adsbygoogle.js"]';

test("every public production page contains the exact verification loader once in its initial head", async ({
  request,
  page,
}) => {
  for (const path of await publicRoutes()) {
    const response = await request.get(path);
    const html = await response.text();
    expect(response.status(), path).toBe(200);
    expect(html.split("</head>")[0], path).toContain(
      `<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`,
    );
    expect(html.indexOf('id="adsense-consent-default"')).toBeLessThan(
      html.indexOf(ADSENSE_SCRIPT_URL),
    );
    const scripts = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, "text/html");
      return [...doc.querySelectorAll('script[src*="/pagead/js/adsbygoogle.js"]')].map(
        (script) => ({
          parent: script.parentElement?.tagName,
          src: script.getAttribute("src"),
        }),
      );
    }, html);
    expect(scripts, path).toEqual([{ parent: "HEAD", src: ADSENSE_SCRIPT_URL }]);
  }
  const ads = await request.get("/ads.txt");
  expect(await ads.text()).toBe("google.com, pub-1040851064865171, DIRECT, f08c47fec0942fa0\n");
  for (const path of ["/admin/", "/not-a-page"]) {
    expect(await (await request.get(path)).text()).not.toContain(ADSENSE_SCRIPT_URL);
  }
});

test("verification loads with ad requests paused; consent, navigation and revocation never duplicate the loader", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(loader)).toHaveCount(1);
  await expect
    .poll(() => page.evaluate(() => (window as AdvertisingWindow).adSenseFixtureLoads))
    .toBe(1);
  expect(await page.evaluate(() => (window as AdvertisingWindow).adSensePauseAtLoad)).toBe(1);
  expect(
    await page.evaluate(() => (window as AdvertisingWindow).adsbygoogle?.pauseAdRequests),
  ).toBe(1);
  await page.getByRole("button", { name: "Choose preferences", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Advertising/ }).check();
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as AdvertisingWindow).adsbygoogle?.pauseAdRequests))
    .toBe(0);
  await page.getByRole("contentinfo").getByRole("link", { name: "Blog", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The MY PDF FIX Blog");
  await expect(page.locator(loader)).toHaveCount(1);
  expect(await page.evaluate(() => (window as AdvertisingWindow).adSenseFixtureLoads)).toBe(1);
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click();
  await page.getByRole("checkbox", { name: /^Advertising/ }).uncheck();
  await page.getByRole("button", { name: "Save preferences", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => (window as AdvertisingWindow).adsbygoogle?.pauseAdRequests))
    .toBe(1);
  await expect(page.locator(loader)).toHaveCount(1);
  await page
    .context()
    .addInitScript(() => Object.defineProperty(navigator, "globalPrivacyControl", { value: true }));
  await page.reload();
  await page.getByRole("button", { name: "Privacy settings", exact: true }).click();
  await expect(page.getByRole("checkbox", { name: /^Advertising/ })).toBeDisabled();
  expect(
    await page.evaluate(() => (window as AdvertisingWindow).adsbygoogle?.pauseAdRequests),
  ).toBe(1);
});
