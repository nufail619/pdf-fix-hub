import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { useSiteConfig } from "@/context/SiteConfigContext";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Service — MY PDF FIX",
      description: "The terms for using MY PDF FIX, in plain English.",
      path: "/terms",
    }),
  component: Terms,
});

function Terms() {
  const { contactEmail } = useSiteConfig();
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: 19 October 2026</p>
      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          By using MY PDF FIX (mypdffix.com) you agree to these terms. The site is operated by
          Mohamed Nufail / WOWZOO (PVT) LTD, Sri Lanka.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">The service</h2>
        <p>
          MY PDF FIX offers free tools for working with PDF files in your browser. The tools are
          provided “as is”. We try to keep them working well, but we do not guarantee specific
          results or uninterrupted availability.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Acceptable use</h2>
        <p>
          You may use the site for any lawful purpose. Do not use it to process content you have no
          right to handle, to break the law, or to interfere with the site or other users.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Your files</h2>
        <p>
          You keep all rights to your files. They are processed on your own device and are never
          sent to us.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Liability</h2>
        <p>
          To the extent allowed by law, we are not liable for any loss or damage arising from use of
          the site, including loss of data. Please keep a backup of important files before
          processing them.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Governing law</h2>
        <p>These terms are governed by the laws of Sri Lanka.</p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Changes</h2>
        <p>
          We may update these terms. The date at the top of the page shows the latest version.
          Continued use of the site means you accept the updated terms.
        </p>
        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact</h2>
        <p>
          Questions about these terms? Email{" "}
          <a className="text-primary hover:underline" href={`mailto:${contactEmail}`}>
            {contactEmail}
          </a>
          .
        </p>
      </section>
    </article>
  );
}
