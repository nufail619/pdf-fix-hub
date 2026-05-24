import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/png-to-pdf")({
  head: () =>
    seoHead({
      title: "PNG to PDF — MY PDF FIX",
      description: "Convert PNG images into a single PDF document.",
      path: "/png-to-pdf",
    }),
  component: () => <ToolPage slug="png-to-pdf" />,
});
