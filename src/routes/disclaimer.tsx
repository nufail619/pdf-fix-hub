import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";

export const Route = createFileRoute("/disclaimer")({
  head: () =>
    seoHead({
      title: "Disclaimer — MY PDF FIX",
      description:
        "Important information about the limitations of MY PDF FIX and the responsibility of users.",
      path: "/disclaimer",
    }),
  component: Disclaimer,
});

function Disclaimer() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-4xl font-bold">Disclaimer</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: May 2026</p>

      <section className="mt-10 space-y-4 text-muted-foreground">
        <p>
          MY PDF FIX provides general-purpose tools for working with PDF documents.
          The information and tools on this site are provided for informational and
          utility purposes only and do not constitute legal, financial, medical, or
          professional advice of any kind.
        </p>
        <p>
          While we strive for accuracy and reliability, we make no representations
          or warranties of any kind, express or implied, about the completeness,
          accuracy, reliability, suitability, or availability of the website or the
          tools, text, graphics, or related information contained on the site for
          any purpose.
        </p>
        <p>
          Any reliance you place on the tools or information is therefore strictly
          at your own risk. We strongly recommend keeping backups of any important
          documents before processing them with any tool — ours included. In no
          event will we be liable for any loss or damage, including without
          limitation indirect or consequential loss or damage, arising from the use
          of this website or its tools.
        </p>
        <p>
          External links on this website that lead to other sites are provided for
          convenience. We have no control over the content, accuracy, or nature of
          those sites and do not endorse the views expressed within them.
        </p>
        <p>
          By using this website, you accept this disclaimer in full. If you
          disagree with any part of it, please do not use the site.
        </p>
      </section>
    </article>
  );
}
