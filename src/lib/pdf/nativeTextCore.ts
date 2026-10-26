import { PDFDocument } from "pdf-lib";
import type { WrappedPdfiumModule } from "@embedpdf/pdfium";
import { displayGeometry } from "./editorGeometry.ts";

export type NativeText = {
  id: string;
  page: number;
  index: number;
  text: string;
  font: string;
  embedded: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  supported: boolean;
  reason: string;
};
export type TextEdit = {
  id: string;
  original: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
};
export type NativeInspection = { items: NativeText[]; pageTextCounts: number[]; limited: boolean };

function fail(message: string): never {
  throw new Error(message);
}
const standard =
  /^(Helvetica|Times-(Roman|Bold|Italic|BoldItalic)|Courier)(-Bold|-Oblique|-BoldOblique)?$/;

export async function nativeTextJob(
  lib: WrappedPdfiumModule,
  bytes: Uint8Array,
  edits?: TextEdit[],
): Promise<NativeInspection | Uint8Array> {
  const geometryDocument = await PDFDocument.load(bytes, { updateMetadata: false });
  if (
    edits &&
    (!Array.isArray(edits) ||
      edits.length > 1000 ||
      edits.some((edit) => !edit || typeof edit.id !== "string") ||
      new Set(edits.map((e) => e.id)).size !== edits.length)
  )
    fail("Invalid existing-text edits.");
  const m = lib.pdfium as typeof lib.pdfium & {
    HEAPU8: Uint8Array;
    HEAPU32: Uint32Array;
    HEAPF32: Float32Array;
  };
  const alloc = (n: number) => m.wasmExports.malloc(n);
  const free = (p: number) => m.wasmExports.free(p);
  const buffer = alloc(bytes.length);
  m.HEAPU8.set(bytes, buffer);
  const document = lib.FPDF_LoadMemDocument(buffer, bytes.length, "");
  if (!document) {
    m.HEAPU8.fill(0, buffer, buffer + bytes.length);
    free(buffer);
    fail("This PDF cannot be opened for text editing. Unlock supported protected files first.");
  }
  const items: NativeText[] = [],
    pageTextCounts: number[] = [];
  const handled = new Set<string>();
  let limited = false;
  const floats = (size: number, call: (p: number) => boolean) => {
    const p = alloc(size * 4);
    try {
      if (!call(p)) fail("Could not read PDF text geometry.");
      return Array.from(m.HEAPF32.subarray(p / 4, p / 4 + size));
    } finally {
      free(p);
    }
  };
  const textOf = (object: number, textPage: number): string => {
    const size = lib.FPDFTextObj_GetText(object, textPage, 0, 0);
    if (!size || size > 100000) return "";
    const p = alloc(size);
    try {
      lib.FPDFTextObj_GetText(object, textPage, p, size);
      return String(m.UTF16ToString(p));
    } finally {
      free(p);
    }
  };
  const boundsOf = (object: number) =>
    floats(4, (p) => lib.FPDFPageObj_GetBounds(object, p, p + 4, p + 8, p + 12));
  try {
    for (let number = 1; number <= lib.FPDF_GetPageCount(document); number++) {
      const source = geometryDocument.getPage(number - 1);
      const g = displayGeometry(source.getCropBox(), source.getRotation().angle);
      const [a, b, c, d, e, f] = g.matrix;
      const point = (x: number, y: number) => ({
        x: (d * (x - e) - c * (y - f)) / (a * d - b * c),
        y: (-b * (x - e) + a * (y - f)) / (a * d - b * c),
      });
      const box = (bounds: number[]) => {
        const points = [point(bounds[0], bounds[1]), point(bounds[2], bounds[3])];
        return {
          x: Math.min(...points.map((p) => p.x)) / g.width,
          y: 1 - Math.max(...points.map((p) => p.y)) / g.height,
          width: Math.abs(points[0].x - points[1].x) / g.width,
          height: Math.abs(points[0].y - points[1].y) / g.height,
        };
      };
      const page = lib.FPDF_LoadPage(document, number - 1);
      if (!page) fail("A PDF page could not be opened.");
      const textPage = lib.FPDFText_LoadPage(page);
      try {
        pageTextCounts.push(lib.FPDFText_CountChars(textPage));
        const count = lib.FPDFPage_CountObjects(page);
        const objects = Array.from({ length: Math.min(count, 2000) }, (_, i) =>
          lib.FPDFPage_GetObject(page, i),
        );
        if (count > 2000) limited = true;
        let dirty = false;
        for (let index = 0; index < objects.length; index++) {
          const object = objects[index];
          if (lib.FPDFPageObj_GetType(object) !== 1) continue;
          const text = textOf(object, textPage);
          if (!text.trim()) continue;
          const font = lib.FPDFTextObj_GetFont(object);
          const nameSize = lib.FPDFFont_GetBaseFontName(font, 0, 0);
          if (nameSize > 4096) fail("Font metadata is too large for safe text analysis.");
          let fontName = "Unknown";
          if (nameSize > 0) {
            const namePtr = alloc(nameSize);
            try {
              m.HEAPU8.fill(0, namePtr, namePtr + nameSize);
              lib.FPDFFont_GetBaseFontName(font, namePtr, nameSize);
              fontName = String(m.UTF8ToString(namePtr, nameSize));
            } finally {
              free(namePtr);
            }
          }
          const embedded = lib.FPDFFont_GetIsEmbedded(font) === 1;
          const matrix = floats(6, (p) => lib.FPDFPageObj_GetMatrix(object, p));
          const rawSize = floats(1, (p) => lib.FPDFTextObj_GetFontSize(object, p))[0];
          const bounds = boundsOf(object),
            rect = box(bounds);
          const colorPtr = alloc(16);
          m.HEAPU32.fill(0, colorPtr / 4, colorPtr / 4 + 4);
          let color = "#000000",
            alpha = 255,
            colorKnown = false;
          try {
            if (
              lib.FPDFPageObj_GetFillColor(
                object,
                colorPtr,
                colorPtr + 4,
                colorPtr + 8,
                colorPtr + 12,
              )
            ) {
              colorKnown = true;
              alpha = m.HEAPU32[colorPtr / 4 + 3];
              color =
                "#" +
                Array.from(m.HEAPU32.subarray(colorPtr / 4, colorPtr / 4 + 3))
                  .map((v) => v.toString(16).padStart(2, "0"))
                  .join("");
            }
          } finally {
            free(colorPtr);
          }
          let reason =
            !nameSize || !colorKnown
              ? "Font or color information could not be inspected safely."
              : "";
          const clip = lib.FPDFPageObj_GetClipPath(object);
          if (clip && lib.FPDFClipPath_CountPaths(clip) > 0)
            reason = "Clipped text is not supported for replacement.";
          if (alpha !== 255) reason = "Transparent text is not supported for replacement.";
          if (
            text.length > 500 ||
            Array.from(text).some((character) => {
              const code = character.charCodeAt(0);
              return code < 32 || (code >= 127 && code <= 159);
            })
          )
            reason =
              "Complex or multiline text object; use the source document or an added text box.";
          else if (
            Math.abs(matrix[1]) > 0.0001 ||
            Math.abs(matrix[2]) > 0.0001 ||
            matrix[0] <= 0 ||
            matrix[3] <= 0 ||
            Math.abs(matrix[0] - matrix[3]) > 0.001
          )
            reason =
              "Rotated, skewed or stretched text inside the page is not supported for replacement.";
          else if (lib.FPDFTextObj_GetTextRenderMode(object) !== 0)
            reason = "Invisible, stroked or clipping text is not supported for replacement.";
          else if (!embedded && !standard.test(fontName))
            reason = "This font encoding is not supported for replacement.";
          else if (
            rect.x < 0 ||
            rect.y < 0 ||
            rect.x + rect.width > 1.001 ||
            rect.y + rect.height > 1.001 ||
            rect.width <= 0 ||
            rect.height <= 0
          )
            reason = "Text crosses the visible page boundary.";
          const item: NativeText = {
            id: `${number}:${index}`,
            page: number,
            index,
            text,
            font: fontName,
            embedded,
            ...rect,
            fontSize: rawSize * matrix[0],
            color,
            supported: !reason,
            reason,
          };
          items.push(item);
          const edit = edits?.find((edit) => edit.id === item.id);
          if (!edit) continue;
          handled.add(item.id);
          if (reason || edit.original !== text)
            fail(reason || "The selected text no longer matches the original PDF.");
          if (
            typeof edit.text !== "string" ||
            edit.text.length > 500 ||
            /[^\x20-\x7e]/.test(edit.text) ||
            ![edit.x, edit.y, edit.fontSize].every(Number.isFinite) ||
            edit.x < 0 ||
            edit.y < 0 ||
            edit.x > 1 ||
            edit.y > 1 ||
            edit.fontSize < 6 ||
            edit.fontSize > 96 ||
            !/^#[0-9a-f]{6}$/i.test(edit.color)
          )
            fail(
              "Use a single line of basic Latin text, a valid position, color and size (6–96 pt).",
            );
          if (embedded && [...edit.text].some((character) => !text.includes(character)))
            fail(
              "This embedded font can only reuse characters already present in the selected text. Use the original application for new characters.",
            );
          if (!edit.text) {
            if (!lib.FPDFPage_RemoveObject(page, object))
              fail("This text object could not be deleted.");
            lib.FPDFPageObj_Destroy(object);
            dirty = true;
            continue;
          }
          const str = alloc((edit.text.length + 1) * 2);
          try {
            m.stringToUTF16(edit.text, str, (edit.text.length + 1) * 2);
            if (!lib.FPDFText_SetText(object, str))
              fail("The existing font could not encode this replacement.");
          } finally {
            free(str);
          }
          const verificationPage = lib.FPDFText_LoadPage(page);
          try {
            if (textOf(object, verificationPage) !== edit.text)
              fail(
                "The existing font cannot reliably represent this replacement. No edited file was saved.",
              );
          } finally {
            lib.FPDFText_ClosePage(verificationPage);
          }
          const ratio = edit.fontSize / item.fontSize;
          const mp = alloc(24);
          try {
            m.HEAPF32.set(
              [
                matrix[0] * ratio,
                matrix[1] * ratio,
                matrix[2] * ratio,
                matrix[3] * ratio,
                matrix[4],
                matrix[5],
              ],
              mp / 4,
            );
            if (!lib.FPDFPageObj_SetMatrix(object, mp)) fail("The text size could not be changed.");
          } finally {
            free(mp);
          }
          const resizedBounds = boundsOf(object);
          const resized = box(resizedBounds);
          if (resizedBounds[2] - resizedBounds[0] > bounds[2] - bounds[0] + 0.5)
            fail(
              "Replacement is wider than the original text box. Use fewer characters or reduce the font size.",
            );
          const dx = (edit.x - resized.x) * g.width,
            dy = -(edit.y - resized.y) * g.height;
          lib.FPDFPageObj_Transform(object, 1, 0, 0, 1, a * dx + c * dy, b * dx + d * dy);
          const final = box(boundsOf(object));
          if (
            final.x < -0.001 ||
            final.y < -0.001 ||
            final.x + final.width > 1.001 ||
            final.y + final.height > 1.001
          )
            fail("Keep the edited text inside the visible page.");
          const hex = edit.color.slice(1);
          if (
            edit.color.toLowerCase() !== item.color.toLowerCase() &&
            !lib.FPDFPageObj_SetFillColor(
              object,
              parseInt(hex.slice(0, 2), 16),
              parseInt(hex.slice(2, 4), 16),
              parseInt(hex.slice(4, 6), 16),
              255,
            )
          )
            fail("The text color could not be changed.");
          dirty = true;
        }
        if (dirty && !lib.FPDFPage_GenerateContent(page))
          fail("The edited page could not be regenerated.");
      } finally {
        if (textPage) lib.FPDFText_ClosePage(textPage);
        lib.FPDF_ClosePage(page);
      }
    }
    if (!edits) return { items, pageTextCounts, limited };
    if (handled.size !== edits.length)
      fail("An existing-text edit refers to an unsupported or missing object.");
    const writer = lib.PDFiumExt_OpenFileWriter();
    try {
      if (!lib.FPDF_SaveAsCopy(document, writer, 2)) fail("The edited PDF could not be saved.");
      const size = lib.PDFiumExt_GetFileWriterSize(writer),
        p = alloc(size);
      try {
        if (lib.PDFiumExt_GetFileWriterData(writer, p, size) !== size)
          fail("Incomplete PDF output.");
        return m.HEAPU8.slice(p, p + size);
      } finally {
        free(p);
      }
    } finally {
      lib.PDFiumExt_CloseFileWriter(writer);
    }
  } finally {
    lib.FPDF_CloseDocument(document);
    m.HEAPU8.fill(0, buffer, buffer + bytes.length);
    free(buffer);
  }
}
