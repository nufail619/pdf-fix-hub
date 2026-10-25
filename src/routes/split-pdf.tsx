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
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Split PDF Files Online — Extract Pages Instantly
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Splitting a PDF into smaller files is essential when you only need specific pages, want
            to share part of a document, or need to break a large file into manageable sections. Our
            free Split PDF tool lets you separate any PDF into one or more files by page range, all
            directly in your browser with complete privacy.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">How to Split a PDF</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              <strong>Upload your PDF.</strong> Drag and drop the file into the upload area, or
              click to browse from your device.
            </li>
            <li>
              <strong>Choose your split method.</strong> Enter the page ranges you want to extract
              (for example, "1-3, 7, 10-12") or split every page into its own file.
            </li>
            <li>
              <strong>Click "Split PDF".</strong> The tool processes your file instantly and
              prepares the output.
            </li>
            <li>
              <strong>Download your split files.</strong> Save the resulting PDFs to your device,
              individually or as a single ZIP.
            </li>
          </ol>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            Why Use MY PDF FIX to Split PDFs
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>
              <strong>Complete privacy.</strong> Files are processed locally in your browser — never
              uploaded.
            </li>
            <li>
              <strong>Flexible splitting.</strong> Extract single pages, custom ranges, or split
              every page automatically.
            </li>
            <li>
              <strong>No quality loss.</strong> Output PDFs keep the exact same resolution, fonts,
              and layout as the original.
            </li>
            <li>
              <strong>Free and unlimited.</strong> Split as many PDFs as you want, with no daily
              limits or watermarks.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Common Use Cases</h3>
          <p className="text-gray-600 leading-relaxed">
            Splitting PDFs is useful in many real-world situations. Teachers extract individual
            chapters from textbooks to share with students. Legal professionals separate exhibits
            from a master case file. HR teams break up large onboarding documents into role-specific
            sections. Researchers pull single articles out of bundled journal issues. Small business
            owners separate receipts, invoices, or contracts from scanned batches.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Tips for Better Results</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-600 leading-relaxed">
            <li>Plan your ranges before uploading — write down which pages you need to extract.</li>
            <li>
              Use page ranges (like "5-10") instead of listing every page individually for cleaner
              splits.
            </li>
            <li>
              If you only need one page, the tool can extract it as a single-page PDF without
              re-processing the entire document.
            </li>
            <li>
              For very large PDFs, splitting first and then compressing each section can make
              sharing easier.
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
          <dl className="space-y-4 text-gray-600 leading-relaxed">
            <div>
              <dt className="font-semibold text-gray-900">Q: Is splitting a PDF safe?</dt>
              <dd>
                A: Yes. With MY PDF FIX, your file is processed entirely in your browser — it never
                touches our servers.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">
                Q: Can I split a password-protected PDF?
              </dt>
              <dd>
                A: You'll need to remove the password protection first. Once unlocked, the file can
                be split normally.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">
                Q: Will splitting reduce the quality of my pages?
              </dt>
              <dd>
                A: No. The extracted pages retain the original quality, fonts, images, and
                formatting exactly.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">
                Q: How many parts can I split a PDF into?
              </dt>
              <dd>
                A: There's no limit. You can split a PDF into as many sections as it has pages.
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-gray-900">Q: Does this work on mobile devices?</dt>
              <dd>
                A: Yes. The tool runs fully in your mobile browser with the same speed and privacy
                as on desktop.
              </dd>
            </div>
          </dl>
        </section>
      </article>
    </ToolPage>
  ),
});
