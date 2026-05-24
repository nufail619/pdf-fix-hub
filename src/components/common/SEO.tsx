import { useSiteConfig } from "@/context/SiteConfigContext";

/**
 * Returns a TanStack Router head() payload. Use:
 *   head: () => seoHead({ title, description, path })
 * Note: useSiteConfig() cannot run inside head(); pass static strings.
 */
export function seoHead(opts: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  ogType?: string;
}) {
  const { title, description, path, ogImage, ogType = "website" } = opts;
  const meta = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: path },
    { property: "og:type", content: ogType },
    { name: "twitter:card", content: ogImage ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    ...(ogImage
      ? [
          { property: "og:image", content: ogImage },
          { name: "twitter:image", content: ogImage },
        ]
      : []),
  ];
  return {
    meta,
    links: [{ rel: "canonical", href: path }],
  };
}

// Lightweight runtime SEO hook for components that need site config.
export function useDefaultSeo() {
  return useSiteConfig();
}
