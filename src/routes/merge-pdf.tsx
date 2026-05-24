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
          <h2 className="text-3xl font-bold">
            Merge PDF Files Online — Free, Fast, and Private
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Combining multiple PDF documents into a single file is one of the most
            common tasks for students, professionals, and anyone who works with
            digital paperwork. Whether you need to assemble a report from several
            drafts, bundle invoices for a client, or compile research papers into
            one easy-to-share document, our free Merge PDF tool gets it done in
            seconds — right in your browser, with no uploads to any server.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">How to Merge PDF Files</h3>
          <ol className="list-decimal space-y-3 pl-6 text-base leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Upload your PDFs.</strong> Drag
              and drop your files into the upload area, or click to browse and
              select them from your device. You can add as many PDFs as you need.
            </li>
            <li>
              <strong className="text-foreground">Arrange the order.</strong> Drag
              the file thumbnails to reorder them. The order shown is the order
              they'll appear in the merged document.
            </li>
            <li>
              <strong className="text-foreground">Click "Merge PDF".</strong> Our
              tool combines your files into a single PDF in seconds.
            </li>
            <li>
              <strong className="text-foreground">Download your merged file.</strong>{" "}
              Save the combined PDF to your device — ready to share, print, or
              archive.
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">
            Why Use MY PDF FIX to Merge PDFs
          </h3>
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">100% private.</strong> Your files
              never leave your device. All processing happens locally in your
              browser.
            </li>
            <li>
              <strong className="text-foreground">No file size limits.</strong>{" "}
              Merge PDFs of any size without paying for a premium plan.
            </li>
            <li>
              <strong className="text-foreground">No registration required.</strong>{" "}
              Just open the page and start merging — no email, no account.
            </li>
            <li>
              <strong className="text-foreground">Works on any device.</strong>{" "}
              Windows, Mac, Linux, Android, iOS — if it runs a modern browser, it
              runs our tool.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Common Use Cases</h3>
          <p className="text-base leading-relaxed text-muted-foreground">
            Merging PDFs is useful in countless situations. Job seekers combine
            their resume, cover letter, and portfolio into one document for
            cleaner submissions. Accountants merge monthly invoices into quarterly
            statements. Legal teams compile case files, exhibits, and
            correspondence into a single reference document. Students combine
            lecture notes, assignment drafts, and research articles into one study
            packet. Real estate professionals bundle property listings, contracts,
            and inspection reports for clients.
          </p>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Tips for Better Results</h3>
          <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed text-muted-foreground">
            <li>
              Rename your source files clearly before uploading so the merge order
              is easier to track.
            </li>
            <li>
              If your final merged file is large, use our Compress PDF tool
              afterward to reduce its size for email or web sharing.
            </li>
            <li>
              Check the page orientation of each source PDF — mixing portrait and
              landscape pages is fine, but the final document will retain each
              page's original layout.
            </li>
            <li>
              For sensitive documents, our browser-based processing means nothing
              is ever transmitted online — perfect for legal, medical, or
              financial files.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="text-2xl font-semibold">Frequently Asked Questions</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Q: Is it safe to merge PDFs online?
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A: With MY PDF FIX, yes — completely. We process everything in
                your browser, so your files are never uploaded to our servers or
                stored anywhere.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Q: How many PDFs can I merge at once?
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A: There's no fixed limit. You can merge dozens of PDFs in a
                single operation, limited only by your device's available memory.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Q: Will merging affect the quality of my PDFs?
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A: No. The original pages are preserved exactly as they were —
                same resolution, same fonts, same images.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Q: Can I merge password-protected PDFs?
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A: You'll need to remove the password protection first. Once
                unlocked, the files can be merged normally.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">
                Q: Does this work on my phone?
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                A: Yes. The tool is fully mobile responsive and processes files
                directly in your mobile browser.
              </p>
            </div>
          </div>
        </section>
      </article>
    </ToolPage>
  ),
});
