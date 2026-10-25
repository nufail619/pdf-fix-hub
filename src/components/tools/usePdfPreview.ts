import { useEffect, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { openPdf, renderPage } from "@/lib/pdf/pdfjs";

export function usePdfPreview(file: File | undefined, page: number) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [rendered, setRendered] = useState<{
    canvas: HTMLCanvasElement;
    widthPt: number;
    heightPt: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let pdf: PDFDocumentProxy | undefined;
    setDocument(null);
    setRendered(null);
    setError("");
    if (file) {
      setLoading(true);
      openPdf(file)
        .then(async (value) => {
          pdf = value;
          if (cancelled) await value.destroy();
          else setDocument(value);
        })
        .catch((error: Error) => {
          if (!cancelled) {
            setError(error.message);
            setLoading(false);
          }
        });
    } else setLoading(false);
    return () => {
      cancelled = true;
      void pdf?.destroy();
    };
  }, [file]);
  useEffect(() => {
    if (!document) return;
    let cancelled = false;
    let canvas: HTMLCanvasElement | undefined;
    setLoading(true);
    setRendered(null);
    setError("");
    (async () => {
      const source = await document.getPage(Math.min(page, document.numPages));
      const viewport = source.getViewport({ scale: 1 });
      const scale = Math.min(1.5, 1200 / Math.max(viewport.width, viewport.height));
      const value = await renderPage(document, Math.min(page, document.numPages), scale);
      canvas = value.canvas;
      if (cancelled) canvas.width = canvas.height = 0;
      else setRendered(value);
    })()
      .catch((error: Error) => {
        if (!cancelled) setError(error.message || "Page preview could not load.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (canvas) canvas.width = canvas.height = 0;
    };
  }, [document, page]);
  return { rendered, count: document?.numPages || 0, loading, error };
}

export const controlClass =
  "h-11 w-full min-w-0 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
