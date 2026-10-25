import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/adjust-pdf-brightness")({
  head: () =>
    seoHead({
      title: "Adjust PDF Brightness and Contrast — MY PDF FIX",
      description:
        "Adjust brightness and contrast on every PDF page with a before-and-after preview. Free and private in your browser. Output is an image-based PDF.",
      path: "/adjust-pdf-brightness",
    }),
  component: () => <ToolPage slug="adjust-pdf-brightness" />,
});
