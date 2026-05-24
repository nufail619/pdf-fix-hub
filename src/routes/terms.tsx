import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Service — MY PDF FIX",
      description:
        "The terms that govern your use of MY PDF FIX. Plain language, no surprises.",
      path: "/terms",
    }),
  component: Terms,
});

function Terms() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          By using MY PDF FIX, you agree to these terms. They are intentionally
          short and written in plain English, so please take a moment to read them.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">The service</h2>
        <p>
          MY PDF FIX provides browser-based tools for working with PDF files. The
          tools are provided "as is" without warranty. We do our best to keep them
          working correctly, but we make no guarantees about specific outputs or
          uninterrupted availability.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Acceptable use</h2>
        <p>
          You may use MY PDF FIX for any lawful purpose. You may not use it to
          process content that is illegal where you are located, to harass others,
          or to attempt to interfere with the service for other users. Automated
          scraping at a rate that degrades the service is not allowed.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Your content</h2>
        <p>
          You retain all rights to the files you process. Because client-side tools
          run in your browser, we never receive a copy of your file and have no
          claim to it. For tools that may eventually require server processing,
          your file is used only to produce the requested output and is deleted
          immediately afterward.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Liability</h2>
        <p>
          To the maximum extent allowed by law, MY PDF FIX is not liable for any
          indirect, incidental, or consequential damages arising from your use of
          the service. Always keep a backup of important files before processing
          them with any tool, including ours.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Changes</h2>
        <p>
          We may update these terms from time to time. If we make material changes,
          we'll note it on the homepage. Continued use of the service after a
          change constitutes acceptance of the new terms.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact</h2>
        <p>
          Questions about these terms? Reach out through the contact page and we'll
          do our best to clarify.
        </p>
      </section>
    </article>
  );
}
