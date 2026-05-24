import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/add-page-numbers-to-pdf")({
  head: () =>
    seoHead({
      title: "Add Page Numbers to PDF — MY PDF FIX",
      description: "Insert page numbers anywhere on every PDF page.",
      path: "/add-page-numbers-to-pdf",
    }),
  component: () => <ToolPage slug="add-page-numbers-to-pdf" />,
});
