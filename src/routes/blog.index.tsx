import { createFileRoute } from "@tanstack/react-router";
import { ArticleListing } from "@/components/common/ArticleListing";
import { seoHead } from "@/components/common/SEO";
import { blogPosts } from "@/data/blogPosts";

export const Route = createFileRoute("/blog/")({
  head: () =>
    seoHead({
      title: "Blog — MY PDF FIX",
      description:
        "Practical articles about PDFs, document workflows, and digital privacy from the MY PDF FIX team.",
      path: "/blog",
    }),
  component: Blog,
});

function Blog() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold sm:text-5xl">The MY PDF FIX Blog</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
        Tips, deep-dives, and the occasional opinion piece — all about working smarter with PDFs.
      </p>
      <ArticleListing articles={blogPosts} kind="blog" />
    </div>
  );
}
