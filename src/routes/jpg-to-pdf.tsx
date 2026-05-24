import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/jpg-to-pdf")({
  head: () =>
    seoHead({
      title: "JPG to PDF — MY PDF FIX",
      description: "Convert JPG images into a single PDF document.",
      path: "/jpg-to-pdf",
    }),
  component: () => <ToolPage slug="jpg-to-pdf" />,
});
