import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/compress-pdf")({
  head: () =>
    seoHead({
      title: "Compress PDF — MY PDF FIX",
      description: "Reduce PDF file size while keeping it readable.",
      path: "/compress-pdf",
    }),
  component: () => <ToolPage slug="compress-pdf" />,
});
