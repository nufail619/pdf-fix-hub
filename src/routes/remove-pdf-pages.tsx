import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/remove-pdf-pages")({
  head: () =>
    seoHead({
      title: "Remove PDF Pages — MY PDF FIX",
      description: "Delete specific pages from a PDF.",
      path: "/remove-pdf-pages",
    }),
  component: () => <ToolPage slug="remove-pdf-pages" />,
});
