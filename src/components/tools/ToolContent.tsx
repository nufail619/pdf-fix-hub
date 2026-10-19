import { toolContent } from "@/data/toolContent";

/** Long-form help text, steps and FAQ for a tool page (with FAQ structured data). */
export function ToolContent({ slug }: { slug: string }) {
  const c = toolContent[slug];
  if (!c) return null;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: c.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-12 text-foreground">
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">{c.heading}</h2>
        {c.intro.map((p, i) => (
          <p key={i} className="text-base leading-relaxed text-muted-foreground">
            {p}
          </p>
        ))}
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">How to use it</h3>
        <ol className="list-decimal space-y-3 pl-6 text-base leading-relaxed text-muted-foreground">
          {c.steps.map(([title, body]) => (
            <li key={title}>
              <strong className="text-foreground">{title}</strong> {body}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">{c.tipsTitle}</h3>
        <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
          {c.tips.map(([title, body]) => (
            <li key={title}>
              <strong className="text-foreground">{title}</strong> {body}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h3 className="text-2xl font-semibold">Frequently asked questions</h3>
        <div className="space-y-5">
          {c.faqs.map((f) => (
            <div key={f.q}>
              <h4 className="font-semibold">{f.q}</h4>
              <p className="mt-1 text-base leading-relaxed text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
    </article>
  );
}
