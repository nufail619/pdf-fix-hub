import { Button } from "@/components/common/Button";

export function PageNavigation({
  page,
  count,
  setPage,
  disabled,
}: {
  page: number;
  count: number;
  setPage: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="my-4 flex flex-wrap items-center justify-center gap-3">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || page <= 1}
        onClick={() => setPage(page - 1)}
      >
        Previous page
      </Button>
      <span className="text-sm" aria-live="polite">
        Page {page} of {count}
      </span>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        disabled={disabled || page >= count}
        onClick={() => setPage(page + 1)}
      >
        Next page
      </Button>
    </div>
  );
}
