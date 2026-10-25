import { useEffect, useMemo, useState } from "react";
import { adjustCanvas } from "@/lib/pdf/brightness";
import { PageNavigation } from "./PdfPreview";
import { usePdfPreview } from "./usePdfPreview";

export function BrightnessOptions({
  file,
  options,
  onChange,
  onReady,
}: {
  file?: File;
  options: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
  onReady: (ready: boolean) => void;
}) {
  const [page, setPage] = useState(1);
  const { rendered, count, loading, error } = usePdfPreview(file, page);
  const brightness = Number(options.brightness || 0);
  const contrast = Number(options.contrast || 0);
  useEffect(() => {
    setPage(1);
  }, [file]);
  useEffect(() => {
    onReady(!!rendered && !loading && !error);
  }, [rendered, loading, error, onReady]);
  const before = useMemo(() => rendered?.canvas.toDataURL("image/png"), [rendered]);
  const after = useMemo(() => {
    if (!rendered) return undefined;
    const copy = document.createElement("canvas");
    copy.width = rendered.canvas.width;
    copy.height = rendered.canvas.height;
    copy.getContext("2d")!.drawImage(rendered.canvas, 0, 0);
    adjustCanvas(copy, brightness, contrast);
    const image = copy.toDataURL("image/png");
    copy.width = copy.height = 0;
    return image;
  }, [rendered, brightness, contrast]);
  return (
    <div className="mt-6 space-y-5">
      <p className="rounded-lg border border-border bg-section p-4 text-sm">
        All pages will be rasterized into images at 144 dpi. Selectable text, links and interactive
        forms will be lost. Keep your original PDF.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        {(["brightness", "contrast"] as const).map((name) => (
          <label key={name} className="text-sm font-semibold">
            {name === "brightness" ? "Brightness" : "Contrast"}:{" "}
            <output>{options[name] || "0"}</output>
            <input
              aria-label={name === "brightness" ? "Brightness" : "Contrast"}
              type="range"
              min="-100"
              max="100"
              step="1"
              value={options[name] || "0"}
              onChange={(event) => onChange({ ...options, [name]: event.target.value })}
              className="mt-3 w-full accent-primary"
            />
          </label>
        ))}
      </div>
      {loading && <p role="status">Loading page preview…</p>}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {count > 0 && (
        <PageNavigation page={page} count={count} setPage={setPage} disabled={loading} />
      )}
      {before && after && !loading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">Before</figcaption>
            <img
              src={before}
              alt={`Before adjustment, page ${page}`}
              className="w-full rounded-lg border border-border"
            />
          </figure>
          <figure>
            <figcaption className="mb-2 text-sm font-semibold">After</figcaption>
            <img
              src={after}
              alt={`After adjustment, page ${page}`}
              className="w-full rounded-lg border border-border"
            />
          </figure>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        These settings apply to every page. Use Previous page and Next page to check the result.
      </p>
    </div>
  );
}
