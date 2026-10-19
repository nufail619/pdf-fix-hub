import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/compress-pdf")({
  head: () =>
    seoHead({
      title: "Compress PDF — Reduce PDF File Size Online — MY PDF FIX",
      description: "Reduce PDF file size for free. Choose light, recommended or strong compression to meet email and upload limits. Files never leave your device.",
      path: "/compress-pdf",
    }),
  component: () => <ToolPage slug="compress-pdf" />,
});
