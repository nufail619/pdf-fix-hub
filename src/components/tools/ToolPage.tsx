import { useEffect, useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronRight, ShieldCheck } from "lucide-react";
import { ACCENT_CLASSES, tools, toolBySlug } from "@/data/tools";
import { Icon } from "@/components/common/Icon";
import { Button } from "@/components/common/Button";
import { FileUpload } from "./FileUpload";
import { ResultPanel } from "./ResultPanel";
import { ToolCard } from "@/components/home/ToolCard";
import { runTool } from "./toolRunner";
import { readMetadata } from "@/lib/pdf/metadata";
import { ToolContent } from "./ToolContent";
import { BrightnessOptions } from "./BrightnessOptions";
import { PdfEditor } from "./PdfEditor";
import { UnlockOptions } from "./UnlockOptions";
import { serializeStructuredData } from "@/lib/structured-data";
import { defaultSiteConfig } from "@/context/SiteConfigContext";

export function ToolPage({ slug, children }: { slug: string; children?: React.ReactNode }) {
  const tool = toolBySlug(slug)!;
  const accent = ACCENT_CLASSES[tool.accent];

  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [processingError, setProcessingError] = useState("");
  const [result, setResult] = useState<{ blob: Blob; filename: string; note?: string } | null>(
    null,
  );

  useEffect(() => {
    setFiles([]);
    setOptions({});
    setResult(null);
    setProcessingError("");
    setWorkspaceReady(false);
  }, [slug]);

  // Edit-metadata: pre-fill the form with the file's current values.
  useEffect(() => {
    if (slug !== "edit-pdf-metadata" || !files[0]) return;
    let ignore = false;
    readMetadata(files[0])
      .then((m) => !ignore && setOptions(m))
      .catch(() => undefined);
    return () => {
      ignore = true;
    };
  }, [slug, files]);

  async function handleProcess() {
    if (files.length === 0) {
      toast.error("Please add at least one file.");
      return;
    }
    setBusy(true);
    setProcessingError("");
    try {
      const res = await runTool(tool, files, options);
      setResult(res);
      toast.success("Done! Your file is ready to download.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setProcessingError(message);
      toast.error(message);
    } finally {
      setBusy(false);
      if (slug === "unlock-pdf") setOptions((previous) => ({ ...previous, password: "" }));
    }
  }

  const related = tool.related
    .map((s) => tools.find((t) => t.slug === s))
    .filter(Boolean)
    .slice(0, 3) as typeof tools;

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareApplication",
                name: tool.name,
                description: tool.description,
                url: `${defaultSiteConfig.siteUrl}/${tool.slug}`,
                applicationCategory: "UtilitiesApplication",
                operatingSystem: "Web browser",
                offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: defaultSiteConfig.siteUrl + "/",
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: tool.name,
                    item: `${defaultSiteConfig.siteUrl}/${tool.slug}`,
                  },
                ],
              },
            ],
          }),
        }}
      />
      <div className="bg-section py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-muted-foreground">
            <ol className="flex items-center gap-1">
              <li>
                <Link to="/" className="hover:text-primary">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="h-4 w-4" aria-hidden />
              </li>
              <li className="font-medium text-foreground">{tool.name}</li>
            </ol>
          </nav>
          <div className="flex items-start gap-4">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${accent.bg} ${accent.fg}`}
            >
              <Icon name={tool.icon} className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">{tool.name}</h1>
              <p className="mt-2 text-muted-foreground">{tool.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div data-clarity-mask="true" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {result ? (
          <ResultPanel
            blob={result.blob}
            filename={result.filename}
            note={result.note}
            onReset={() => {
              setResult(null);
              setFiles([]);
            }}
          />
        ) : (
          <>
            <fieldset disabled={busy} className="min-w-0">
              <FileUpload
                accepts={tool.accepts}
                multiple={tool.multiple}
                files={files}
                onChange={(next) => {
                  setFiles(next);
                  setProcessingError("");
                  setWorkspaceReady(false);
                  if (["adjust-pdf-brightness", "edit-pdf", "unlock-pdf"].includes(slug))
                    setOptions({});
                }}
              />
              {slug === "adjust-pdf-brightness" ? (
                <BrightnessOptions
                  file={files[0]}
                  options={options}
                  onChange={setOptions}
                  onReady={setWorkspaceReady}
                />
              ) : slug === "edit-pdf" ? (
                <PdfEditor
                  file={files[0]}
                  options={options}
                  onChange={setOptions}
                  onReady={setWorkspaceReady}
                />
              ) : slug === "unlock-pdf" ? (
                <UnlockOptions options={options} onChange={setOptions} />
              ) : (
                <ToolOptions slug={tool.slug} options={options} setOptions={setOptions} />
              )}
              {processingError &&
                ["adjust-pdf-brightness", "edit-pdf", "unlock-pdf"].includes(slug) && (
                  <p role="alert" className="mt-4 text-sm text-red-700">
                    {processingError}
                  </p>
                )}
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={handleProcess}
                  loading={busy}
                  disabled={
                    busy ||
                    (["adjust-pdf-brightness", "edit-pdf"].includes(slug) && !workspaceReady)
                  }
                >
                  Process
                </Button>
              </div>
            </fieldset>
            {busy && (
              <p role="status" className="mt-3 text-center text-sm">
                Processing your PDF locally. Please keep this page open…
              </p>
            )}
            <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden />
              Processed locally in your browser — your files never leave your device.
            </p>
          </>
        )}

        <div className="mt-16">{children ?? <ToolContent slug={tool.slug} />}</div>
      </div>

      <section className="bg-section py-16">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold">Related tools</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {related.map((t) => (
              <ToolCard key={t.slug} tool={t} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ToolOptions({
  slug,
  options,
  setOptions,
}: {
  slug: string;
  options: Record<string, string>;
  setOptions: (next: Record<string, string>) => void;
}) {
  const optionId = useId();
  const set = (k: string, v: string) => setOptions({ ...options, [k]: v });
  const input =
    "h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (slug === "split-pdf" || slug === "extract-pdf-pages" || slug === "remove-pdf-pages") {
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-1`} className="mb-2 block text-sm font-semibold">
          Page ranges (e.g. 1-3, 5, 7-9)
        </label>
        <input
          id={`${optionId}-1`}
          className={input}
          placeholder="1-3, 5"
          value={options.ranges ?? ""}
          onChange={(e) => set("ranges", e.target.value)}
        />
      </div>
    );
  }
  if (slug === "reorder-pdf-pages") {
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-2`} className="mb-2 block text-sm font-semibold">
          New page order (comma separated, e.g. 3,1,2)
        </label>
        <input
          id={`${optionId}-2`}
          className={input}
          placeholder="3,1,2"
          value={options.order ?? ""}
          onChange={(e) => set("order", e.target.value)}
        />
      </div>
    );
  }
  if (slug === "rotate-pdf") {
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-3`} className="mb-2 block text-sm font-semibold">
          Rotation
        </label>
        <select
          id={`${optionId}-3`}
          className={input}
          value={options.angle ?? "90"}
          onChange={(e) => set("angle", e.target.value)}
        >
          <option value="90">90° clockwise</option>
          <option value="180">180°</option>
          <option value="270">270° clockwise</option>
        </select>
      </div>
    );
  }
  if (slug === "add-page-numbers-to-pdf") {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${optionId}-4`} className="mb-2 block text-sm font-semibold">
            Position
          </label>
          <select
            id={`${optionId}-4`}
            className={input}
            value={options.position ?? "bottom-center"}
            onChange={(e) => set("position", e.target.value)}
          >
            <option value="bottom-center">Bottom center</option>
            <option value="bottom-right">Bottom right</option>
            <option value="bottom-left">Bottom left</option>
            <option value="top-center">Top center</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${optionId}-5`} className="mb-2 block text-sm font-semibold">
            Font size
          </label>
          <input
            id={`${optionId}-5`}
            type="number"
            className={input}
            value={options.fontSize ?? "12"}
            onChange={(e) => set("fontSize", e.target.value)}
          />
        </div>
      </div>
    );
  }
  if (slug === "add-text-to-pdf") {
    return (
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor={`${optionId}-6`} className="mb-2 block text-sm font-semibold">
            Text
          </label>
          <input
            id={`${optionId}-6`}
            className={input}
            value={options.text ?? ""}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor={`${optionId}-7`} className="mb-2 block text-sm font-semibold">
              Page
            </label>
            <input
              id={`${optionId}-7`}
              type="number"
              className={input}
              value={options.page ?? "1"}
              onChange={(e) => set("page", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${optionId}-8`} className="mb-2 block text-sm font-semibold">
              X (pt)
            </label>
            <input
              id={`${optionId}-8`}
              type="number"
              className={input}
              value={options.x ?? "50"}
              onChange={(e) => set("x", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${optionId}-9`} className="mb-2 block text-sm font-semibold">
              Y (pt)
            </label>
            <input
              id={`${optionId}-9`}
              type="number"
              className={input}
              value={options.y ?? "50"}
              onChange={(e) => set("y", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${optionId}-10`} className="mb-2 block text-sm font-semibold">
              Size
            </label>
            <input
              id={`${optionId}-10`}
              type="number"
              className={input}
              value={options.fontSize ?? "16"}
              onChange={(e) => set("fontSize", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
  if (slug === "add-blank-page-to-pdf") {
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-11`} className="mb-2 block text-sm font-semibold">
          Insert after page (0 = start)
        </label>
        <input
          id={`${optionId}-11`}
          type="number"
          className={input}
          value={options.position ?? "0"}
          onChange={(e) => set("position", e.target.value)}
        />
      </div>
    );
  }
  if (slug === "add-margin-to-pdf") {
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-12`} className="mb-2 block text-sm font-semibold">
          Margin (points)
        </label>
        <input
          id={`${optionId}-12`}
          type="number"
          className={input}
          value={options.margin ?? "36"}
          onChange={(e) => set("margin", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">1 point = 1/72 inch. 36 pt ≈ 0.5 in.</p>
      </div>
    );
  }
  if (slug === "watermark-pdf") {
    return (
      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor={`${optionId}-13`} className="mb-2 block text-sm font-semibold">
            Watermark text
          </label>
          <input
            id={`${optionId}-13`}
            className={input}
            placeholder="CONFIDENTIAL"
            value={options.text ?? ""}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${optionId}-14`} className="mb-2 block text-sm font-semibold">
              Opacity (0–1)
            </label>
            <input
              id={`${optionId}-14`}
              type="number"
              step="0.05"
              min="0"
              max="1"
              className={input}
              value={options.opacity ?? "0.25"}
              onChange={(e) => set("opacity", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor={`${optionId}-15`} className="mb-2 block text-sm font-semibold">
              Font size
            </label>
            <input
              id={`${optionId}-15`}
              type="number"
              className={input}
              value={options.fontSize ?? "60"}
              onChange={(e) => set("fontSize", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }
  if (slug === "compress-pdf") {
    const level = options.level ?? "recommended";
    const levels = [
      { v: "light", t: "Light", d: "Lossless clean-up. Text stays selectable." },
      { v: "recommended", t: "Recommended", d: "Good quality, much smaller file." },
      { v: "strong", t: "Strong", d: "Smallest file, lower image quality." },
    ];
    return (
      <fieldset className="mt-6">
        <legend className="mb-2 block text-sm font-semibold">Compression level</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {levels.map((l) => (
            <label
              key={l.v}
              className={`cursor-pointer rounded-lg border p-3 text-sm ${
                level === l.v ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="level"
                className="sr-only"
                checked={level === l.v}
                onChange={() => set("level", l.v)}
              />
              <span className="block font-semibold">{l.t}</span>
              <span className="mt-1 block text-muted-foreground">{l.d}</span>
            </label>
          ))}
        </div>
        {level !== "light" && (
          <p className="mt-2 text-xs text-muted-foreground">
            Recommended and Strong redraw pages as images, so text can no longer be selected or
            searched. Use Light if you need to copy text later.
          </p>
        )}
      </fieldset>
    );
  }
  if (slug === "pdf-to-jpg" || slug === "pdf-to-png") {
    return (
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${optionId}-image-quality`} className="mb-2 block text-sm font-semibold">
            Image quality
          </label>
          <select
            id={`${optionId}-image-quality`}
            className={input}
            value={options.dpi ?? "150"}
            onChange={(e) => set("dpi", e.target.value)}
          >
            <option value="72">Screen (72 dpi)</option>
            <option value="150">Standard (150 dpi)</option>
            <option value="300">Print (300 dpi)</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${optionId}-16`} className="mb-2 block text-sm font-semibold">
            Pages (optional)
          </label>
          <input
            id={`${optionId}-16`}
            className={input}
            placeholder="All pages, or e.g. 1-3, 5"
            value={options.ranges ?? ""}
            onChange={(e) => set("ranges", e.target.value)}
          />
        </div>
      </div>
    );
  }
  if (slug === "flatten-pdf") {
    const mode = options.mode ?? "forms";
    return (
      <div className="mt-6">
        <label htmlFor={`${optionId}-17`} className="mb-2 block text-sm font-semibold">
          What to flatten
        </label>
        <select
          id={`${optionId}-17`}
          className={input}
          value={mode}
          onChange={(e) => set("mode", e.target.value)}
        >
          <option value="forms">Form fields only (text stays selectable)</option>
          <option value="full">
            Everything — forms, comments and stamps (pages become images)
          </option>
        </select>
      </div>
    );
  }
  if (slug === "crop-pdf") {
    const sides = [
      ["top", "Top"],
      ["right", "Right"],
      ["bottom", "Bottom"],
      ["left", "Left"],
    ] as const;
    return (
      <div className="mt-6 space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold">Trim from each edge (mm)</p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {sides.map(([k, label]) => (
              <div key={k}>
                <label className="mb-1 block text-xs text-muted-foreground" htmlFor={`crop-${k}`}>
                  {label}
                </label>
                <input
                  id={`crop-${k}`}
                  type="number"
                  min="0"
                  className={input}
                  value={options[k] ?? "10"}
                  onChange={(e) => set(k, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor={`${optionId}-18`} className="mb-2 block text-sm font-semibold">
            Pages (optional)
          </label>
          <input
            id={`${optionId}-18`}
            className={input}
            placeholder="All pages, or e.g. 1-3, 5"
            value={options.ranges ?? ""}
            onChange={(e) => set("ranges", e.target.value)}
          />
        </div>
      </div>
    );
  }
  if (slug === "edit-pdf-metadata") {
    const clear = options.clear === "true";
    const fields = [
      ["title", "Title"],
      ["author", "Author"],
      ["subject", "Subject"],
      ["keywords", "Keywords (comma separated)"],
    ] as const;
    return (
      <div className="mt-6 space-y-4">
        {fields.map(([k, label]) => (
          <div key={k}>
            <label className="mb-2 block text-sm font-semibold" htmlFor={`meta-${k}`}>
              {label}
            </label>
            <input
              id={`meta-${k}`}
              className={input}
              disabled={clear}
              value={options[k] ?? ""}
              onChange={(e) => set(k, e.target.value)}
            />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={clear}
            onChange={(e) => set("clear", e.target.checked ? "true" : "false")}
          />
          Remove all metadata (for privacy before sharing)
        </label>
      </div>
    );
  }
  return null;
}
