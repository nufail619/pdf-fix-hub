import { useId, useState } from "react";
import { tools, TOOL_CATEGORIES, type ToolCategory } from "@/data/tools";
import { ToolCard } from "./ToolCard";

export function ToolGrid() {
  const [filter, setFilter] = useState<ToolCategory | "All">("All");
  const [query, setQuery] = useState("");
  const id = useId();
  const filtered = tools.filter(
    (tool) =>
      (filter === "All" || tool.category === filter) &&
      `${tool.name} ${tool.description}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const pills: (ToolCategory | "All")[] = ["All", ...TOOL_CATEGORIES];

  return (
    <section
      id="tools"
      className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6"
      aria-label="PDF tools"
    >
      <h2 className="sr-only">PDF tools</h2>
      <div className="mx-auto mb-6 max-w-xl">
        <label htmlFor={id} className="mb-2 block text-sm font-semibold">
          Find a PDF tool
        </label>
        <input
          id={id}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name or task"
          className="h-12 w-full rounded-lg border border-border bg-background px-4"
        />
      </div>
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

      <p role="status" className="mb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "tool" : "tools"} found
      </p>
      {filtered.length === 0 && (
        <div className="rounded-xl border border-border p-8 text-center">
          <p>No tools match your search.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("All");
            }}
            className="mt-3 text-primary underline"
          >
            Show all tools
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((t) => (
          <ToolCard key={t.slug} tool={t} />
        ))}
      </div>
    </section>
  );
}
