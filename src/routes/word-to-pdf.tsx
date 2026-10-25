import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/word-to-pdf")({
  head: () =>
    seoHead({
      title: "Word to PDF — Convert DOCX to PDF Free — MY PDF FIX",
      description:
        "Convert Word .docx documents to PDF with selectable text, headings, lists, tables and images. Free and private, right in your browser.",
      path: "/word-to-pdf",
    }),
  component: () => <ToolPage slug="word-to-pdf" />,
});
