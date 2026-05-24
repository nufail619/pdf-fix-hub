import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/add-blank-page-to-pdf")({
  head: () =>
    seoHead({
      title: "Add Blank Page to PDF — MY PDF FIX",
      description: "Insert a blank page anywhere in a PDF.",
      path: "/add-blank-page-to-pdf",
    }),
  component: () => <ToolPage slug="add-blank-page-to-pdf" />,
});
