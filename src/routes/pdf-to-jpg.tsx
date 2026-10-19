import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/pdf-to-jpg")({
  head: () =>
    seoHead({
      title: "PDF to JPG — Convert PDF Pages to Images — MY PDF FIX",
      description: "Convert PDF pages to JPG images for free. Pick the quality and pages, download as images or a ZIP. Private — works in your browser.",
      path: "/pdf-to-jpg",
    }),
  component: () => <ToolPage slug="pdf-to-jpg" />,
});
