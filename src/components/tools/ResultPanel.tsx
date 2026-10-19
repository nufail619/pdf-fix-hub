import { useEffect, useMemo } from "react";
import { Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/common/Button";

export function ResultPanel({
  filename,
  blob,
  note,
  onReset,
}: {
  filename: string;
  blob: Blob;
  note?: string;
  onReset: () => void;
}) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  return (
    <div className="rounded-2xl border border-border bg-section p-8 text-center">
      <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-600" aria-hidden />
      <h2 className="text-xl font-bold">Your file is ready</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {filename} · {(blob.size / 1024).toFixed(1)} KB
      </p>
      {note && <p className="mx-auto mt-3 max-w-md text-sm text-foreground">{note}</p>}
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a
          href={url}
          download={filename}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-bold text-primary-foreground hover:bg-primary-hover"
        >
          <Download className="h-5 w-5" aria-hidden />
          Download
        </a>
        <Button variant="secondary" onClick={onReset}>
          Process another file
        </Button>
      </div>
    </div>
  );
}
