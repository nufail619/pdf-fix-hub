import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/edit-pdf-metadata")({
  head: () =>
    seoHead({
      title: "Edit PDF Metadata — Change Title, Author and Keywords — MY PDF FIX",
      description:
        "View, edit or remove PDF metadata such as title, author, subject and keywords. Free, private and runs in your browser.",
      path: "/edit-pdf-metadata",
    }),
  component: () => <ToolPage slug="edit-pdf-metadata" />,
});
