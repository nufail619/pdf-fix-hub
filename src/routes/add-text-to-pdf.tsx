import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/add-text-to-pdf")({
  head: () =>
    seoHead({
      title: "Add Text to PDF — MY PDF FIX",
      description: "Write custom text on any page of a PDF.",
      path: "/add-text-to-pdf",
    }),
  component: () => <ToolPage slug="add-text-to-pdf" />,
});
