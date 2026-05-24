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

export type RunResult = { blob: Blob; filename: string };

export async function runTool(
  tool: Tool,
  files: File[],
  options: Record<string, string>,
): Promise<RunResult> {
  const base = files[0]?.name?.replace(/\.[^.]+$/, "") ?? "document";
  switch (tool.slug) {
    case "merge-pdf":
      return { blob: await mergePdfs(files), filename: "merged.pdf" };
    case "split-pdf":
      return { blob: await splitPdf(files[0], options.ranges ?? ""), filename: `${base}-split.pdf` };
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
      const angle = (parseInt(options.angle ?? "90", 10) as 90 | 180 | 270) || 90;
      return { blob: await rotatePdf(files[0], angle), filename: `${base}-rotated.pdf` };
    }
    case "add-page-numbers-to-pdf":
      return {
        blob: await addPageNumbers(files[0], {
          position: (options.position as PageNumberPosition) ?? "bottom-center",
          fontSize: parseInt(options.fontSize ?? "12", 10) || 12,
        }),
        filename: `${base}-numbered.pdf`,
      };
    case "add-text-to-pdf":
      return {
        blob: await addTextToPdf(files[0], {
          text: options.text ?? "",
          page: parseInt(options.page ?? "1", 10) || 1,
          x: parseInt(options.x ?? "50", 10) || 50,
          y: parseInt(options.y ?? "50", 10) || 50,
          fontSize: parseInt(options.fontSize ?? "16", 10) || 16,
        }),
        filename: `${base}-text.pdf`,
      };
    case "add-blank-page-to-pdf":
      return {
        blob: await addBlankPage(files[0], {
          position: parseInt(options.position ?? "0", 10) || 0,
        }),
        filename: `${base}-blank.pdf`,
      };
    case "add-margin-to-pdf":
      return {
        blob: await addMargin(files[0], parseInt(options.margin ?? "36", 10) || 36),
        filename: `${base}-margin.pdf`,
      };
    case "watermark-pdf":
      return {
        blob: await watermarkPdf(files[0], {
          text: options.text ?? "WATERMARK",
          opacity: parseFloat(options.opacity ?? "0.25") || 0.25,
          fontSize: parseInt(options.fontSize ?? "60", 10) || 60,
        }),
        filename: `${base}-watermarked.pdf`,
      };
    default:
      throw new Error("This tool isn't implemented yet.");
  }
}
