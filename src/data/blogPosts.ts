export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  readTime: string;
  body: string[]; // paragraphs
};

export const blogPosts: BlogPost[] = [
  {
    slug: "merge-pdfs-without-losing-quality",
    title: "How to merge PDFs without losing quality",
    excerpt:
      "Combining PDFs sounds simple, but a careless merge can balloon file size or scramble bookmarks. Here's the right way.",
    date: "2026-04-12",
    author: "The MY PDF FIX Team",
    readTime: "6 min read",
    body: [
      "Merging PDFs is one of the most common tasks in any office. You finish a report, your colleague sends over the appendix, and you need to deliver a single polished document by end of day. The temptation is to grab the first tool that pops up in a search result — and that's usually where things go wrong.",
      "The single biggest cause of quality loss during a merge is unnecessary re-encoding. Many free desktop apps and online tools rasterize PDF pages into images before stitching them back together. That converts crisp vector text into pixels, breaks searchable text, and triples the file size. The fix is to use a tool that copies pages byte-for-byte instead.",
      "MY PDF FIX's merge tool uses pdf-lib in your browser, which preserves the original page streams without re-encoding. That means your text stays sharp, your fonts stay embedded, and your file size stays close to the sum of the inputs.",
      "If you're combining files that came from different sources — say, a scan from a copier and a born-digital invoice — the scan will always be larger because it's an image. That's expected. What you want to avoid is the digital invoice becoming larger after the merge, which is the tell-tale sign of an inferior tool.",
      "A few small practices help even more. First, run a quick rotate pass on any scans that came in sideways before merging — it's much easier to fix one file than the combined result. Second, decide on page order before you start. Reordering after a merge is possible but tedious. Third, name your output something meaningful instead of leaving it as 'merged.pdf'; future-you will thank present-you.",
      "Finally, if confidentiality matters, double-check that the tool you use is processing the file locally. Anything that uploads your document to a server is creating a copy outside your control. Browser-based tools like ours run entirely on your device — nothing crosses the wire.",
    ],
  },
  {
    slug: "splitting-pdfs-the-right-way",
    title: "Splitting PDFs the right way: ranges, chunks, and bookmarks",
    excerpt:
      "There's more than one way to split a PDF. Picking the right method saves you minutes per file and avoids painful mistakes.",
    date: "2026-03-28",
    author: "The MY PDF FIX Team",
    readTime: "5 min read",
    body: [
      "When most people say 'split a PDF', they actually mean one of four very different things: extracting a single section, breaking a long file into individual pages, splitting at every bookmark, or chopping a document into equal-sized chunks. Using the wrong approach for your goal is the most common source of frustration.",
      "Extracting a section is the simplest case. You know you want pages 5 through 12, and that's it. Use a page-range syntax like '5-12' and you're done. This is the right approach for pulling a chapter out of a book or a specific report out of a binder.",
      "Splitting into individual pages is useful when you need to email or share single pages without exposing the rest of the document. Think tax forms, contract signature pages, or evidence exhibits. Look for a tool that lets you do this in one click rather than running 200 individual extracts.",
      "Splitting at bookmarks is the power move for long structured documents — textbooks, government reports, technical manuals. If the original PDF has a clean table of contents wired to bookmarks, you can produce one file per section automatically. This is a server-side feature in most tools because bookmark parsing is finicky.",
      "Finally, chunking by size matters when you're sending files through systems that have upload limits, like email attachments capped at 25 MB. Split-by-size tools target a maximum file size and produce as many output files as needed to fit.",
      "Whichever method you choose, name your outputs carefully. 'document-pages-5-12.pdf' is much more useful than 'document_split_1.pdf' three months from now.",
    ],
  },
  {
    slug: "pdf-privacy-where-files-go",
    title: "Where do your PDFs actually go? A plain-English guide to PDF privacy",
    excerpt:
      "Free online tools are everywhere — but most of them upload your files to a server. Here's what that means for you, and how to avoid it.",
    date: "2026-03-10",
    author: "The MY PDF FIX Team",
    readTime: "7 min read",
    body: [
      "Every week, millions of PDFs are uploaded to free conversion sites. Tax returns, medical records, signed contracts, family photos — all of it leaves the safety of the person's laptop and lands on a server somewhere. Most users have no idea this is happening, and even when they do, the trade-off feels acceptable. After all, the tool worked, the file converted, and nothing bad obviously happened.",
      "The trouble is that nothing bad usually happens visibly. The privacy cost is silent: copies of your file accumulate in caches, backup systems, and the occasional security incident. Most services have policies that say files are deleted after 24 hours, and many honor those policies — but you have no way to verify it, and the policy can change without notice.",
      "There's a simpler, safer alternative: tools that run entirely in your browser. Modern web standards like WebAssembly let JavaScript do real work — including PDF manipulation — without uploading anything. The file is opened, read, and written back, all on your own device. The 'server' in this case is your laptop.",
      "How can you tell which is which? Three signals. First, check the privacy policy or FAQ — reputable tools say so explicitly. Second, watch your network tab in developer tools: a browser-based tool will not send your file's bytes anywhere. Third, try the tool offline. If it still works without an internet connection, it's running locally.",
      "There are legitimate cases where a server is necessary — heavy OCR, complex format conversion, anything that needs proprietary fonts. In those cases, look for tools that delete files immediately after processing and don't keep logs. But for the bread-and-butter tasks — merging, splitting, rotating, watermarking, adding page numbers — there's no reason to send your file across the internet.",
      "MY PDF FIX is built around this principle. Every tool labeled 'Processed locally in your browser' does exactly that, no asterisks. When we eventually add tools that need server processing, we'll label them clearly so you can make an informed choice.",
    ],
  },
];
