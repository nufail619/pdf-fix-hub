import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/edit-pdf")({
  head: () =>
    seoHead({
      title: "Edit PDF — Add Text, Shapes and Highlights — MY PDF FIX",
      description:
        "Edit PDF pages visually in your browser. Add, move and delete text, shapes, highlights and whiteout overlays. Whiteout is not secure redaction.",
      path: "/edit-pdf",
    }),
  component: () => <ToolPage slug="edit-pdf" />,
});
