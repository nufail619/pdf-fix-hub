import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/flatten-pdf")({
  head: () =>
    seoHead({
      title: "Flatten PDF — Lock Form Fields and Annotations — MY PDF FIX",
      description:
        "Flatten PDF forms, comments and annotations so they can't be edited. Free, private and processed in your browser.",
      path: "/flatten-pdf",
    }),
  component: () => <ToolPage slug="flatten-pdf" />,
});
