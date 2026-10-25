import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { SiteConfigProvider, defaultSiteConfig } from "@/context/SiteConfigContext";
import { HeadScripts } from "@/components/common/HeadScripts";
import { Layout } from "@/components/layout/Layout";
import { serializeStructuredData } from "@/lib/structured-data";
import { PrivacyPreferences } from "@/components/common/PrivacyPreferences";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find what you were looking for. Let's get you back on track.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-[60dvh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try refreshing, or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground hover:bg-primary-hover"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-background px-5 text-sm font-bold hover:bg-section"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: ({ matches }) => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        title: matches.some((match) => match.status === "notFound" || match._notFound)
          ? "Page not found — MY PDF FIX"
          : defaultSiteConfig.defaultTitle,
      },
      { name: "description", content: defaultSiteConfig.defaultDescription },
      { property: "og:site_name", content: defaultSiteConfig.siteName },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#E5322D" },
      {
        name: "robots",
        content:
          defaultSiteConfig.noIndex ||
          matches.some((match) => match.status === "notFound" || match._notFound)
            ? "noindex,nofollow"
            : "index,follow",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: serializeStructuredData({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: defaultSiteConfig.siteName,
          description: defaultSiteConfig.defaultDescription,
          url: defaultSiteConfig.siteUrl,
          logo: defaultSiteConfig.siteUrl + "/logo.svg",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <noscript>
          <p className="bg-section p-4 text-center">
            Enable JavaScript to use the PDF tools and admin panel. Published articles remain
            available to read.
          </p>
        </noscript>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <SiteConfigProvider>
        <PrivacyPreferences>
          <HeadScripts />
          <Layout>
            <Outlet />
          </Layout>
          <Toaster />
        </PrivacyPreferences>
      </SiteConfigProvider>
    </QueryClientProvider>
  );
}
