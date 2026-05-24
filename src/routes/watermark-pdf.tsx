import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/watermark-pdf")({
  head: () =>
    seoHead({
      title: "Watermark PDF — MY PDF FIX",
      description: "Add a text watermark to every page of a PDF.",
      path: "/watermark-pdf",
    }),
  component: () => <ToolPage slug="watermark-pdf" />,
});
