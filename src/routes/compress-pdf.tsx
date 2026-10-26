import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/compress-pdf")({
  head: () =>
    seoHead({
      title: "Compress PDF — Reduce PDF File Size Online — MY PDF FIX",
      description:
        "Reduce PDF file size for free. Try light, recommended or strong compression and compare the output size. Document contents are processed without upload.",
      path: "/compress-pdf",
    }),
  component: () => <ToolPage slug="compress-pdf" />,
});
