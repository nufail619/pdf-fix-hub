import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { useSiteConfig } from "@/context/SiteConfigContext";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    seoHead({
      title: "Disclaimer — MY PDF FIX",
      description: "Important information about the limits of the MY PDF FIX tools and content.",
      path: "/disclaimer",
    }),
  component: Disclaimer,
});

function Disclaimer() {
  const { contactEmail } = useSiteConfig();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Disclaimer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 19 October 2026</p>
      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          The tools and information on MY PDF FIX (mypdffix.com) are provided for general use only.
          The site is operated by Mohamed Nufail / WOWZOO (PVT) LTD, Sri Lanka.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">No warranty</h2>
        <p>
          We work to make the tools accurate and reliable, but we make no promise that results will
          be error-free or suit your purpose. Check the output before you rely on it, and keep a
          copy of your original files.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Not professional advice</h2>
        <p>
          Nothing on this site is legal, financial, medical or other professional advice. Our guides
          and articles are for general information.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Compression and conversion</h2>
        <p>
          Tools that compress, convert or flatten files can change how a document looks. Quality and
          layout of the result may differ from the original, especially for Word to PDF conversions
          of complex documents.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Third-party links and ads</h2>
        <p>
          The site may link to other websites and show ads from Google AdSense. We do not control
          those sites or advertisers and are not responsible for their content.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact</h2>
        <p>
          Questions? Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
