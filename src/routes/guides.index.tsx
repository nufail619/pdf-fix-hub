import { createFileRoute } from "@tanstack/react-router";
import { ArticleListing } from "@/components/common/ArticleListing";
import { seoHead } from "@/components/common/SEO";
import { guides } from "@/data/guides";

export const Route = createFileRoute("/guides/")({
  head: () =>
    seoHead({
      title: "Guides — MY PDF FIX",
      description:
        "Step-by-step guides for every common PDF task. Written for non-technical readers.",
      path: "/guides",
    }),
  component: Guides,
});

function Guides() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">Guides</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Deeper walkthroughs for the trickier corners of working with PDFs.
      </p>
      <ArticleListing articles={guides} kind="guides" />
    </div>
  );
}
