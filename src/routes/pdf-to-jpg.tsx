import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/pdf-to-jpg")({
  head: () =>
    seoHead({
      title: "PDF to JPG — MY PDF FIX",
      description: "Convert each page of a PDF into a JPG image.",
      path: "/pdf-to-jpg",
    }),
  component: () => <ToolPage slug="pdf-to-jpg" />,
});
