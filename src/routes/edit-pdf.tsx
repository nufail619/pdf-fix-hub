import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/edit-pdf")({
  head: () =>
    seoHead({
      title: "Edit PDF — Add Text, Shapes and Highlights — MY PDF FIX",
      description:
        "Replace supported existing PDF text, add formatted text boxes and annotations, and use undo, redo and zoom. Local processing; whiteout is not secure redaction.",
      path: "/edit-pdf",
    }),
  component: () => <ToolPage slug="edit-pdf" />,
});
