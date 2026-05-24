import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/cookie-policy")({
  head: () =>
    seoHead({
      title: "Cookie Policy — MY PDF FIX",
      description:
        "What cookies MY PDF FIX uses, why we use them, and how you can control them.",
      path: "/cookie-policy",
    }),
  component: CookiePolicy,
});

function CookiePolicy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          A cookie is a small text file stored on your device when you visit a
          website. Cookies serve many purposes — remembering preferences, keeping
          you signed in, measuring how a site is used, and showing ads. This policy
          explains which cookies MY PDF FIX uses and why.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Essential cookies</h2>
        <p>
          We may use a small number of essential cookies to remember your interface
          preferences, such as your last-used category filter on the home page.
          These cookies do not identify you and cannot be used for tracking.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Analytics cookies</h2>
        <p>
          If analytics is enabled, we use privacy-friendly tools that count visits
          in aggregate. These cookies (or browser storage equivalents) record the
          page you visited and basic environmental data such as country and device
          type. They do not record personal information or track you across other
          websites.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Advertising cookies</h2>
        <p>
          If we display ads on a page, the ad provider may set its own cookies.
          These cookies are controlled by the ad network, not by us. You can
          usually opt out of personalized advertising through the network's
          settings or by using browser controls.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Managing cookies</h2>
        <p>
          You can clear cookies, block them entirely, or set your browser to ask
          before storing each one. Most browsers offer these controls in their
          privacy or security settings. Blocking essential cookies may prevent
          parts of the site from working as expected.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Changes</h2>
        <p>
          We may update this policy as our cookie usage evolves. The "last updated"
          date at the top of the page will always reflect the current version.
        </p>
      </section>
    </article>
  );
}
