import { useState } from "react";
import { tools, TOOL_CATEGORIES, type ToolCategory } from "@/data/tools";
import { ToolCard } from "./ToolCard";

export function ToolGrid() {
  const [filter, setFilter] = useState<ToolCategory | "All">("All");
  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);
  const pills: (ToolCategory | "All")[] = ["All", ...TOOL_CATEGORIES];

  return (
    <section
      id="tools"
      className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6"
      aria-label="PDF tools"
    >
      <div className="mb-8 flex flex-wrap gap-2 justify-center">
        {pills.map((p) => {
          const active = filter === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setFilter(p)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "bg-section text-foreground hover:bg-border"
              }`}
              aria-pressed={active}
            >
              {p}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
