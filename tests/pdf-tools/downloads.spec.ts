import { test, expect } from "../browser";
import { execFileSync } from "node:child_process";
import path from "node:path";

const fixtures = path.resolve("test-results/pdf-tools-fixtures");
const cases = [
  "merge-pdf",
  "split-pdf",
  "compress-pdf",
  "jpg-to-pdf",
  "png-to-pdf",
  "pdf-to-jpg-single",
  "pdf-to-jpg-multiple",
  "pdf-to-jpg-rotated",
  "pdf-to-jpg-print",
  "pdf-to-png-single",
  "pdf-to-png-multiple",
  "pdf-to-jpg-form",
  "pdf-to-png-form",
  "pdf-to-text",
  "word-to-pdf",
  "extract-pdf-pages",
  "remove-pdf-pages",
  "reorder-pdf-pages",
  "rotate-pdf",
  "add-page-numbers-to-pdf",
  "add-text-to-pdf",
  "add-blank-page-to-pdf",
  "add-margin-to-pdf",
  "watermark-pdf",
  "flatten-pdf",
  "flatten-pdf-full",
  "crop-pdf",
  "grayscale-pdf",
  "edit-pdf-metadata",
  "edit-pdf-metadata-clear",
  "compress-pdf-light",
  "compress-pdf-strong",
  "add-margin-to-pdf-zero",
  "watermark-pdf-zero",
  "add-text-to-pdf-zero",
];

for (const name of cases) {
  test(name, async ({ page }, info) => {
    const slug = name.replace(
      /-(single|multiple|rotated|print|full|clear|light|strong|form|zero)$/,
      "",
    );
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`/${slug}`);
    let files = ["sample.pdf"];
    if (slug === "merge-pdf") files.push("second.pdf");
    if (slug === "jpg-to-pdf") files = ["photo.jpg", "photo.jpeg"];
    if (slug === "png-to-pdf") files = ["photo.png"];
    if (slug === "word-to-pdf") files = ["sample.docx"];
    if (slug === "flatten-pdf") files = ["form.pdf"];
    if (name.endsWith("rotated")) files = ["rotated.pdf"];
    if (name.endsWith("-form")) files = ["form.pdf"];
    await page
      .locator('input[type="file"]')
      .setInputFiles(files.map((f) => path.join(fixtures, f)));
    const inputs = page.locator(
      'input:not([type="file"]):not([type="radio"]):not([type="checkbox"])',
    );
    if (slug === "split-pdf") await page.getByPlaceholder("1-3, 5", { exact: true }).fill("1-2,3");
    if (slug === "extract-pdf-pages")
      await page.getByPlaceholder("1-3, 5", { exact: true }).fill("1,3");
    if (slug === "remove-pdf-pages")
      await page.getByPlaceholder("1-3, 5", { exact: true }).fill("2");
    if (slug === "reorder-pdf-pages")
      await page.getByPlaceholder("3,1,2", { exact: true }).fill("3,1,2");
    if (slug === "add-text-to-pdf") {
      for (const [i, value] of ["TEST ADDED TEXT", "2", "40", "50", "16"].entries())
        await inputs.nth(i).fill(value);
    }
    if (slug === "add-blank-page-to-pdf") await inputs.fill("1");
    if (slug === "add-margin-to-pdf") await inputs.fill("20");
    if (slug === "watermark-pdf") await page.getByPlaceholder("CONFIDENTIAL").fill("CONFIDENTIAL");
    if (name === "add-margin-to-pdf-zero") await inputs.fill("0");
    if (name === "watermark-pdf-zero") await inputs.nth(1).fill("0");
    if (name === "add-text-to-pdf-zero") {
      await inputs.nth(2).fill("0");
      await inputs.nth(3).fill("0");
    }
    if (slug === "pdf-to-jpg" || slug === "pdf-to-png") {
      await page.locator("select").selectOption(name.endsWith("print") ? "300" : "72");
      if (!name.endsWith("multiple"))
        await page.getByPlaceholder("All pages, or e.g. 1-3, 5").fill("1");
    }
    if (name === "flatten-pdf-full") await page.locator("select").selectOption("full");
    if (name === "compress-pdf-light") await page.getByText("Light", { exact: true }).click();
    if (name === "compress-pdf-strong") await page.getByText("Strong", { exact: true }).click();
    if (slug === "crop-pdf") await page.getByPlaceholder("All pages, or e.g. 1-3, 5").fill("1");
    if (slug === "edit-pdf-metadata") {
      await expect(page.getByLabel("Title", { exact: true })).toHaveValue("Original title");
      if (name.endsWith("clear")) await page.getByRole("checkbox").check();
      else {
        await page.getByLabel("Title", { exact: true }).fill("Verified title");
        await page.getByLabel("Author", { exact: true }).fill("QA Author");
      }
    }
    await page.getByRole("button", { name: "Process", exact: true }).click();
    const link = page.getByRole("link", { name: "Download", exact: true });
    await expect(link).toBeVisible({ timeout: 30000 });
    const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
    const output = info.outputPath(download.suggestedFilename());
    await download.saveAs(output);
    expect(await download.failure()).toBeNull();
    const evidence = execFileSync(
      "python3",
      ["tests/pdf-tools/verify.py", name, output, fixtures],
      { encoding: "utf8" },
    );
    await info.attach("download-verification.json", {
      body: evidence,
      contentType: "application/json",
    });
    await page.screenshot({ path: info.outputPath("result.png") });
    console.log(evidence.trim());
    expect(errors).toEqual([]);
  });
}

test("PDF to JPG rejects damaged input without a download", async ({ page }) => {
  await page.goto("/pdf-to-jpg");
  await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "broken.pdf"));
  await page.getByRole("button", { name: "Process", exact: true }).click();
  await expect(
    page.getByText("Couldn't read this PDF. The file may be damaged or not a real PDF."),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Download", exact: true })).toHaveCount(0);
});

for (const [slug, value, message] of [
  ["pdf-to-jpg", "1,99", "Invalid page"],
  ["pdf-to-png", "2-1", "Invalid page range"],
  ["split-pdf", "1-2,99", "Invalid page"],
  ["extract-pdf-pages", "1,99", "Invalid page"],
  ["remove-pdf-pages", "", "Enter the pages"],
  ["remove-pdf-pages", "1-3", "Cannot remove every page"],
  ["reorder-pdf-pages", "1,3", "Enter every page"],
  ["reorder-pdf-pages", "1,1,3", "Enter every page"],
]) {
  test(`${slug} rejects invalid selection ${value || "(empty)"}`, async ({ page }) => {
    await page.goto(`/${slug}`);
    await page.locator('input[type="file"]').setInputFiles(path.join(fixtures, "sample.pdf"));
    const selection = page.locator('input:not([type="file"])');
    await selection.fill(value);
    await page.getByRole("button", { name: "Process", exact: true }).click();
    await expect(page.locator("[data-sonner-toast]").filter({ hasText: message })).toBeVisible();
    await expect(page.getByRole("link", { name: "Download", exact: true })).toHaveCount(0);
  });
}
