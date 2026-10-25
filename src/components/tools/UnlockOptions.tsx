import { controlClass } from "./usePdfPreview";

export function UnlockOptions({
  options,
  onChange,
}: {
  options: Record<string, string>;
  onChange: (value: Record<string, string>) => void;
}) {
  return (
    <div className="mt-6 space-y-4">
      <label className="block text-sm font-semibold">
        PDF password
        <input
          type="password"
          autoComplete="off"
          value={options.password || ""}
          onChange={(event) => onChange({ ...options, password: event.target.value })}
          className={controlClass + " mt-2"}
        />
      </label>
      <p className="text-sm text-muted-foreground">
        The password stays in memory for this attempt and is cleared afterwards. It is never saved
        or uploaded. Leave it empty only if the PDF opens without a password.
      </p>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={options.authorized === "true"}
          className="mt-1 accent-primary"
          onChange={(event) => onChange({ ...options, authorized: String(event.target.checked) })}
        />
        I own this PDF or have permission to remove its password protection.
      </label>
      <p className="rounded-lg border border-border bg-section p-4 text-sm">
        Supports standard password encryption when the supplied password is valid. This does not
        recover forgotten passwords. Certificate encryption, DRM and damaged or unsupported
        encrypted PDFs cannot be unlocked.
      </p>
    </div>
  );
}
