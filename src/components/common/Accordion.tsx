import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

export type AccordionItem = { q: string; a: string };

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-background">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`${id}-panel-${i}`}
              id={`${id}-button-${i}`}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>
            <div
              id={`${id}-panel-${i}`}
              role="region"
              aria-labelledby={`${id}-button-${i}`}
              hidden={!isOpen}
              className="px-5 pb-5 text-muted-foreground"
            >
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
