import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { blogPosts } from "@/data/blogPosts";

export const Route = createFileRoute("/blog/$slug")({
  loader: ({ params }) => {
    const post = blogPosts.find((p) => p.slug === params.slug);
    if (!post) throw notFound();
    return post;
  },
  head: ({ loaderData }) =>
    loaderData
      ? {
          ...seoHead({
            title: `${loaderData.title} — MY PDF FIX Blog`,
            description: loaderData.excerpt,
            path: `/blog/${loaderData.slug}`,
            ogType: "article",
          }),
          scripts: [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: loaderData.title,
                description: loaderData.excerpt,
                datePublished: loaderData.date,
                author: { "@type": "Organization", name: loaderData.author },
              }),
            },
          ],
        }
      : { meta: [{ title: "Article — MY PDF FIX" }] },
  component: Post,
});

function Post() {
  const post = Route.useLoaderData();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">
        ← Back to blog
      </Link>
      <h1 className="mt-4 text-4xl font-bold sm:text-5xl">{post.title}</h1>
      <div className="mt-4 text-sm text-muted-foreground">
        {new Date(post.date).toLocaleDateString("en", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · {post.author} · {post.readTime}
      </div>
      <div className="mt-8 space-y-5 text-lg leading-relaxed text-foreground">
        {post.body.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </article>
  );
}
