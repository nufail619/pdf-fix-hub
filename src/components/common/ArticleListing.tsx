import { useId, useState } from "react";
import { Link } from "@tanstack/react-router";
import type { Article } from "@/data/article";
import { articleDate } from "@/lib/article-date";

export function ArticleListing({
  articles,
  kind,
}: {
  articles: Article[];
  kind: "blog" | "guides";
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const categories = [...new Set(articles.flatMap((article) => article.categories))].sort();
  const visible = articles.filter(
    (article) =>
      (!category || article.categories.includes(category)) &&
      `${article.title} ${article.excerpt} ${article.categories.join(" ")}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${id}-search`} className="text-sm font-semibold">
          Search {kind === "blog" ? "blog posts" : "guides"}
          <input
            id={`${id}-search`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"
          />
        </label>
        <div className="text-sm font-semibold">
          <label htmlFor={`${id}-category`}>Category</label>
          <select
            id={`${id}-category`}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3"
          >
            <option value="">All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p role="status" className="mt-4 text-sm text-muted-foreground">
        {visible.length} {visible.length === 1 ? "article" : "articles"} found
      </p>
      {visible.length === 0 && (
        <div className="mt-6 rounded-xl border border-border p-8 text-center">
          <p>
            {articles.length
              ? "No articles match your search."
              : "There are no published articles here yet."}
          </p>
          {articles.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("");
              }}
              className="mt-3 text-primary underline"
            >
              Show all articles
            </button>
          )}
        </div>
      )}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((article) => (
          <Link
            key={article.slug}
            to={kind === "blog" ? "/blog/$slug" : "/guides/$slug"}
            params={{ slug: article.slug }}
            className="group flex min-w-0 h-full flex-col rounded-2xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <time dateTime={article.date}>{articleDate(article.date)}</time> · {article.readTime}
            </div>
            {article.featuredImage && (
              <img
                src={article.featuredImage}
                alt={article.featuredImageAlt}
                loading="lazy"
                decoding="async"
                className="mt-4 aspect-video w-full rounded-lg object-cover"
              />
            )}
            <h2 className="mt-3 break-words text-xl font-bold group-hover:text-primary">
              {article.title}
            </h2>
            <p className="mt-3 flex-1 break-words text-muted-foreground">{article.excerpt}</p>
            {article.categories.length > 0 && (
              <p className="mt-3 text-xs text-muted-foreground">{article.categories.join(" · ")}</p>
            )}
            <span className="mt-4 font-semibold text-primary">
              {kind === "blog" ? "Read article" : "Read guide"} →
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
