import { Accordion } from "@/components/common/Accordion";
import { faqs } from "@/data/faqs";

export function FAQ() {
  return (
    <section className="bg-section py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Everything you wanted to know about working with PDFs in your browser.
        </p>
        <div className="mt-10">
          <Accordion items={faqs} />
        </div>
      </div>
    </section>
  );
}
