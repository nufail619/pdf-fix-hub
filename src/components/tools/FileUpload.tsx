import { useRef, useState, type DragEvent } from "react";
import { Upload, X, FileIcon } from "lucide-react";

export function FileUpload({
  accepts,
  multiple,
  files,
  onChange,
}: {
  accepts: string[];
  multiple: boolean;
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const acceptAttr = accepts.join(",");

  function handleFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list);
    onChange(multiple ? [...files, ...incoming] : incoming.slice(0, 1));
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-section hover:border-primary/40"
        }`}
        aria-label="Upload files"
      >
        <Upload className="mb-3 h-10 w-10 text-primary" aria-hidden />
        <p className="text-base font-semibold">
          Drop {multiple ? "files" : "a file"} here, or click to browse
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Accepted: {accepts.join(", ")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border bg-background p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <FileIcon className="h-5 w-5 text-primary" aria-hidden />
                <span className="truncate text-sm font-medium">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(1)} KB
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-section hover:text-primary"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
