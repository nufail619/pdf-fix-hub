import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/pdf-to-png")({
  head: () =>
    seoHead({
      title: "PDF to PNG — Convert PDF Pages to PNG Images — MY PDF FIX",
      description:
        "Convert PDF pages into high-quality PNG images for free. Choose the resolution and pages. Works in your browser — files never leave your device.",
      path: "/pdf-to-png",
    }),
  component: () => <ToolPage slug="pdf-to-png" />,
});
