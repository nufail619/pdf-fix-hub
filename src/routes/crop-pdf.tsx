import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/crop-pdf")({
  head: () =>
    seoHead({
      title: "Crop PDF — Trim PDF Margins Online — MY PDF FIX",
      description:
        "Crop PDF pages online for free. Trim white space and scanner borders from any side, on all pages or selected pages.",
      path: "/crop-pdf",
    }),
  component: () => <ToolPage slug="crop-pdf" />,
});
