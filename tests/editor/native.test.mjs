import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  PDFDocument,
  StandardFonts,
  degrees,
  cmyk,
  PDFArray,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { init } from "@embedpdf/pdfium";
import { nativeTextJob } from "../../src/lib/pdf/nativeTextCore.ts";
const lib = await init({
  wasmBinary: await readFile("node_modules/@embedpdf/pdfium/dist/pdfium.wasm"),
});
lib.PDFiumExt_Init();
async function fixture() {
  const d = await PDFDocument.create();
  const font = await d.embedFont(StandardFonts.Helvetica);
  for (const [w, h, angle] of [
    [360, 480, 0],
    [480, 360, 90],
    [450, 650, 180],
  ]) {
    const p = d.addPage([w, h]);
    p.setRotation(degrees(angle));
    p.drawText("Original Sample Text", { x: 40, y: 200, font, size: 16 });
    p.drawText("KEEP THIS", { x: 40, y: 100, font, size: 12 });
  }
  return d.save();
}
for (const page of [1, 2, 3])
  test(`genuine text replacement on page ${page} preserves geometry and other pages`, async () => {
    const bytes = await fixture(),
      info = await nativeTextJob(lib, bytes),
      item = info.items.find((t) => t.page === page && t.text === "Original Sample Text");
    assert(item.supported, JSON.stringify(item));
    const out = await nativeTextJob(lib, bytes, [
      { ...item, original: item.text, text: "Changed Text" },
    ]);
    const checked = await nativeTextJob(lib, out);
    assert(checked.items.some((t) => t.page === page && t.text === "Changed Text"));
    assert(!checked.items.some((t) => t.page === page && t.text === "Original Sample Text"));
    assert.equal(checked.items.filter((t) => t.text === "KEEP THIS").length, 3);
    const d = await PDFDocument.load(out);
    assert.deepEqual(
      d.getPages().map((p) => [p.getWidth(), p.getHeight(), p.getRotation().angle]),
      [
        [360, 480, 0],
        [480, 360, 90],
        [450, 650, 180],
      ],
    );
  });
test("invalid, unknown, duplicate, overly wide and unsupported-character replacements fail closed", async () => {
  const bytes = await fixture(),
    item = (await nativeTextJob(lib, bytes)).items[0],
    edit = { ...item, original: item.text, text: "New" };
  for (const change of [
    { ...edit, text: "Unsupported 🚀" },
    { ...edit, original: "wrong" },
    { ...edit, id: "missing" },
    { ...edit, text: "W".repeat(400) },
    { ...edit, x: NaN },
  ])
    await assert.rejects(nativeTextJob(lib, bytes, [change]));
  await assert.rejects(nativeTextJob(lib, bytes, [edit, edit]));
});
test("deletion removes actual text rather than adding a covering rectangle", async () => {
  const bytes = await fixture(),
    item = (await nativeTextJob(lib, bytes)).items[0];
  const result = await nativeTextJob(lib, bytes, [{ ...item, original: item.text, text: "" }]);
  const info = await nativeTextJob(lib, result);
  assert(!info.items.some((t) => t.page === 1 && t.text === item.text));
  assert(info.items.some((t) => t.page === 1 && t.text === "KEEP THIS"));
});
test("embedded subset reuses existing glyphs and rejects new glyphs", async () => {
  const bytes = new Uint8Array(await readFile("public/samples/embedded-font-practice.pdf"));
  const info = await nativeTextJob(lib, bytes),
    item = info.items.find((item) => item.text === "Embedded Sample Text");
  assert(item.embedded);
  assert(item.supported, item.reason);
  const changed = await nativeTextJob(lib, bytes, [
    { ...item, original: item.text, text: "Sample Text" },
  ]);
  assert((await nativeTextJob(lib, changed)).items.some((item) => item.text === "Sample Text"));
  await assert.rejects(
    nativeTextJob(lib, bytes, [{ ...item, original: item.text, text: "Zebra" }]),
    /embedded font/,
  );
});
test("scanned image pages are reported without inventing editable text", async () => {
  const info = await nativeTextJob(
    lib,
    new Uint8Array(await readFile("public/samples/dark-scan-practice.pdf")),
  );
  assert.equal(info.items.length, 0);
  assert.equal(info.pageTextCounts[0], 0);
});
test("existing-text edits preserve an unrelated interactive form and visible value", async () => {
  const d = await PDFDocument.create();
  const p = d.addPage([420, 600]);
  p.drawText("Change me", { x: 40, y: 400, size: 16 });
  const field = d.getForm().createTextField("customer");
  field.setText("Alice Example");
  field.addToPage(p, { x: 40, y: 200, width: 180, height: 24 });
  const bytes = await d.save(),
    item = (await nativeTextJob(lib, bytes)).items.find((item) => item.text === "Change me");
  const out = await nativeTextJob(lib, bytes, [{ ...item, original: item.text, text: "Changed" }]);
  const checked = await PDFDocument.load(out);
  assert.equal(checked.getForm().getTextField("customer").getText(), "Alice Example");
});
test("native position, size and color survive a save on rotated pages", async () => {
  const bytes = await fixture(),
    info = await nativeTextJob(lib, bytes);
  for (const page of [1, 2, 3]) {
    const item = info.items.find(
      (item) => item.page === page && item.text === "Original Sample Text",
    );
    const out = await nativeTextJob(lib, bytes, [
      {
        ...item,
        original: item.text,
        text: "Short",
        x: 0.25,
        y: 0.25,
        fontSize: 12,
        color: "#ff0000",
      },
    ]);
    const changed = (await nativeTextJob(lib, out)).items.find(
      (item) => item.page === page && item.text === "Short",
    );
    assert(Math.abs(changed.x - 0.25) < 0.001);
    assert(Math.abs(changed.y - 0.25) < 0.001);
    assert(Math.abs(changed.fontSize - 12) < 0.01);
    assert.equal(changed.color, "#ff0000");
    await assert.rejects(
      nativeTextJob(lib, bytes, [{ ...item, original: item.text, text: "W".repeat(50) }]),
      /wider|inside/,
    );
  }
});
test("uninspectable font/color metadata is rejected without using uninitialized heap data", async () => {
  const bytes = await fixture();
  for (const engine of [
    { ...lib, FPDFFont_GetBaseFontName: () => 0 },
    { ...lib, FPDFPageObj_GetFillColor: () => false },
  ]) {
    const info = await nativeTextJob(engine, bytes);
    assert(info.items.length > 0);
    for (const item of info.items) {
      assert.equal(item.supported, false);
      assert.match(item.color, /^#[0-9a-f]{6}$/);
    }
  }
});

test("native text-only changes preserve the original CMYK fill color", async () => {
  const source = await PDFDocument.create();
  source
    .addPage([420, 600])
    .drawText("CMYK original text", { x: 40, y: 300, size: 16, color: cmyk(0.1, 0.2, 0.3, 0.4) });
  const bytes = await source.save(),
    item = (await nativeTextJob(lib, bytes)).items[0];
  const output = await nativeTextJob(lib, bytes, [{ ...item, original: item.text, text: "CMYK" }]);
  const doc = await PDFDocument.load(output);
  const contents = doc.getPage(0).node.Contents();
  const streams =
    contents instanceof PDFArray
      ? contents.asArray().map((ref) => doc.context.lookup(ref))
      : [contents];
  const commands = streams
    .filter((s) => s instanceof PDFRawStream)
    .map((s) => Buffer.from(decodePDFRawStream(s).decode()).toString("latin1"))
    .join("\n");
  assert.match(commands, /0?\.1\d* 0?\.2\d* 0?\.3\d* 0?\.4\d* k/);
});
