import { createFileRoute, Link } from "@tanstack/react-router";
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
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((p) => (
          <Link
            key={p.slug}
            to="/guides/$slug"
            params={{ slug: p.slug }}
            className="group flex h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {p.readTime}
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
            <span className="mt-4 font-semibold text-primary">Read guide →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
