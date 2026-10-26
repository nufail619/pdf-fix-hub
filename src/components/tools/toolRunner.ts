import type { Tool } from "@/data/tools";
import { mergePdfs } from "@/lib/pdf/merge";
import { splitPdf } from "@/lib/pdf/split";
import { imagesToPdf } from "@/lib/pdf/imagesToPdf";
import { extractPages } from "@/lib/pdf/extractPages";
import { removePages } from "@/lib/pdf/removePages";
import { reorderPages } from "@/lib/pdf/reorderPages";
import { rotatePdf } from "@/lib/pdf/rotate";
import { addPageNumbers, type PageNumberPosition } from "@/lib/pdf/pageNumbers";
import { addTextToPdf } from "@/lib/pdf/addText";
import { addBlankPage } from "@/lib/pdf/addBlankPage";
import { addMargin } from "@/lib/pdf/addMargin";
import { watermarkPdf } from "@/lib/pdf/watermark";
import { compressPdf, type CompressLevel } from "@/lib/pdf/compress";
import { pdfToImages } from "@/lib/pdf/pdfToImages";
import { pdfToText } from "@/lib/pdf/pdfToText";
import { flattenPdf } from "@/lib/pdf/flatten";
import { cropPdf } from "@/lib/pdf/crop";
import { editMetadata } from "@/lib/pdf/metadata";
import { rasterizePdf } from "@/lib/pdf/rasterize";
import { wordToPdf } from "@/lib/pdf/wordToPdf";
import { adjustBrightness } from "@/lib/pdf/brightness";
import { editPdf } from "@/lib/pdf/edit";
import { unlockPdf } from "@/lib/pdf/unlock";

export type RunResult = { blob: Blob; filename: string; note?: string };

export async function runTool(
  tool: Tool,
  files: File[],
  options: Record<string, string>,
): Promise<RunResult> {
  const numberOption = (
    key: string,
    fallback: number,
    min: number,
    max = Infinity,
    integer = true,
  ) => {
    const raw = options[key];
    const value = raw === undefined ? fallback : Number(raw);
    if (
      raw?.trim() === "" ||
      !Number.isFinite(value) ||
      value < min ||
      value > max ||
      (integer && !Number.isInteger(value))
    ) {
      throw new Error(
        `Enter a valid ${key} between ${min} and ${Number.isFinite(max) ? max : "the supported maximum"}.`,
      );
    }
    return value;
  };
  const base = files[0]?.name?.replace(/\.[^.]+$/, "") ?? "document";
  switch (tool.slug) {
    case "adjust-pdf-brightness":
      return {
        blob: await adjustBrightness(
          files[0],
          numberOption("brightness", 0, -100, 100),
          numberOption("contrast", 0, -100, 100),
        ),
        filename: `${base}-adjusted.pdf`,
        note: "All pages were rasterized at 144 dpi. Text is no longer selectable and interactive content is flattened. Keep the original PDF.",
      };
    case "edit-pdf":
      return {
        blob: await editPdf(
          files[0],
          JSON.parse(options.elements || "[]"),
          options.flattenForms === "true",
          JSON.parse(options.textEdits || "[]"),
        ),
        filename: `${base}-edited.pdf`,
        note: "Supported existing-text edits replace actual text objects. Added elements are overlays. Whiteout is not secure redaction. Keep the original and review every edited page.",
      };
    case "unlock-pdf":
      return {
        blob: await unlockPdf(files[0], options.password || "", options.authorized === "true"),
        filename: `${base}-unlocked.pdf`,
        note: "Password protection has been removed from this copy. Store and share it carefully. The password was not saved or uploaded.",
      };
    case "merge-pdf":
      return { blob: await mergePdfs(files), filename: "merged.pdf" };
    case "split-pdf": {
      const res = await splitPdf(files[0], options.ranges ?? "", "multiple");
      if (Array.isArray(res)) {
        // This shouldn't happen with my new implementation as it zips inside splitPdf if multiple
        return res[0]; // Fallback
      }
      return res;
    }
    case "jpg-to-pdf":
      return { blob: await imagesToPdf(files, "jpg"), filename: "images.pdf" };
    case "png-to-pdf":
      return { blob: await imagesToPdf(files, "png"), filename: "images.pdf" };
    case "extract-pdf-pages":
      return {
        blob: await extractPages(files[0], options.ranges ?? ""),
        filename: `${base}-extracted.pdf`,
      };
    case "remove-pdf-pages":
      return {
        blob: await removePages(files[0], options.ranges ?? ""),
        filename: `${base}-trimmed.pdf`,
      };
    case "reorder-pdf-pages":
      return {
        blob: await reorderPages(files[0], options.order ?? ""),
        filename: `${base}-reordered.pdf`,
      };
    case "rotate-pdf": {
      const angle = numberOption("angle", 90, 90, 270) as 90 | 180 | 270;
      return { blob: await rotatePdf(files[0], angle), filename: `${base}-rotated.pdf` };
    }
    case "add-page-numbers-to-pdf":
      return {
        blob: await addPageNumbers(files[0], {
          position: (options.position as PageNumberPosition) ?? "bottom-center",
          fontSize: numberOption("fontSize", 12, 1, 500),
        }),
        filename: `${base}-numbered.pdf`,
      };
    case "add-text-to-pdf":
      return {
        blob: await addTextToPdf(files[0], {
          text: options.text ?? "",
          page: numberOption("page", 1, 1),
          x: numberOption("x", 50, 0, Infinity, false),
          y: numberOption("y", 50, 0, Infinity, false),
          fontSize: numberOption("fontSize", 16, 1, 500),
        }),
        filename: `${base}-text.pdf`,
      };
    case "add-blank-page-to-pdf":
      return {
        blob: await addBlankPage(files[0], {
          position: numberOption("position", 0, 0),
        }),
        filename: `${base}-blank.pdf`,
      };
    case "add-margin-to-pdf":
      return {
        blob: await addMargin(files[0], numberOption("margin", 36, 0, 500, false)),
        filename: `${base}-margin.pdf`,
      };
    case "watermark-pdf":
      return {
        blob: await watermarkPdf(files[0], {
          text: options.text ?? "WATERMARK",
          opacity: numberOption("opacity", 0.25, 0, 1, false),
          fontSize: numberOption("fontSize", 60, 1, 500),
        }),
        filename: `${base}-watermarked.pdf`,
      };
    case "compress-pdf": {
      const level = (options.level as CompressLevel) ?? "recommended";
      const { blob, note } = await compressPdf(files[0], level);
      return { blob, note, filename: `${base}-compressed.pdf` };
    }
    case "pdf-to-jpg":
      return pdfToImages(files[0], "jpg", numberOption("dpi", 150, 36, 300), options.ranges ?? "");
    case "pdf-to-png":
      return pdfToImages(files[0], "png", numberOption("dpi", 150, 36, 300), options.ranges ?? "");
    case "pdf-to-text":
      return { blob: await pdfToText(files[0]), filename: `${base}.txt` };
    case "word-to-pdf": {
      const { blob, note } = await wordToPdf(files[0]);
      return { blob, note, filename: `${base}.pdf` };
    }
    case "flatten-pdf": {
      const { blob, note } = await flattenPdf(files[0], options.mode === "full" ? "full" : "forms");
      return { blob, note, filename: `${base}-flattened.pdf` };
    }
    case "grayscale-pdf":
      return {
        blob: await rasterizePdf(files[0], { scale: 2, quality: 0.8, grayscale: true }),
        filename: `${base}-grayscale.pdf`,
      };
    case "crop-pdf": {
      const mm = (k: string) => numberOption(k, 10, 0, 1000, false);
      return {
        blob: await cropPdf(
          files[0],
          { top: mm("top"), right: mm("right"), bottom: mm("bottom"), left: mm("left") },
          options.ranges ?? "",
        ),
        filename: `${base}-cropped.pdf`,
      };
    }
    case "edit-pdf-metadata":
      return {
        blob: await editMetadata(files[0], {
          title: options.title,
          author: options.author,
          subject: options.subject,
          keywords: options.keywords,
          clear: options.clear === "true",
        }),
        filename: `${base}.pdf`,
      };
    default:
      throw new Error("This tool isn't implemented yet.");
  }
}
