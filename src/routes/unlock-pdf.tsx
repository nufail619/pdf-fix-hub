import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/unlock-pdf")({
  head: () =>
    seoHead({
      title: "Unlock PDF with Your Password — MY PDF FIX",
      description:
        "Remove supported PDF password protection with permission and a valid password. Files and passwords stay in your browser. No password recovery or uploads.",
      path: "/unlock-pdf",
    }),
  component: () => <ToolPage slug="unlock-pdf" />,
});
