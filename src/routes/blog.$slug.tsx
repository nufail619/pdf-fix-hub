import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { serializeStructuredData } from "@/lib/structured-data";
import { ArticleBody } from "@/components/common/ArticleBody";
import { seoHead } from "@/components/common/SEO";
import { blogPosts } from "@/data/blogPosts";
import { articleDate } from "@/lib/article-date";
import { defaultSiteConfig } from "@/context/SiteConfigContext";

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
            description: loaderData.seoDescription,
            path: `/blog/${loaderData.slug}`,
            ogType: "article",
            ogImage: loaderData.featuredImage || undefined,
          }),
          scripts: [
            {
              type: "application/ld+json",
              children: serializeStructuredData({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: loaderData.title,
                description: loaderData.seoDescription,
                datePublished: loaderData.date,
                url: `${defaultSiteConfig.siteUrl}/blog/${loaderData.slug}`,
                mainEntityOfPage: `${defaultSiteConfig.siteUrl}/blog/${loaderData.slug}`,
                image:
                  defaultSiteConfig.siteUrl +
                  (loaderData.featuredImage || defaultSiteConfig.defaultOgImage),
                articleSection: loaderData.categories,
                publisher: {
                  "@type": "Organization",
                  name: defaultSiteConfig.siteName,
                  logo: { "@type": "ImageObject", url: defaultSiteConfig.siteUrl + "/logo.svg" },
                },
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
      <h1 className="mt-4 break-words text-4xl font-bold sm:text-5xl">{post.title}</h1>
      <div className="mt-4 text-sm text-muted-foreground">
        <time dateTime={post.date}>{articleDate(post.date)}</time> · {post.author} · {post.readTime}
      </div>
      {post.featuredImage && (
        <img
          src={post.featuredImage}
          alt={post.featuredImageAlt}
          className="mt-8 w-full rounded-xl"
        />
      )}
      {post.categories.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">{post.categories.join(" · ")}</p>
      )}
      <ArticleBody body={post.body} />
    </article>
  );
}
