import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/split-pdf")({
  head: () =>
    seoHead({
      title: "Split PDF — MY PDF FIX",
      description: "Split a PDF into smaller files by page range, in your browser.",
      path: "/split-pdf",
    }),
  component: () => <ToolPage slug="split-pdf" />,
});
