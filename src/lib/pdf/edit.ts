import {
  PDFDocument,
  StandardFonts,
  rgb,
  pushGraphicsState,
  popGraphicsState,
  concatTransformationMatrix,
} from "pdf-lib";
import { nativeText } from "./nativeTextClient.ts";
import type { TextEdit } from "./nativeTextCore.ts";

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
  family?: "Helvetica" | "Times" | "Courier";
  bold?: boolean;
  italic?: boolean;
  align?: "left" | "center" | "right";
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
      (item.family !== undefined && !["Helvetica", "Times", "Courier"].includes(item.family)) ||
      (item.bold !== undefined && typeof item.bold !== "boolean") ||
      (item.italic !== undefined && typeof item.italic !== "boolean") ||
      (item.align !== undefined && !["left", "center", "right"].includes(item.align)) ||
      !/^#[0-9a-f]{6}$/i.test(item.color)
    )
      throw new Error("Invalid editor element. Keep elements inside a valid page.");
  }
}

export { displayGeometry } from "./editorGeometry.ts";
import { displayGeometry } from "./editorGeometry.ts";

export async function editPdf(
  file: File,
  elements: unknown,
  flattenForms = false,
  textEdits: TextEdit[] = [],
) {
  const bytes = textEdits.length
    ? ((await nativeText(file, textEdits)) as Uint8Array)
    : await file.arrayBuffer();
  const document = await PDFDocument.load(bytes);
  validateOverlays(elements, document.getPageCount());
  if (flattenForms) document.getForm().flatten();
  const fonts = new Map<string, Awaited<ReturnType<typeof document.embedFont>>>();
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
      const family = element.family || "Helvetica";
      const name =
        family === "Times"
          ? element.bold
            ? element.italic
              ? StandardFonts.TimesRomanBoldItalic
              : StandardFonts.TimesRomanBold
            : element.italic
              ? StandardFonts.TimesRomanItalic
              : StandardFonts.TimesRoman
          : family === "Courier"
            ? element.bold
              ? element.italic
                ? StandardFonts.CourierBoldOblique
                : StandardFonts.CourierBold
              : element.italic
                ? StandardFonts.CourierOblique
                : StandardFonts.Courier
            : element.bold
              ? element.italic
                ? StandardFonts.HelveticaBoldOblique
                : StandardFonts.HelveticaBold
              : element.italic
                ? StandardFonts.HelveticaOblique
                : StandardFonts.Helvetica;
      if (!fonts.has(name)) fonts.set(name, await document.embedFont(name));
      const font = fonts.get(name)!;
      const lines = element.text.split(/\r?\n/);
      try {
        lines.forEach((line) => font.encodeText(line));
      } catch {
        throw new Error(
          "Added text supports Latin characters. Replace unsupported characters and try again.",
        );
      }
      if (lines.some((line) => font.widthOfTextAtSize(line, element.fontSize) > w + 0.1))
        throw new Error(
          "Added text is too wide. Use fewer characters, a smaller font, or a wider element.",
        );
      if (element.fontSize * (1 + (lines.length - 1) * 1.2) > h + 0.1)
        throw new Error(
          "The text element is too short. Increase its height or reduce the text size.",
        );
      lines.forEach((line, index) => {
        const textWidth = font.widthOfTextAtSize(line, element.fontSize);
        page.drawText(line, {
          x:
            x +
            (element.align === "center"
              ? (w - textWidth) / 2
              : element.align === "right"
                ? w - textWidth
                : 0),
          y: (1 - element.y) * height - element.fontSize - index * element.fontSize * 1.2,
          font,
          size: element.fontSize,
          color,
        });
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
