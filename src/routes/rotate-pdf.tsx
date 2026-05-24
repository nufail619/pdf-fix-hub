import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/rotate-pdf")({
  head: () =>
    seoHead({
      title: "Rotate PDF — MY PDF FIX",
      description: "Rotate every page of a PDF by 90, 180 or 270 degrees.",
      path: "/rotate-pdf",
    }),
  component: () => <ToolPage slug="rotate-pdf" />,
});
