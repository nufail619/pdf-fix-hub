import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/grayscale-pdf")({
  head: () =>
    seoHead({
      title: "Grayscale PDF — Convert PDF to Black and White — MY PDF FIX",
      description:
        "Render PDF pages as grayscale images in your browser. Text is no longer selectable; black-ink-only printing depends on your printer settings.",
      path: "/grayscale-pdf",
    }),
  component: () => <ToolPage slug="grayscale-pdf" />,
});
