import { useState } from "react";
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

export function ToolPage({
  slug,
  children,
}: {
  slug: string;
  children?: React.ReactNode;
}) {
  const tool = toolBySlug(slug)!;
  const accent = ACCENT_CLASSES[tool.accent];

  const [files, setFiles] = useState<File[]>([]);
  const [options, setOptions] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  async function handleProcess() {
    if (tool.processingType === "placeholder") {
      toast.message("Coming soon", {
        description: "This tool requires server processing — coming soon.",
      });
      return;
    }
    if (files.length === 0) {
      toast.error("Please add at least one file.");
      return;
    }
    setBusy(true);
    try {
      const { blob, filename } = await runTool(tool, files, options);
      setResult({ blob, filename });
      toast.success("Done! Your file is ready to download.");
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  const related = tool.related
    .map((s) => tools.find((t) => t.slug === s))
    .filter(Boolean)
    .slice(0, 3) as typeof tools;

  return (
    <div>
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

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {result ? (
          <ResultPanel
            blob={result.blob}
            filename={result.filename}
            onReset={() => {
              setResult(null);
              setFiles([]);
            }}
          />
        ) : (
          <>
            <FileUpload
              accepts={tool.accepts}
              multiple={tool.multiple}
              files={files}
              onChange={setFiles}
            />
            <ToolOptions slug={tool.slug} options={options} setOptions={setOptions} />
            <div className="mt-6 flex justify-center">
              <Button size="lg" onClick={handleProcess} loading={busy} disabled={busy}>
                Process
              </Button>
            </div>
            {tool.processingType === "client" && (
              <p className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-green-600" aria-hidden />
                Processed locally in your browser — your files never leave your device.
              </p>
            )}
            {tool.processingType === "placeholder" && (
              <p className="mt-6 rounded-lg bg-section p-4 text-center text-sm text-muted-foreground">
                Coming soon — this tool requires server-side processing.
              </p>
            )}
          </>
        )}

        <div className="mt-16">{children}{/* CONTENT GOES HERE */}</div>
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
  const set = (k: string, v: string) => setOptions({ ...options, [k]: v });
  const input =
    "h-11 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (slug === "split-pdf" || slug === "extract-pdf-pages" || slug === "remove-pdf-pages") {
    return (
      <div className="mt-6">
        <label className="mb-2 block text-sm font-semibold">
          Page ranges (e.g. 1-3, 5, 7-9)
        </label>
        <input
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
        <label className="mb-2 block text-sm font-semibold">
          New page order (comma separated, e.g. 3,1,2)
        </label>
        <input
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
        <label className="mb-2 block text-sm font-semibold">Rotation</label>
        <select
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
          <label className="mb-2 block text-sm font-semibold">Position</label>
          <select
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
          <label className="mb-2 block text-sm font-semibold">Font size</label>
          <input
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
          <label className="mb-2 block text-sm font-semibold">Text</label>
          <input
            className={input}
            value={options.text ?? ""}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Page</label>
            <input
              type="number"
              className={input}
              value={options.page ?? "1"}
              onChange={(e) => set("page", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">X (pt)</label>
            <input
              type="number"
              className={input}
              value={options.x ?? "50"}
              onChange={(e) => set("x", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Y (pt)</label>
            <input
              type="number"
              className={input}
              value={options.y ?? "50"}
              onChange={(e) => set("y", e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold">Size</label>
            <input
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
        <label className="mb-2 block text-sm font-semibold">
          Insert after page (0 = start)
        </label>
        <input
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
        <label className="mb-2 block text-sm font-semibold">Margin (points)</label>
        <input
          type="number"
          className={input}
          value={options.margin ?? "36"}
          onChange={(e) => set("margin", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          1 point = 1/72 inch. 36 pt ≈ 0.5 in.
        </p>
      </div>
    );
  }
  if (slug === "watermark-pdf") {
    return (
      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">Watermark text</label>
          <input
            className={input}
            placeholder="CONFIDENTIAL"
            value={options.text ?? ""}
            onChange={(e) => set("text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Opacity (0–1)</label>
            <input
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
            <label className="mb-2 block text-sm font-semibold">Font size</label>
            <input
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
  return null;
}
