import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/pdf-to-text")({
  head: () =>
    seoHead({
      title: "PDF to Text — Extract Text from PDF — MY PDF FIX",
      description:
        "Extract embedded text from PDF pages into a .txt file in your browser. Scanned images need OCR, which this tool does not provide.",
      path: "/pdf-to-text",
    }),
  component: () => <ToolPage slug="pdf-to-text" />,
});
