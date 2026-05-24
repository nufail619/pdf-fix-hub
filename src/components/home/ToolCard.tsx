import { Link } from "@tanstack/react-router";
import { ACCENT_CLASSES, type Tool } from "@/data/tools";
import { Icon } from "@/components/common/Icon";

export function ToolCard({ tool }: { tool: Tool }) {
  const accent = ACCENT_CLASSES[tool.accent];
  return (
    <Link
      to={"/" + tool.slug as never}
      className="group flex h-full flex-col rounded-2xl border border-border bg-background p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
    >
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full ${accent.bg} ${accent.fg}`}
      >
        <Icon name={tool.icon} className="h-6 w-6" />
      </div>
      <h3 className="mb-1 font-bold text-base group-hover:text-primary">{tool.name}</h3>
      <p className="text-sm text-muted-foreground">{tool.description}</p>
      <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {tool.category}
      </span>
    </Link>
  );
}
