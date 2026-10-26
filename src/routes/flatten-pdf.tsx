import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/flatten-pdf")({
  head: () =>
    seoHead({
      title: "Flatten PDF — Form Fields and Annotations — MY PDF FIX",
      description:
        "Flatten form appearances or render pages as images. This does not lock the PDF or securely redact information. Processed in your browser.",
      path: "/flatten-pdf",
    }),
  component: () => <ToolPage slug="flatten-pdf" />,
});
