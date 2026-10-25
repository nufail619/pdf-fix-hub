import test from "node:test";
import assert from "node:assert/strict";
import { PDFDocument, StandardFonts, degrees } from "pdf-lib";
import { adjustPixels, validateAdjustments } from "../../src/lib/pdf/brightness.ts";
import { displayGeometry, editPdf, validateOverlays } from "../../src/lib/pdf/edit.ts";

test("brightness and contrast preserve alpha and neutral pixels", () => {
  const data = new Uint8ClampedArray([0, 90, 255, 128, 128, 128, 128, 0]);
  const original = data.slice();
  adjustPixels(data, 0, 0);
  assert.deepEqual(data, original);
  adjustPixels(data, 20, 0);
  assert.deepEqual([...data], [51, 141, 255, 128, 179, 179, 179, 0]);
});
test("contrast extremes clamp channel values and reject invalid settings", () => {
  const data = new Uint8ClampedArray([30, 128, 240, 255]);
  adjustPixels(data, 0, 100);
  assert.deepEqual([...data], [0, 128, 255, 255]);
  adjustPixels(data, 0, -100);
  assert.deepEqual([...data], [128, 128, 128, 255]);
  for (const value of [NaN, Infinity, -101, 101])
    assert.throws(() => validateAdjustments(value, 0));
});

const element = {
  id: "one",
  page: 1,
  kind: "text",
  x: 0.1,
  y: 0.2,
  width: 0.7,
  height: 0.1,
  text: "Added text",
  fontSize: 16,
  color: "#1d4ed8",
};
test("editor validates element coordinates, pages, size, type and colors", () => {
  assert.doesNotThrow(() => validateOverlays([element], 2));
  for (const patch of [
    { page: 0 },
    { page: 3 },
    { x: -0.1 },
    { x: 0.8 },
    { width: 0 },
    { height: NaN },
    { kind: "script" },
    { color: "red" },
    { fontSize: 500 },
  ])
    assert.throws(() => validateOverlays([{ ...element, ...patch }], 2));
  assert.throws(() => validateOverlays(null, 2));
});
test("display geometry maps all four rotations and nonzero crop origins", () => {
  const crop = { x: 20, y: 30, width: 320, height: 420 };
  for (const [rotation, width, height, matrix] of [
    [0, 320, 420, [1, 0, 0, 1, 20, 30]],
    [90, 420, 320, [0, 1, -1, 0, 340, 30]],
    [180, 320, 420, [-1, 0, 0, -1, 340, 450]],
    [270, 420, 320, [0, -1, 1, 0, 20, 450]],
  ])
    assert.deepEqual(displayGeometry(crop, rotation), { width, height, matrix });
  assert.throws(() => displayGeometry(crop, 45));
});
test("editor exports real vector overlays and preserves source pages and text", async () => {
  const input = await PDFDocument.create();
  const font = await input.embedFont(StandardFonts.Helvetica);
  input.addPage([360, 480]).drawText("Original preserved", { font, x: 30, y: 400 });
  input.addPage([360, 480]).setRotation(degrees(90));
  const file = new File([await input.save()], "source.pdf");
  const overlays = ["text", "rectangle", "ellipse", "highlight", "whiteout"].map((kind, n) => ({
    ...element,
    id: String(n),
    kind,
  }));
  const blob = await editPdf(file, overlays);
  const output = await PDFDocument.load(await blob.arrayBuffer());
  assert.equal(output.getPageCount(), 2);
  assert.equal(output.getPage(1).getRotation().angle, 90);
  assert.equal(output.getPage(0).getMediaBox().width, 360);
  await assert.rejects(editPdf(file, [{ ...element, text: "Unsupported \u{1f680}" }]), /Latin/);
  await assert.rejects(
    editPdf(file, [{ ...element, text: "A very long string that cannot fit", width: 0.01 }]),
    /too wide/,
  );
  await assert.rejects(editPdf(file, [{ ...element, height: 0.01 }]), /too short/);
});

test("editor keeps forms interactive unless flattening is explicitly chosen", async () => {
  const source = await PDFDocument.create();
  const page = source.addPage([360, 480]);
  const field = source.getForm().createTextField("customer");
  field.setText("Alice Example");
  field.addToPage(page, { x: 40, y: 300, width: 240, height: 25 });
  const file = new File([await source.save()], "form.pdf");
  const interactive = await PDFDocument.load(await (await editPdf(file, [])).arrayBuffer());
  assert.equal(interactive.getForm().getTextField("customer").getText(), "Alice Example");
  const flattened = await PDFDocument.load(await (await editPdf(file, [], true)).arrayBuffer());
  assert.equal(flattened.getForm().getFields().length, 0);
});
