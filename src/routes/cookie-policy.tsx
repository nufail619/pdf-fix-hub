import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { useSiteConfig } from "@/context/SiteConfigContext";

export const Route = createFileRoute("/cookie-policy")({
  head: () =>
    seoHead({
      title: "Cookie Policy — MY PDF FIX",
      description:
        "Which cookies MY PDF FIX may use through Google Analytics and Google AdSense, and how to control them.",
      path: "/cookie-policy",
    }),
  component: CookiePolicy,
});

function CookiePolicy() {
  const { contactEmail } = useSiteConfig();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 19 October 2026</p>
      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          A cookie is a small text file stored on your device by a website. This policy explains
          which cookies may be used on MY PDF FIX (mypdffix.com), operated by Mohamed Nufail /
          WOWZOO (PVT) LTD, Sri Lanka.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Cookies from MY PDF FIX</h2>
        <p>
          The site itself does not set cookies to track you. The PDF tools work entirely in your
          browser and do not need cookies.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Google Analytics</h2>
        <p>
          We may use Google Analytics to count visits and see which pages are popular. It uses
          cookies to recognise a browser between visits and records information such as pages
          viewed, device type and approximate location.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Google AdSense</h2>
        <p>
          We may show ads through Google AdSense. Google and its advertising partners may use
          cookies to show and measure ads, including personalised ads. Learn more in{" "}
          <a
            className="text-primary hover:underline"
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            How Google uses data from sites that use our services
          </a>
          , and manage your ad preferences in{" "}
          <a
            className="text-primary hover:underline"
            href="https://adssettings.google.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>
          .
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Managing cookies</h2>
        <p>
          You can delete or block cookies in your browser settings. Blocking cookies will not stop
          the PDF tools from working. Where required, a consent message will let you choose whether
          non-essential cookies are used.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact</h2>
        <p>
          Questions about cookies? Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
