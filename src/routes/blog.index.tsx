import { createFileRoute, Link, notFound } from "@tanstack/react-router";
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
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p) => (
          <Link
            key={p.slug}
            to="/blog/$slug"
            params={{ slug: p.slug }}
            className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {new Date(p.date).toLocaleDateString("en", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              · {p.readTime}
            </div>
            {p.featuredImage && (
              <img
                src={p.featuredImage}
                alt={p.featuredImageAlt}
                loading="lazy"
                className="mt-4 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <h2 className="mt-3 text-xl font-bold group-hover:text-primary">{p.title}</h2>
            <p className="mt-3 flex-1 text-muted-foreground">{p.excerpt}</p>
            <span className="mt-4 font-semibold text-primary">Read article →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// Ensure notFound is referenced (kept for parity with $slug)
void notFound;
