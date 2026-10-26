import { useEffect, useMemo, useRef, useState } from "react";
import type { Overlay } from "@/lib/pdf/edit";
import { nativeText } from "@/lib/pdf/nativeTextClient";
import type { NativeInspection, TextEdit } from "@/lib/pdf/nativeTextCore";
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
  const [inspection, setInspection] = useState<NativeInspection | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [nativeSelected, setNativeSelected] = useState("");
  const [draft, setDraft] = useState<TextEdit | null>(null);
  const [previewFile, setPreviewFile] = useState<File>();
  const [previewPending, setPreviewPending] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [zoom, setZoom] = useState(100);
  const [past, setPast] = useState<string[]>([]);
  const [future, setFuture] = useState<string[]>([]);
  const snapshot = JSON.stringify({
    elements: options.elements || "[]",
    textEdits: options.textEdits || "[]",
    flattenForms: options.flattenForms || "false",
  });
  const remember = (value: string) => {
    setPast((old) => [...old.slice(-99), value]);
    setFuture([]);
  };
  const change = (next: Record<string, string>, record = true) => {
    if (record) remember(snapshot);
    onChange(next);
  };
  const textEdits: TextEdit[] = useMemo(
    () => JSON.parse(options.textEdits || "[]"),
    [options.textEdits],
  );
  useEffect(() => {
    let cancelled = false;
    setInspection(null);
    setAnalysisError("");
    if (file)
      nativeText(file)
        .then((result) => {
          if (!cancelled) setInspection(result as NativeInspection);
        })
        .catch((error) => {
          if (!cancelled) setAnalysisError(error.message);
        });
    return () => {
      cancelled = true;
    };
  }, [file]);
  useEffect(() => {
    let cancelled = false;
    setPreviewError("");
    if (!file || !textEdits.length) {
      setPreviewFile(undefined);
      setPreviewPending(false);
      return;
    }
    setPreviewPending(true);
    nativeText(file, textEdits)
      .then((result) => {
        if (!cancelled)
          setPreviewFile(
            new File([result as Uint8Array<ArrayBuffer>], "text-preview.pdf", {
              type: "application/pdf",
            }),
          );
      })
      .catch((error) => {
        if (!cancelled) setPreviewError(error.message);
      })
      .finally(() => {
        if (!cancelled) setPreviewPending(false);
      });
    return () => {
      cancelled = true;
    };
  }, [file, textEdits]);
  useEffect(() => {
    const item = inspection?.items.find((item) => item.id === nativeSelected);
    setDraft(
      item
        ? textEdits.find((edit) => edit.id === item.id) || {
            id: item.id,
            original: item.text,
            text: item.text,
            x: item.x,
            y: item.y,
            fontSize: item.fontSize,
            color: item.color,
          }
        : null,
    );
  }, [nativeSelected, inspection, textEdits]);
  const selectedText = inspection?.items.find((item) => item.id === nativeSelected);
  const dragSnapshot = useRef("");
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    startX: number;
    startY: number;
    mode?: "move" | "resize";
    width?: number;
    height?: number;
  } | null>(null);
  const { rendered, count, loading, error } = usePdfPreview(previewFile || file, page, zoom / 100);
  const elements: Overlay[] = useMemo(
    () => JSON.parse(options.elements || "[]"),
    [options.elements],
  );
  const active = elements.find((element) => element.id === selected);
  const background = useMemo(() => rendered?.canvas.toDataURL("image/png"), [rendered]);
  useEffect(() => {
    setPage(1);
    setSelected("");
    setNativeSelected("");
    setPast([]);
    setFuture([]);
    setZoom(100);
  }, [file]);
  useEffect(() => {
    onReady(!!rendered && !loading && !error && !previewPending && !previewError);
  }, [rendered, loading, error, onReady, previewPending, previewError]);
  const save = (next: Overlay[], record = true) =>
    change({ ...options, elements: JSON.stringify(next) }, record);
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
    setNativeSelected("");
  }
  return (
    <div className="mt-6 space-y-4">
      <p className="rounded-lg border border-border bg-section p-4 text-sm">
        <strong>Whiteout is not secure redaction.</strong> It only covers content visually. The
        original text remains extractable. Use Existing text to replace supported text objects;
        added text boxes and shapes remain overlays. Text replacement is not a complete redaction or
        hidden-data sanitization workflow. Keep signed originals; saving can invalidate signatures.
      </p>
      <div className="flex flex-wrap items-center gap-2" aria-label="Editor history and zoom">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!past.length}
          onClick={() => {
            const previous = past[past.length - 1];
            setPast(past.slice(0, -1));
            setFuture((old) => [snapshot, ...old]);
            onChange({ ...options, ...JSON.parse(previous) });
          }}
        >
          Undo
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={!future.length}
          onClick={() => {
            setPast((old) => [...old, snapshot]);
            setFuture(future.slice(1));
            onChange({ ...options, ...JSON.parse(future[0]) });
          }}
        >
          Redo
        </Button>
        <label className="text-sm">
          Zoom
          <select
            aria-label="Zoom"
            className={controlClass}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
          >
            {[50, 75, 100, 125, 150, 200].map((value) => (
              <option key={value} value={value}>
                {value}%
              </option>
            ))}
          </select>
        </label>
      </div>
      {previewPending && <p role="status">Rendering the actual text replacement…</p>}
      {previewError && (
        <p role="alert" className="text-red-700">
          {previewError} Undo the change to continue.
        </p>
      )}
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
            setNativeSelected("");
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
          onChange={(event) => change({ ...options, flattenForms: String(event.target.checked) })}
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
        on their own page. Drag the selected element’s bottom-right handle to resize it. Added text
        supports basic Latin fonts and explicit line breaks; existing text does not reflow
        paragraphs.
      </p>
      <section
        className="space-y-3 rounded-lg border border-border p-4"
        aria-label="Existing PDF text"
      >
        <h3 className="font-semibold">Existing text</h3>
        {!inspection && !analysisError && file && (
          <p role="status">Analyzing text objects locally…</p>
        )}
        {analysisError && (
          <p role="status">
            Existing text could not be analyzed: {analysisError} Added overlays are still available.
          </p>
        )}
        {inspection && !(inspection.pageTextCounts[page - 1] > 0) && (
          <p role="status">
            No selectable text on this page. It may be scanned or outlined. OCR is not included; use
            added text boxes for notes.
          </p>
        )}
        {inspection &&
          inspection.pageTextCounts[page - 1] > 0 &&
          !inspection.items.some((item) => item.page === page) && (
            <p role="status">
              Text exists inside unsupported containers on this page. It can be read, but cannot be
              replaced here.
            </p>
          )}
        {inspection?.limited && (
          <p role="status">Only the first 2,000 page objects are analyzed on complex pages.</p>
        )}
        <p className="text-sm text-muted-foreground">
          Select a text object below or click its blue outline. Replacement supports simple
          horizontal text objects and keeps the existing font. Embedded fonts can only reuse
          characters already in that selected text. Text inside forms, images, nested graphics, or
          complex layouts may be unsupported. Replacement must fit the original width; reduce its
          size if needed.
        </p>
        {inspection && inspection.items.some((item) => item.page === page) && (
          <label className="block text-sm">
            Select existing text
            <select
              className={controlClass + " mt-1"}
              value={nativeSelected}
              onChange={(event) => {
                setNativeSelected(event.target.value);
                setSelected("");
              }}
            >
              <option value="">Choose text on this page</option>
              {inspection.items
                .filter((item) => item.page === page)
                .map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.index + 1}. {item.text.slice(0, 80)}
                    {item.supported ? "" : " (unsupported)"}
                  </option>
                ))}
            </select>
          </label>
        )}
        {selectedText && draft && (
          <fieldset className="space-y-3" disabled={previewPending || !selectedText.supported}>
            <legend className="text-sm font-semibold">
              Selected original text — {selectedText.font}
              {selectedText.embedded ? " (embedded)" : ""}
            </legend>
            <p className="select-text break-words text-sm">Original: {selectedText.text}</p>
            {!selectedText.supported && <p role="status">{selectedText.reason}</p>}
            <label className="block text-sm">
              Replacement text
              <input
                className={controlClass}
                maxLength={500}
                value={draft.text}
                onChange={(event) => setDraft({ ...draft, text: event.target.value })}
              />
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <label className="text-xs">
                Existing text size (pt)
                <input
                  type="number"
                  min="6"
                  max="96"
                  className={controlClass}
                  value={draft.fontSize}
                  onChange={(event) => setDraft({ ...draft, fontSize: Number(event.target.value) })}
                />
              </label>
              <label className="text-xs">
                Existing horizontal position (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={controlClass}
                  value={Math.round(draft.x * 1000) / 10}
                  onChange={(event) => setDraft({ ...draft, x: Number(event.target.value) / 100 })}
                />
              </label>
              <label className="text-xs">
                Existing vertical position (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  className={controlClass}
                  value={Math.round(draft.y * 1000) / 10}
                  onChange={(event) => setDraft({ ...draft, y: Number(event.target.value) / 100 })}
                />
              </label>
              <label className="text-xs">
                Existing text color
                <input
                  type="color"
                  className="block h-11 w-full"
                  value={draft.color}
                  onChange={(event) => setDraft({ ...draft, color: event.target.value })}
                />
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() =>
                  change({
                    ...options,
                    textEdits: JSON.stringify([
                      ...textEdits.filter((edit) => edit.id !== draft.id),
                      draft,
                    ]),
                  })
                }
              >
                Apply text replacement
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() =>
                  change({
                    ...options,
                    textEdits: JSON.stringify([
                      ...textEdits.filter((edit) => edit.id !== draft.id),
                      { ...draft, text: "" },
                    ]),
                  })
                }
              >
                Delete existing text
              </Button>
            </div>
          </fieldset>
        )}
      </section>
      {rendered && background && !loading && (
        <div className="max-w-full overflow-auto rounded-lg border border-border">
          <svg
            role="group"
            aria-label={`PDF editor page ${page}`}
            viewBox={`0 0 ${rendered.widthPt} ${rendered.heightPt}`}
            className="block w-full overflow-hidden rounded-lg border border-border bg-white"
            style={{ touchAction: "none", width: `${zoom}%`, maxWidth: "none" }}
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
                        ...(moving.mode === "resize"
                          ? {
                              width: Math.max(
                                0.01,
                                Math.min(
                                  1 - element.x,
                                  (moving.width || element.width) +
                                    (event.clientX - moving.startX) / bounds.width,
                                ),
                              ),
                              height: Math.max(
                                0.01,
                                Math.min(
                                  1 - element.y,
                                  (moving.height || element.height) +
                                    (event.clientY - moving.startY) / bounds.height,
                                ),
                              ),
                            }
                          : {
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
                            }),
                      }
                    : element,
                ),
                false,
              );
            }}
            onPointerUp={() => {
              if (drag.current && dragSnapshot.current !== snapshot) remember(dragSnapshot.current);
              drag.current = null;
            }}
            onPointerCancel={() => {
              if (drag.current) onChange({ ...options, ...JSON.parse(dragSnapshot.current) });
              drag.current = null;
            }}
          >
            <image href={background} width={rendered.widthPt} height={rendered.heightPt} />
            {inspection?.items
              .filter(
                (item) => item.page === page && !textEdits.some((edit) => edit.id === item.id),
              )
              .map((item) => (
                <rect
                  key={item.id}
                  x={item.x * rendered.widthPt}
                  y={item.y * rendered.heightPt}
                  width={item.width * rendered.widthPt}
                  height={item.height * rendered.heightPt}
                  fill="transparent"
                  stroke={nativeSelected === item.id ? "#2563eb" : "#2563eb55"}
                  strokeWidth="1"
                  role="button"
                  tabIndex={0}
                  aria-label={`Select existing text ${item.index + 1}: ${item.text.slice(0, 80)}`}
                  onClick={() => {
                    setNativeSelected(item.id);
                    setSelected("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setNativeSelected(item.id);
                      setSelected("");
                    }
                  }}
                />
              ))}
            {elements
              .filter((element) => element.page === page)
              .map((element) => {
                const x = element.x * rendered.widthPt,
                  y = element.y * rendered.heightPt;
                const width = element.width * rendered.widthPt,
                  height = element.height * rendered.heightPt;
                return (
                  <g key={element.id}>
                    <g
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${element.kind} element`}
                      aria-pressed={selected === element.id}
                      className="cursor-move outline-none"
                      onClick={() => {
                        setSelected(element.id);
                        setNativeSelected("");
                      }}
                      onPointerDown={(event) => {
                        event.preventDefault();
                        setSelected(element.id);
                        setNativeSelected("");
                        dragSnapshot.current = snapshot;
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
                          fontFamily={
                            element.family === "Times"
                              ? "Times New Roman, serif"
                              : element.family === "Courier"
                                ? "Courier New, monospace"
                                : "Helvetica, Arial, sans-serif"
                          }
                          fontWeight={element.bold ? "bold" : "normal"}
                          fontStyle={element.italic ? "italic" : "normal"}
                          textAnchor={
                            element.align === "center"
                              ? "middle"
                              : element.align === "right"
                                ? "end"
                                : "start"
                          }
                          style={{ whiteSpace: "pre" }}
                        >
                          {element.text.split("\n").map((line, index) => (
                            <tspan
                              key={index}
                              x={
                                x +
                                (element.align === "center"
                                  ? width / 2
                                  : element.align === "right"
                                    ? width
                                    : 0)
                              }
                              dy={index ? element.fontSize * 1.2 : 0}
                            >
                              {line}
                            </tspan>
                          ))}
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
                    {selected === element.id && (
                      <rect
                        x={x + width - 5}
                        y={y + height - 5}
                        width="10"
                        height="10"
                        fill="#2563eb"
                        role="button"
                        tabIndex={0}
                        aria-label="Resize selected element"
                        className="cursor-se-resize"
                        onPointerDown={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          dragSnapshot.current = snapshot;
                          drag.current = {
                            id: element.id,
                            x: element.x,
                            y: element.y,
                            startX: event.clientX,
                            startY: event.clientY,
                            mode: "resize",
                            width: element.width,
                            height: element.height,
                          };
                          event.currentTarget.ownerSVGElement?.setPointerCapture(event.pointerId);
                        }}
                        onKeyDown={(event) => {
                          if (
                            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
                          ) {
                            event.preventDefault();
                            event.stopPropagation();
                            update({
                              width: Math.max(
                                0.01,
                                Math.min(
                                  1 - element.x,
                                  element.width +
                                    (event.key === "ArrowRight"
                                      ? 0.01
                                      : event.key === "ArrowLeft"
                                        ? -0.01
                                        : 0),
                                ),
                              ),
                              height: Math.max(
                                0.01,
                                Math.min(
                                  1 - element.y,
                                  element.height +
                                    (event.key === "ArrowDown"
                                      ? 0.01
                                      : event.key === "ArrowUp"
                                        ? -0.01
                                        : 0),
                                ),
                              ),
                            });
                          }
                        }}
                      />
                    )}
                  </g>
                );
              })}
          </svg>
        </div>
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
            <div className="text-sm">
              <label className="block">
                Text to add
                <textarea
                  aria-label="Text to add"
                  className={controlClass + " mt-1 h-24 py-2"}
                  maxLength={500}
                  value={active.text}
                  onChange={(event) => update({ text: event.target.value })}
                />
              </label>
              <div className="mt-3 flex flex-wrap gap-3">
                <label>
                  Text font
                  <select
                    aria-label="Text font"
                    className={controlClass}
                    value={active.family || "Helvetica"}
                    onChange={(event) =>
                      update({ family: event.target.value as Overlay["family"] })
                    }
                  >
                    {["Helvetica", "Times", "Courier"].map((font) => (
                      <option key={font}>{font}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Text alignment
                  <select
                    aria-label="Text alignment"
                    className={controlClass}
                    value={active.align || "left"}
                    onChange={(event) => update({ align: event.target.value as Overlay["align"] })}
                  >
                    {["left", "center", "right"].map((align) => (
                      <option key={align}>{align}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!active.bold}
                    onChange={(event) => update({ bold: event.target.checked })}
                  />{" "}
                  Bold
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!active.italic}
                    onChange={(event) => update({ italic: event.target.checked })}
                  />{" "}
                  Italic
                </label>
              </div>
            </div>
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
