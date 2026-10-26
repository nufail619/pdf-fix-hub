import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/merge-pdf")({
  head: () =>
    seoHead({
      title: "Merge PDF — MY PDF FIX",
      description: "Combine multiple PDFs into one document, free and online.",
      path: "/merge-pdf",
    }),
  component: () => (
    <ToolPage slug="merge-pdf">
      <article className="mx-auto max-w-3xl py-12 space-y-8 text-foreground">
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Combine PDFs in file-list order</h2>
          <p className="leading-relaxed text-muted-foreground">
            Use Merge PDF to assemble a report and appendix, or collect several invoices in one
            document. The tool copies pages without rendering them as images. It does not upload
            your document contents, but loading the website and Google verification can still make
            network requests.
          </p>
        </section>
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">How to merge</h3>
          <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
            <li>Add your PDFs and check the displayed file list.</li>
            <li>Files merge in that order. Remove and re-add a file to place it at the end.</li>
            <li>
              Click <strong>Process</strong>, then Download to save the combined PDF.
            </li>
            <li>Open the download and check the first page, file boundaries and final page.</li>
          </ol>
        </section>
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Example: a report and appendix</h3>
          <p className="text-muted-foreground">
            For a three-page report followed by a two-page appendix, add the report first. The
            expected output has five pages, with the appendix beginning on page four. This is a
            workflow example, not a claim that your documents have been tested. Check searchable
            text, links and form fields that matter to you; document-wide bookmarks, signatures and
            interactive behavior may not survive a merge unchanged.
          </p>
        </section>
        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Limits and next steps</h3>
          <ul className="list-disc space-y-3 pl-6 text-muted-foreground">
            <li>
              There is no upload quota, but browser memory limits the files you can combine. On a
              phone, use smaller batches if processing fails.
            </li>
            <li>Keep your originals. Rewriting a signed PDF can invalidate its signature.</li>
            <li>
              Unlock supported encrypted files first, using a known password and authorization.
            </li>
            <li>
              Use Reorder Pages to rearrange the result, or Compress PDF to try to reduce its size.
              Neither a fixed output size nor a compression percentage is guaranteed.
            </li>
          </ul>
        </section>
      </article>
    </ToolPage>
  ),
});
