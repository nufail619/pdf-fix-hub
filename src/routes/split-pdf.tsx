import { createFileRoute } from "@tanstack/react-router";
import { seoHead } from "@/components/common/SEO";
import { ToolPage } from "@/components/tools/ToolPage";

export const Route = createFileRoute("/split-pdf")({
  head: () =>
    seoHead({
      title: "Split PDF — MY PDF FIX",
      description: "Split a PDF into smaller files by page range, in your browser.",
      path: "/split-pdf",
    }),
  component: () => (
    <ToolPage slug="split-pdf">
      <article className="mx-auto max-w-3xl py-12 space-y-8 px-4">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Split a PDF by page ranges</h2>
          <p className="leading-relaxed text-muted-foreground">
            Create a separate PDF for each comma-separated page or range. Use the physical page
            positions shown by your viewer, starting at 1; printed labels such as “iii” or “A-1” are
            not input values. Document contents are processed in your browser without upload.
          </p>
        </section>
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">How to split</h3>
          <ol className="list-decimal space-y-3 pl-6 text-muted-foreground">
            <li>Add one PDF and check its page count in your viewer.</li>
            <li>
              Enter the ranges. For a six-page document, <code>1-2, 3-6</code> requests a two-page
              PDF and a four-page PDF.
            </li>
            <li>
              Click <strong>Process</strong>. One range downloads as a PDF; multiple ranges are
              bundled automatically into one ZIP.
            </li>
            <li>
              Extract the ZIP if needed, open every output PDF and check the first and last pages of
              each section.
            </li>
          </ol>
        </section>
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Single pages and combined selections</h3>
          <p className="text-muted-foreground">
            Enter <code>3</code> for just page three. To create three individual PDFs from a
            three-page original, enter <code>1, 2, 3</code>. There is no one-click “every page”
            mode, bookmark splitter or target-file-size option. If you want pages 1–2 and 5 together
            in one PDF, use Extract Pages with <code>1-2, 5</code> instead.
          </p>
        </section>
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Before sharing</h3>
          <p className="text-muted-foreground">
            Keep the original and check that you selected the intended pages. Splitting copies page
            content rather than rasterizing it, but it is not a hidden-data sanitizer and may change
            document-wide features such as bookmarks or signatures. Large files can exceed browser
            memory. A range with fewer pages does not guarantee a particular megabyte size:
            image-heavy pages can still be large.
          </p>
        </section>
      </article>
    </ToolPage>
  ),
});
