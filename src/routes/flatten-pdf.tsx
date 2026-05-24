import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/flatten-pdf")({
  head: () =>
    seoHead({
      title: "Flatten PDF — MY PDF FIX",
      description: "Flatten form fields and annotations into the page content.",
      path: "/flatten-pdf",
    }),
  component: () => <ToolPage slug="flatten-pdf" />,
});
