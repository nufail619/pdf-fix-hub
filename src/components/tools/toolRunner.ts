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

export type RunResult = { blob: Blob; filename: string; note?: string };

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
      return {
        blob: await splitPdf(files[0], options.ranges ?? ""),
        filename: `${base}-split.pdf`,
      };
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
    case "compress-pdf": {
      const level = (options.level as CompressLevel) ?? "recommended";
      const { blob, note } = await compressPdf(files[0], level);
      return { blob, note, filename: `${base}-compressed.pdf` };
    }
    case "pdf-to-jpg":
      return pdfToImages(
        files[0],
        "jpg",
        parseInt(options.dpi ?? "150", 10) || 150,
        options.ranges ?? "",
      );
    case "pdf-to-png":
      return pdfToImages(
        files[0],
        "png",
        parseInt(options.dpi ?? "150", 10) || 150,
        options.ranges ?? "",
      );
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
      const mm = (k: string) => parseFloat(options[k] ?? "10") || 0;
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
