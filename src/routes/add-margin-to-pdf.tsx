import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/add-margin-to-pdf")({
  head: () =>
    seoHead({
      title: "Add Margin to PDF — MY PDF FIX",
      description: "Add white margins around PDF pages.",
      path: "/add-margin-to-pdf",
    }),
  component: () => <ToolPage slug="add-margin-to-pdf" />,
});
