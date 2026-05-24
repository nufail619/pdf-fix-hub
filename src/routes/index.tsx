import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { Hero } from "@/components/home/Hero";
import { ToolGrid } from "@/components/home/ToolGrid";
import { Features } from "@/components/home/Features";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FAQ } from "@/components/home/FAQ";
import { faqs } from "@/data/faqs";

export const Route = createFileRoute("/")({
  head: () => ({
    ...seoHead({
      title: "MY PDF FIX — Free Online PDF Tools, In Your Browser",
      description:
        "Every tool you need to work with PDFs in one place. Merge, split, compress, convert and edit PDFs for free — all processed locally in your browser.",
      path: "/",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />
      <ToolGrid />
      <Features />
      <HowItWorks />
      <FAQ />
    </>
  );
}
