import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/word-to-pdf")({
  head: () =>
    seoHead({
      title: "Word to PDF — MY PDF FIX",
      description: "Convert Word documents to polished PDFs.",
      path: "/word-to-pdf",
    }),
  component: () => <ToolPage slug="word-to-pdf" />,
});
