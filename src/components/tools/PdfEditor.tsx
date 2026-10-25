import { useEffect, useMemo, useRef, useState } from "react";
import type { Overlay } from "@/lib/pdf/edit";
import { Button } from "@/components/common/Button";
import { PageNavigation } from "./PdfPreview";
import { controlClass, usePdfPreview } from "./usePdfPreview";

export function PdfEditor({
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
  const [selected, setSelected] = useState("");
  const drag = useRef<{ id: string; x: number; y: number; startX: number; startY: number } | null>(
    null,
  );
  const { rendered, count, loading, error } = usePdfPreview(file, page);
  const elements: Overlay[] = useMemo(
    () => JSON.parse(options.elements || "[]"),
    [options.elements],
  );
  const active = elements.find((element) => element.id === selected);
  const background = useMemo(() => rendered?.canvas.toDataURL("image/png"), [rendered]);
  useEffect(() => {
    setPage(1);
    setSelected("");
  }, [file]);
  useEffect(() => {
    onReady(!!rendered && !loading && !error);
  }, [rendered, loading, error, onReady]);
  const save = (next: Overlay[]) => onChange({ ...options, elements: JSON.stringify(next) });
  function update(patch: Partial<Overlay>) {
    save(elements.map((element) => (element.id === selected ? { ...element, ...patch } : element)));
  }
  function add(kind: Overlay["kind"]) {
    const id = crypto.randomUUID();
    const height = kind === "text" ? Math.max(0.08, 20 / (rendered?.heightPt || 480)) : 0.15;
    save([
      ...elements,
      {
        id,
        kind,
        page,
        x: 0.1,
        y: 0.15,
        width: 0.5,
        height,
        text: "Your text",
        fontSize: 16,
        color: kind === "highlight" ? "#ffff00" : "#1d4ed8",
      },
    ]);
    setSelected(id);
  }
  return (
    <div className="mt-6 space-y-4">
      <p className="rounded-lg border border-border bg-section p-4 text-sm">
        <strong>Whiteout is not secure redaction.</strong> It only covers content visually. The
        original text remains extractable. This editor adds overlays; it cannot change existing PDF
        text.
      </p>
      {loading && <p role="status">Loading page preview…</p>}
      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
      {count > 0 && (
        <PageNavigation
          page={page}
          count={count}
          setPage={(value) => {
            setPage(value);
            setSelected("");
          }}
          disabled={loading}
        />
      )}
      <div role="group" aria-label="Add editor elements" className="flex flex-wrap gap-2">
        {(
          [
            ["text", "Add text"],
            ["rectangle", "Add rectangle"],
            ["ellipse", "Add ellipse"],
            ["highlight", "Add highlight"],
            ["whiteout", "Add whiteout"],
          ] as const
        ).map(([kind, label]) => (
          <Button
            key={kind}
            type="button"
            size="sm"
            variant="secondary"
            disabled={!rendered || loading}
            onClick={() => add(kind)}
          >
            {label}
          </Button>
        ))}
      </div>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 accent-primary"
          checked={options.flattenForms === "true"}
          onChange={(event) => onChange({ ...options, flattenForms: String(event.target.checked) })}
        />
        Flatten form fields in edited copy
      </label>
      <p className="text-sm text-muted-foreground">
        Form fields stay interactive by default and may appear above overlays. Select flattening to
        place overlays above form fields; visible values are kept but fields stop being editable.
        Other existing PDF annotations may also appear above overlays.
      </p>
      <p className="text-sm text-muted-foreground">
        Drag an added element to move it, or select it and use the position controls. Elements stay
        on their own page. Text uses a standard Latin font.
      </p>
      {rendered && background && !loading && (
        <svg
          role="group"
          aria-label={`PDF editor page ${page}`}
          viewBox={`0 0 ${rendered.widthPt} ${rendered.heightPt}`}
          className="block w-full overflow-hidden rounded-lg border border-border bg-white"
          style={{ touchAction: "none" }}
          onPointerMove={(event) => {
            const moving = drag.current;
            if (!moving) return;
            const bounds = event.currentTarget.getBoundingClientRect();
            const item = elements.find((element) => element.id === moving.id)!;
            save(
              elements.map((element) =>
                element.id === moving.id
                  ? {
                      ...element,
                      x: Math.max(
                        0,
                        Math.min(
                          1 - item.width,
                          moving.x + (event.clientX - moving.startX) / bounds.width,
                        ),
                      ),
                      y: Math.max(
                        0,
                        Math.min(
                          1 - item.height,
                          moving.y + (event.clientY - moving.startY) / bounds.height,
                        ),
                      ),
                    }
                  : element,
              ),
            );
          }}
          onPointerUp={() => {
            drag.current = null;
          }}
          onPointerCancel={() => {
            drag.current = null;
          }}
        >
          <image href={background} width={rendered.widthPt} height={rendered.heightPt} />
          {elements
            .filter((element) => element.page === page)
            .map((element) => {
              const x = element.x * rendered.widthPt,
                y = element.y * rendered.heightPt;
              const width = element.width * rendered.widthPt,
                height = element.height * rendered.heightPt;
              return (
                <g
                  key={element.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Select ${element.kind} element`}
                  aria-pressed={selected === element.id}
                  className="cursor-move outline-none"
                  onClick={() => setSelected(element.id)}
                  onPointerDown={(event) => {
                    event.preventDefault();
                    setSelected(element.id);
                    drag.current = {
                      id: element.id,
                      x: element.x,
                      y: element.y,
                      startX: event.clientX,
                      startY: event.clientY,
                    };
                    event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(element.id);
                    }
                    if (event.key === "Delete" || event.key === "Backspace") {
                      event.preventDefault();
                      save(elements.filter((item) => item.id !== element.id));
                      setSelected("");
                    }
                  }}
                >
                  {element.kind === "text" ? (
                    <text
                      x={x}
                      y={y + element.fontSize}
                      fill={element.color}
                      fontSize={element.fontSize}
                      fontFamily="Helvetica, Arial, sans-serif"
                      style={{ whiteSpace: "pre" }}
                    >
                      {element.text}
                    </text>
                  ) : element.kind === "ellipse" ? (
                    <ellipse
                      cx={x + width / 2}
                      cy={y + height / 2}
                      rx={width / 2}
                      ry={height / 2}
                      fill="none"
                      stroke={element.color}
                      strokeWidth="2"
                    />
                  ) : (
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={
                        element.kind === "rectangle"
                          ? "none"
                          : element.kind === "whiteout"
                            ? "#ffffff"
                            : element.color
                      }
                      fillOpacity={element.kind === "highlight" ? 0.35 : 1}
                      stroke={element.kind === "rectangle" ? element.color : "none"}
                      strokeWidth="2"
                    />
                  )}
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill="transparent"
                    stroke={selected === element.id ? "#2563eb" : "transparent"}
                    strokeDasharray="4 3"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
        </svg>
      )}
      {elements.length > 0 && (
        <label className="block text-sm font-semibold">
          Added elements
          <select
            className={controlClass + " mt-2"}
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value);
              const item = elements.find((element) => element.id === event.target.value);
              if (item) setPage(item.page);
            }}
          >
            <option value="">Choose an element</option>
            {elements.map((element, index) => (
              <option key={element.id} value={element.id}>
                {index + 1}. {element.kind} — page {element.page}
              </option>
            ))}
          </select>
        </label>
      )}
      {active && (
        <fieldset className="space-y-4 rounded-lg border border-border p-4">
          <legend className="px-2 text-sm font-semibold">Selected element</legend>
          {active.kind === "text" && (
            <label className="block text-sm">
              Text to add
              <input
                className={controlClass + " mt-1"}
                maxLength={500}
                value={active.text}
                onChange={(event) => update({ text: event.target.value.replace(/[\r\n]/g, " ") })}
              />
            </label>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["x", "Horizontal position (%)"],
                ["y", "Vertical position (%)"],
                ["width", "Width (%)"],
                ["height", "Height (%)"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="text-xs">
                {label}
                <input
                  type="number"
                  className={controlClass + " mt-1"}
                  min={key === "width" || key === "height" ? 1 : 0}
                  max="100"
                  step="1"
                  value={Math.round(active[key] * 100)}
                  onChange={(event) => {
                    const raw = Math.max(
                      key === "width" || key === "height" ? 0.01 : 0,
                      Math.min(1, Number(event.target.value) / 100),
                    );
                    const value =
                      key === "x"
                        ? Math.min(raw, 1 - active.width)
                        : key === "y"
                          ? Math.min(raw, 1 - active.height)
                          : key === "width"
                            ? Math.min(raw, 1 - active.x)
                            : Math.min(raw, 1 - active.y);
                    update({ [key]: value });
                  }}
                />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-4">
            {active.kind !== "whiteout" && (
              <label className="text-sm">
                Element color
                <input
                  type="color"
                  value={active.color}
                  onChange={(event) => update({ color: event.target.value })}
                  className="mt-1 block h-10 w-16"
                />
              </label>
            )}
            {active.kind === "text" && (
              <label className="text-sm">
                Text size (pt)
                <input
                  type="number"
                  className={controlClass + " mt-1 max-w-28"}
                  min="6"
                  max="96"
                  value={active.fontSize}
                  onChange={(event) =>
                    update({ fontSize: Math.max(6, Math.min(96, Number(event.target.value) || 6)) })
                  }
                />
              </label>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                save(elements.filter((element) => element.id !== selected));
                setSelected("");
              }}
            >
              Delete selected element
            </Button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
