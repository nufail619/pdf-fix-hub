import {
  PDFDocument,
  StandardFonts,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
} from "pdf-lib";

export type Overlay = {
  id: string;
  page: number;
  kind: "text" | "rectangle" | "ellipse" | "highlight" | "whiteout";
  /** Fractions of the displayed CropBox, measured from the top left. */
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize: number;
  color: string;
};

export function validateOverlays(value: unknown, pageCount: number): asserts value is Overlay[] {
  if (!Array.isArray(value) || value.length > 1000) throw new Error("Invalid editor elements.");
  for (const item of value) {
    if (
      !item ||
      !["text", "rectangle", "ellipse", "highlight", "whiteout"].includes(item.kind) ||
      typeof item.id !== "string" ||
      !Number.isInteger(item.page) ||
      item.page < 1 ||
      item.page > pageCount ||
      ![item.x, item.y, item.width, item.height].every(
        (v: number) => Number.isFinite(v) && v >= 0 && v <= 1,
      ) ||
      item.width === 0 ||
      item.height === 0 ||
      item.x + item.width > 1.00001 ||
      item.y + item.height > 1.00001 ||
      !Number.isFinite(item.fontSize) ||
      item.fontSize < 6 ||
      item.fontSize > 96 ||
      typeof item.text !== "string" ||
      item.text.length > 500 ||
      !/^#[0-9a-f]{6}$/i.test(item.color)
    )
      throw new Error("Invalid editor element. Keep elements inside a valid page.");
  }
}

/** Map display coordinates to PDF coordinates, including cropped/rotated pages. */
export function displayGeometry(
  crop: { x: number; y: number; width: number; height: number },
  rotation: number,
) {
  const { x, y, width: w, height: h } = crop;
  const angle = ((rotation % 360) + 360) % 360;
  const matrices: Record<number, [number, number, number, number, number, number]> = {
    0: [1, 0, 0, 1, x, y],
    90: [0, 1, -1, 0, x + w, y],
    180: [-1, 0, 0, -1, x + w, y + h],
    270: [0, -1, 1, 0, x, y + h],
  };
  if (!matrices[angle]) throw new Error("Unsupported page rotation.");
  return { width: angle % 180 ? h : w, height: angle % 180 ? w : h, matrix: matrices[angle] };
}

export async function editPdf(file: File, elements: unknown, flattenForms = false) {
  const document = await PDFDocument.load(await file.arrayBuffer());
  validateOverlays(elements, document.getPageCount());
  if (flattenForms) document.getForm().flatten();
  const font = await document.embedFont(StandardFonts.Helvetica);
  for (const element of elements) {
    const page = document.getPage(element.page - 1);
    const { width, height, matrix } = displayGeometry(page.getCropBox(), page.getRotation().angle);
    const x = element.x * width;
    const y = (1 - element.y - element.height) * height;
    const w = element.width * width;
    const h = element.height * height;
    const hex = element.color.slice(1);
    const color = rgb(
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
    );
    page.pushOperators(pushGraphicsState(), concatTransformationMatrix(...matrix));
    if (element.kind === "text") {
      try {
        font.encodeText(element.text);
      } catch {
        throw new Error(
          "Added text supports Latin characters. Replace unsupported characters and try again.",
        );
      }
      if (font.widthOfTextAtSize(element.text, element.fontSize) > w + 0.1)
        throw new Error(
          "Added text is too wide. Use fewer characters, a smaller font, or a wider element.",
        );
      if (element.fontSize > h + 0.1)
        throw new Error(
          "The text element is too short. Increase its height or reduce the text size.",
        );
      page.drawText(element.text, {
        x,
        y: (1 - element.y) * height - element.fontSize,
        font,
        size: element.fontSize,
        color,
        lineHeight: element.fontSize,
      });
    } else if (element.kind === "ellipse") {
      page.drawEllipse({
        x: x + w / 2,
        y: y + h / 2,
        xScale: w / 2,
        yScale: h / 2,
        borderColor: color,
        borderWidth: 2,
      });
    } else {
      const fill = element.kind === "whiteout" ? rgb(1, 1, 1) : color;
      page.drawRectangle({
        x,
        y,
        width: w,
        height: h,
        ...(element.kind === "rectangle"
          ? { borderColor: color, borderWidth: 2 }
          : { color: fill }),
        opacity: element.kind === "highlight" ? 0.35 : 1,
      });
    }
    page.pushOperators(popGraphicsState());
  }
  return new Blob([(await document.save()) as BlobPart], { type: "application/pdf" });
}
