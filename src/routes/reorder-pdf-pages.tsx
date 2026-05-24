import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/reorder-pdf-pages")({
  head: () =>
    seoHead({
      title: "Reorder PDF Pages — MY PDF FIX",
      description: "Change the page order of a PDF document.",
      path: "/reorder-pdf-pages",
    }),
  component: () => <ToolPage slug="reorder-pdf-pages" />,
});
