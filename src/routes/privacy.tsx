import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy — MY PDF FIX",
      description:
        "Our privacy policy explains exactly what data MY PDF FIX collects and how we handle your files.",
      path: "/privacy",
    }),
  component: Privacy,
});

function Privacy() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          MY PDF FIX is designed around a single privacy promise: your files stay on
          your device. Every tool labelled "Processed locally in your browser" runs
          entirely in your web browser using WebAssembly. We do not receive, store,
          or have access to those files at any point.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Files you upload</h2>
        <p>
          Client-side tools load your file into your browser's memory, process it
          locally, and produce a download. Nothing about the file — neither its
          contents, its name, its size, nor metadata — is transmitted to our
          servers. You can verify this by disconnecting from the internet after
          loading the page; the tool will continue to work.
        </p>
        <p>
          A small number of tools are labelled "Coming soon — requires server
          processing." Those tools are not active. If we enable them in the future,
          we will update this policy to describe exactly what happens to files
          processed through them, with the same plain-language commitment to delete
          files immediately after processing.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Analytics</h2>
        <p>
          We may use privacy-friendly analytics to count page views and understand
          which tools are most popular. These analytics record only aggregate
          information — country-level location, device type, referring page. We do
          not use cookies that track you across other websites. Where analytics are
          enabled, no personal information is captured.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Cookies</h2>
        <p>
          We do not set tracking cookies. We may use a single technical cookie to
          remember user interface preferences such as your last-used filter on the
          home page. See our Cookie Policy for the full breakdown.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Advertising</h2>
        <p>
          We may display contextual ads on certain pages to fund hosting and
          development. Ad networks may use their own cookies; please review their
          policies. We never share information about your files with advertisers
          because we don't have any to share.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Contact form</h2>
        <p>
          If you write to us through the contact form, we receive your name, email,
          and message. We use that information only to reply to you and keep it for
          as long as needed to handle the conversation. We do not add you to any
          marketing list.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Your rights</h2>
        <p>
          Because we don't store your files or build profiles about you, most data
          rights requests don't apply. If you've contacted us by email and want
          your message deleted, write to us and we'll remove it.
        </p>

        <h2 className="mt-8 text-2xl font-bold text-foreground">Changes to this policy</h2>
        <p>
          We may update this policy as the product evolves. Material changes will
          be announced on the homepage. The "last updated" date at the top will
          always reflect the current version.
        </p>
      </section>
    </article>
  );
}
