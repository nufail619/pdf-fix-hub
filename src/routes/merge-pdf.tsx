import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/merge-pdf")({
  head: () =>
    seoHead({
      title: "Merge PDF — MY PDF FIX",
      description: "Combine multiple PDFs into one document, free and online.",
      path: "/merge-pdf",
    }),
  component: () => <ToolPage slug="merge-pdf" />,
});
