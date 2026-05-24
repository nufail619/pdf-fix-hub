import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/extract-pdf-pages")({
  head: () =>
    seoHead({
      title: "Extract PDF Pages — MY PDF FIX",
      description: "Save selected pages of a PDF as a new file.",
      path: "/extract-pdf-pages",
    }),
  component: () => <ToolPage slug="extract-pdf-pages" />,
});
