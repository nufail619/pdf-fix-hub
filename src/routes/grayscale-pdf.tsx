import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/grayscale-pdf")({
  head: () =>
    seoHead({
      title: "Grayscale PDF — Convert PDF to Black and White — MY PDF FIX",
      description:
        "Convert a colour PDF to black and white (grayscale) for cheaper printing. Free, private and processed in your browser.",
      path: "/grayscale-pdf",
    }),
  component: () => <ToolPage slug="grayscale-pdf" />,
});
