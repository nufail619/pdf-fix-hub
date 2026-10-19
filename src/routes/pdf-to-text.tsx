import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/pdf-to-text")({
  head: () =>
    seoHead({
      title: "PDF to Text — Extract Text from PDF — MY PDF FIX",
      description:
        "Extract all text from a PDF into a .txt file for free. Fast, private and works in your browser with no upload.",
      path: "/pdf-to-text",
    }),
  component: () => <ToolPage slug="pdf-to-text" />,
});
