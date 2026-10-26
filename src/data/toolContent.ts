// Help content describes the current controls, output and limits of each tool.
// merge-pdf and split-pdf carry their own content inside their route files.

export type ToolContentEntry = {
  heading: string;
  intro: string[];
  steps: [string, string][];
  tipsTitle: string;
  tips: [string, string][];
  faqs: { q: string; a: string }[];
};

const PRIVATE: [string, string] = [
  "Private by design.",
  "The tool processes your document in your browser without uploading its contents. Loading the website and Google verification can still make network requests; see the Privacy Policy for optional services.",
];

export const toolContent: Record<string, ToolContentEntry> = {
  "adjust-pdf-brightness": {
    heading: "Adjust brightness and contrast across your PDF",
    intro: [
      "Make dark scans easier to read or improve faint document images. Compare the original and adjusted page before exporting.",
      "Every page is rendered as an image at 144 dpi with the same brightness and contrast settings. The visible page size and order are retained, including rotated pages.",
    ],
    steps: [
      ["Add your PDF.", "Select one document to load its page preview."],
      [
        "Adjust the sliders.",
        "Brightness lightens or darkens the image; contrast changes the separation between dark and light tones. Zero is neutral.",
      ],
      [
        "Check every page.",
        "Use Previous page and Next page to compare the Before and After images.",
      ],
      [
        "Process and download.",
        "The settings are applied to all pages, not just the previewed page.",
      ],
    ],
    tipsTitle: "Before you export",
    tips: [
      [
        "Keep your original.",
        "Rasterizing removes selectable text, links and interactive form fields. Filled form appearances are included as pixels.",
      ],
      ["Start gently.", "Extreme settings can hide faint handwriting or wash out detail."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Will the output have selectable text?",
        a: "No. Every page becomes an image. Keep the original if you need search, copying or accessibility text.",
      },
      {
        q: "Does this work with multipage PDFs?",
        a: "Yes. The same settings are applied to all pages, and you can preview each page.",
      },
    ],
  },
  "edit-pdf": {
    heading: "Replace supported text and add visual annotations",
    intro: [
      "Add notes, rectangles, ellipses, highlights and whiteout overlays without uploading your document. Choose any page, then drag elements into place or use the percentage position controls.",
      "Select Existing text to replace simple supported text objects, adjust their size, color and position, or delete them. The original font is retained; embedded fonts can only reuse characters present in that selected text. Unsupported layouts and scans are reported. Added boxes and shapes are overlays, not secure redaction.",
    ],
    steps: [
      ["Add a PDF.", "Wait for the visual page preview."],
      [
        "Add an element.",
        "Choose an existing text object for genuine replacement, or add a text box, rectangle, ellipse, highlight or whiteout. Added text supports font family, bold, italic, alignment and explicit line breaks.",
      ],
      [
        "Position and review.",
        "Drag and resize added elements, or use their percentage position controls. Use Undo, Redo, zoom and page navigation to review. Wait for the actual replacement preview before export.",
      ],
      ["Export.", "Click Process and download the edited copy. The original file is preserved."],
    ],
    tipsTitle: "Understand the editing limits",
    tips: [
      [
        "Whiteout is not secure redaction.",
        "A white rectangle only covers content visually. Text underneath can still be searched, copied or recovered. Never use whiteout to hide secrets.",
      ],
      [
        "Text support.",
        "Added text uses a standard Latin font. Unsupported characters or text wider than its element are reported before export.",
      ],
      [
        "Keep an editable original.",
        "After downloading, the overlays become page content. Keep this browser session open until you finish editing.",
      ],
      [
        "Existing form fields.",
        "Fields stay interactive by default and can appear above overlays. Select Flatten form fields in edited copy when covering a field; its visible value remains but the field becomes static. Other existing annotations can still appear above overlays.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I change the original text?",
        a: "Yes, for supported simple text objects. Select Existing text and apply a replacement. Basic Latin text and the current font are supported; embedded fonts are limited to characters already in the selected text. Scans, nested graphics and complex text are not universally editable. Replacement must fit the original width and does not reflow paragraphs.",
      },
      {
        q: "Can I remove confidential information with whiteout?",
        a: "No. Whiteout is not secure redaction. Use a dedicated redaction tool that actually removes the underlying content.",
      },
    ],
  },
  "unlock-pdf": {
    heading: "Remove PDF password protection with permission",
    intro: [
      "Use a valid password to create an unencrypted copy of a supported PDF that you own or are authorized to unlock. Standard password encryption is processed entirely on your device.",
      "Passwords are used only in memory for the current attempt, cleared from the form afterwards and never saved or uploaded. This tool does not guess or recover passwords.",
    ],
    steps: [
      ["Choose the protected PDF.", "Select a document you own or have permission to unlock."],
      [
        "Enter its password.",
        "Enter the opening or owner password. Leave it empty only for a file that opens without a password.",
      ],
      ["Confirm permission.", "Check the authorization box, then click Process."],
      [
        "Download the unlocked copy.",
        "The output opens without a password. Store it carefully because its protection has been removed.",
      ],
    ],
    tipsTitle: "Supported files and privacy",
    tips: [
      [
        "Supported password encryption.",
        "Standard RC4 and AES password-encrypted PDFs are handled when the local engine supports them and the password is valid.",
      ],
      [
        "Unsupported protection.",
        "Certificate-encrypted files, DRM, corrupted files and unsupported security handlers produce an error instead of a download.",
      ],
      [
        "Signed documents.",
        "Rewriting a PDF can invalidate digital signatures. Keep the original signed document.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can it recover a forgotten password?",
        a: "No. Supply a valid password. An incorrect password produces a clear error.",
      },
      {
        q: "Are passwords uploaded or remembered?",
        a: "No. Processing is local. Passwords are not sent to a server, stored in browser storage or retained in the form after an attempt.",
      },
    ],
  },
  "compress-pdf": {
    heading: "Compress PDF files online for free",
    intro: [
      "Large PDFs are hard to email, slow to upload to job portals and often rejected by government or university websites that cap attachments at 1–5 MB. This tool tries to reduce its size; it cannot guarantee a particular attachment limit.",
      "Choose how much to compress. Light compression rewrites the file more efficiently without touching its content, so text stays selectable. Recommended and Strong also try an image version of each page, then return the smaller result. The output may lose selectable text, links and form fields if that rasterized version is chosen.",
    ],
    steps: [
      ["Add your PDF.", "Drop the file into the box above or click to choose it."],
      [
        "Pick a level.",
        "Start with Recommended. Use Strong if the file is still too big, or Light if you need to copy text later.",
      ],
      [
        "Click Process.",
        "The tool compares the result with your original and tells you how much space was saved.",
      ],
      [
        "Download.",
        "Save the smaller PDF. If the original was already optimized, you'll see a note instead of a bigger file.",
      ],
    ],
    tipsTitle: "Tips for the smallest file",
    tips: [
      [
        "Scanned documents shrink the most.",
        "Savings depend on the original images, resolution and existing compression. There is no guaranteed percentage; compare the reported input and output sizes.",
      ],
      [
        "Text-only PDFs are already small.",
        "A PDF exported from Word is usually compact. Light compression is the safe choice for these.",
      ],
      [
        "Remove pages you don't need first.",
        "Use Remove Pages before compressing to make the file smaller still.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Will compressing reduce quality?",
        a: "Light resaves the PDF without rasterizing pages. Recommended and Strong may lower image resolution and remove selectable text. Check small print, charts, links and forms in the downloaded result.",
      },
      {
        q: "Why can't I select text after compressing?",
        a: "Recommended and Strong may return rasterized pages if they are smaller than the lossless result. Use Light to avoid rasterization and keep the original for comparison.",
      },
      {
        q: "Is there a file size limit?",
        a: "There's no fixed limit because the work happens on your device. Large files, many pages or high-resolution images can exhaust browser memory, especially on phones. There is no guaranteed maximum size.",
      },
    ],
  },

  "jpg-to-pdf": {
    heading: "Convert JPG images to a PDF",
    intro: [
      "Turn photos of documents, receipts, certificates or handwritten notes into one tidy PDF. A single PDF is easier to email, print and upload than a pile of separate images.",
      "Each image becomes one page in file-list order. Pixel dimensions are used as PDF points, so page sizes vary with the images; there is no A4 or Letter setting.",
    ],
    steps: [
      ["Add your JPG images.", "Select several at once, or add more one after another."],
      [
        "Check the order.",
        "Pages follow the order in the file list. Remove and re-add an image to move it.",
      ],
      ["Click Process.", "All images are combined into one PDF."],
      ["Download your PDF.", "It's ready to share, print or upload."],
    ],
    tipsTitle: "Getting a clean result",
    tips: [
      ["Photograph documents flat, in good light.", "Shadows and angles show up in the PDF too."],
      [
        "Crop photos first.",
        "Trim the background on your phone before converting for a professional look.",
      ],
      ["Too big to upload?", "Run the finished file through Compress PDF."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I mix JPG and PNG images?",
        a: "This page accepts JPG files. For PNG images use PNG to PDF, then join both PDFs with Merge PDF.",
      },
      {
        q: "How many images can I add?",
        a: "The practical limit depends on image dimensions, file sizes and available browser memory. Try a smaller batch if conversion fails.",
      },
      {
        q: "Will the image quality drop?",
        a: "No. Images are placed into the PDF as they are, without re-compressing them.",
      },
    ],
  },

  "png-to-pdf": {
    heading: "Convert PNG images to a PDF",
    intro: [
      "PNG is the usual format for screenshots, diagrams and graphics with sharp text. This tool places each PNG on its own PDF page so you can share them as one document.",
      "PNG images keep their crisp edges and transparency is shown on a white page.",
    ],
    steps: [
      ["Add your PNG files.", "Drag several in at once or click to choose them."],
      ["Confirm the order.", "Pages appear in the same order as the list."],
      ["Click Process.", "The images are combined into one PDF."],
      ["Download.", "Save the PDF to your device."],
    ],
    tipsTitle: "Good uses for PNG to PDF",
    tips: [
      [
        "Bundle screenshots.",
        "Turn a series of app or website screenshots into a single report or bug write-up.",
      ],
      ["Share designs and charts.", "Send diagrams in a format everyone can open."],
      ["Large screenshots?", "Compress PDF can shrink the result for email."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "What happens to transparent backgrounds?",
        a: "Transparent areas appear white, just as they would when printed.",
      },
      {
        q: "Can I convert JPG files here too?",
        a: "Use the JPG to PDF tool for JPG files. You can then merge the two PDFs.",
      },
      {
        q: "Does it work on mobile?",
        a: "Use an up-to-date browser with file download support. Available memory and browser features vary, especially on mobile; keep the original and try a smaller batch if needed.",
      },
    ],
  },

  "pdf-to-jpg": {
    heading: "Convert PDF pages to JPG images",
    intro: [
      "Need a page of a PDF as a picture? Save each page as a JPG to post on social media, add to a presentation, send on WhatsApp, or upload where only images are accepted.",
      "Convert every page or just the ones you need. A single page downloads as one image; several pages arrive together in a ZIP file.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file you want to convert."],
      [
        "Pick a quality.",
        "Standard (150 dpi) suits screens and messaging. Choose Print (300 dpi) for sharp printouts.",
      ],
      ["Choose pages (optional).", "Leave blank for all pages, or enter ranges like 1-3, 5."],
      ["Click Process and download.", "Save the image, or the ZIP with all pages."],
    ],
    tipsTitle: "Choosing the right settings",
    tips: [
      ["JPG is best for photos and scans.", "Files are small and open everywhere."],
      [
        "Need lossless image compression?",
        "Use PDF to PNG for text and diagrams. Both converters render against a white background; neither exports transparent PDF pages.",
      ],
      [
        "Higher dpi means bigger files.",
        "At 300 dpi, each dimension is twice that at 150 dpi, giving four times as many pixels. The compressed download size depends on page content and is not necessarily four times larger.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "How do I open the ZIP file?",
        a: "Windows, macOS, Android and iPhone can all open ZIP files by tapping or double-clicking them.",
      },
      {
        q: "Can I convert a password-protected PDF?",
        a: "No. Remove the password first, then convert the file.",
      },
      {
        q: "Does it convert every page?",
        a: "Yes, unless you enter a page range. Each page becomes its own image.",
      },
    ],
  },

  "pdf-to-png": {
    heading: "Convert PDF to PNG images",
    intro: [
      "PNG uses lossless image compression, useful for text, line drawings and charts. PDF vectors still become pixels at the chosen resolution, so fine detail can be lost.",
      "Pick the resolution, convert all pages or a selection, and download the images individually or as a ZIP.",
    ],
    steps: [
      ["Add your PDF.", "Choose the document to convert."],
      ["Set the quality.", "150 dpi works for screens; 300 dpi gives print-ready images."],
      ["Choose pages (optional).", "Enter ranges such as 2-4 or leave it empty for all pages."],
      ["Process and download.", "One page gives a PNG; several pages give a ZIP."],
    ],
    tipsTitle: "PNG or JPG?",
    tips: [
      [
        "Use PNG for text and graphics.",
        "PNG avoids JPG compression artifacts, but sharpness still depends on rendering resolution. Transparent areas are rendered white.",
      ],
      ["Use JPG for photos and scans.", "JPG files are much smaller for photographic content."],
      [
        "Making slides or a website?",
        "PNG images drop neatly into PowerPoint, Canva and web pages.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Why are PNG files bigger than JPG?",
        a: "PNG is lossless — it stores every pixel exactly. That's what keeps text sharp, but it takes more space.",
      },
      {
        q: "What resolution should I choose?",
        a: "150 dpi for viewing on screen, 300 dpi if you plan to print or zoom in.",
      },
      {
        q: "Is the page background transparent?",
        a: "No. Pages are rendered on white, the way they look when printed.",
      },
    ],
  },

  "pdf-to-text": {
    heading: "Extract text from a PDF",
    intro: [
      "Pull all the text out of a PDF into a plain .txt file you can edit, search, paste into a document, or feed into other tools. It's handy for quoting reports, reusing content or reading on devices that struggle with PDFs.",
      "Text is grouped by page so you can always find where it came from.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file you want text from."],
      ["Click Process.", "Text is read from every page."],
      ["Download the .txt file.", "Open it in Notepad, Word, Google Docs or any editor."],
    ],
    tipsTitle: "What to expect",
    tips: [
      [
        "Works on digital PDFs.",
        "Files created from Word, websites or other software contain real text and extract cleanly.",
      ],
      [
        "Scanned PDFs have no text.",
        "A scan is a picture of a page. It needs OCR software to recognise the letters, which this tool doesn't do.",
      ],
      ["Layout is simplified.", "Columns, tables and headers become plain lines of text."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Why did I get a “no text found” message?",
        a: "Your PDF is most likely a scan or a photo. It looks like text to you but is stored as an image.",
      },
      {
        q: "Does it keep fonts and formatting?",
        a: "No. A .txt file holds plain text only. Formatting such as bold, colours and tables isn't kept.",
      },
      {
        q: "Does it support other languages?",
        a: "Yes. Text in any language the PDF contains, including Sinhala, Tamil and Arabic, is extracted as Unicode text.",
      },
    ],
  },

  "word-to-pdf": {
    heading: "Convert Word documents to PDF",
    intro: [
      "Turn a Word .docx file into a PDF that looks the same on every device and can't be accidentally edited — the standard way to send CVs, assignments, letters and reports.",
      "The PDF keeps your headings, paragraphs, bold and italic text, bullet and numbered lists, tables and pictures, and the text stays selectable and searchable.",
    ],
    steps: [
      ["Add your .docx file.", "Older .doc files must be saved as .docx in Word first."],
      ["Click Process.", "The document is converted on your device."],
      ["Download your PDF.", "Open it to check the layout before you send it."],
    ],
    tipsTitle: "For the best result",
    tips: [
      [
        "Keep layouts simple.",
        "Headings, paragraphs, lists and tables convert well. Text boxes, columns and shapes are simplified.",
      ],
      [
        "Latin-alphabet text only.",
        "The built-in PDF fonts cover English and most European languages. Sinhala, Tamil, Arabic and similar scripts aren't supported yet.",
      ],
      [
        "Need an exact copy?",
        "For pixel-perfect results, Word's own File › Save As › PDF is still the gold standard.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I convert .doc files?",
        a: "Not directly. Open the file in Word, LibreOffice or Google Docs and save it as .docx, then convert it here.",
      },
      {
        q: "Are images included?",
        a: "Yes, PNG and JPEG pictures are included and scaled to fit the page.",
      },
      {
        q: "What page size is used?",
        a: "A4, with comfortable margins. That's the standard size in Sri Lanka, the Gulf, Europe and most of the world.",
      },
    ],
  },

  "rotate-pdf": {
    heading: "Rotate PDF pages",
    intro: [
      "Scanned a document sideways or upside down? Rotate every page of your PDF by 90°, 180° or 270° and save it the right way up permanently.",
      "Rotation is lossless — nothing is re-compressed, so quality stays exactly the same.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file with the wrongly oriented pages."],
      ["Pick an angle.", "90° turns pages a quarter clockwise; 180° flips them upside down."],
      ["Click Process.", "All pages are rotated."],
      ["Download.", "The new PDF opens the right way up in every viewer."],
    ],
    tipsTitle: "Handy to know",
    tips: [
      [
        "Only some pages are wrong?",
        "Use Extract Pages to separate them, rotate those, then Merge PDF to put the file back together.",
      ],
      [
        "Rotating in a viewer isn't saved.",
        "Many PDF viewers only rotate the view. This tool changes the file itself.",
      ],
      ["Text stays selectable.", "Rotation doesn't turn pages into images."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Does rotating reduce quality?",
        a: "No. It only changes the page orientation setting inside the file.",
      },
      {
        q: "Which way is 90°?",
        a: "Clockwise. Choose 270° to turn pages a quarter anticlockwise.",
      },
      { q: "Will the file size change?", a: "Hardly at all. The content isn't re-encoded." },
    ],
  },

  "extract-pdf-pages": {
    heading: "Extract pages from a PDF",
    intro: [
      "Save just the pages you need as a new PDF — one chapter of a book, the signed page of a contract, or a single payslip out of a year's worth.",
      "Your original file stays untouched. Pages keep their full quality and selectable text.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file to take pages from."],
      ["Enter the pages.", "Use commas and dashes, e.g. 1-3, 7, 10-12."],
      ["Click Process.", "A new PDF with only those pages is created."],
      ["Download.", "Save it under a new name."],
    ],
    tipsTitle: "Page range examples",
    tips: [
      ["“5”", "extracts page 5 only."],
      ["“2-6”", "extracts pages 2, 3, 4, 5 and 6."],
      ["“1, 4-5, 9”", "extracts pages 1, 4, 5 and 9 in that order."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "What's the difference between Extract and Split?",
        a: "Extract makes one new PDF from the pages you pick. Split is for breaking a document into parts.",
      },
      {
        q: "Can I change the page order?",
        a: "Pages are kept in their original order. Use Reorder Pages afterwards to rearrange them.",
      },
      { q: "Does the original file change?", a: "No. You always get a new file." },
    ],
  },

  "remove-pdf-pages": {
    heading: "Delete pages from a PDF",
    intro: [
      "Remove blank pages, adverts, cover sheets or confidential pages before sharing a PDF. Everything you don't delete stays exactly as it was.",
      "Removing unwanted pages also makes the file smaller and easier to email.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file to clean up."],
      ["Enter the pages to delete.", "For example 1, 4-6 removes pages 1, 4, 5 and 6."],
      ["Click Process.", "The remaining pages are saved as a new PDF."],
      ["Download.", "Check the result before you share it."],
    ],
    tipsTitle: "Tips",
    tips: [
      [
        "Not sure of the page numbers?",
        "Open the PDF in your browser first and note the numbers shown in the toolbar.",
      ],
      ["Removing sensitive pages?", "This tool removes them completely. They're not just hidden."],
      [
        "Want to keep only a few pages?",
        "Extract Pages is quicker when you're keeping fewer pages than you're removing.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I undo a deletion?",
        a: "Your original file isn't changed, so you can always start again from it.",
      },
      { q: "Can I remove every page?", a: "No. A PDF needs at least one page." },
      {
        q: "Does the rest of the document change?",
        a: "No. The pages you keep are copied exactly as they were, with full quality and selectable text.",
      },
    ],
  },

  "reorder-pdf-pages": {
    heading: "Reorder PDF pages",
    intro: [
      "Put pages back in the right order after scanning them out of sequence, or move a summary to the front of a report.",
      "Type the new order as a list of page numbers and the tool rebuilds the document — quality and text stay intact.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file to rearrange."],
      ["Type the new order.", "For a 3-page file, 3,1,2 makes page 3 come first."],
      ["Click Process.", "Pages are rearranged."],
      ["Download.", "Save the reordered PDF."],
    ],
    tipsTitle: "Tips",
    tips: [
      [
        "List every original page.",
        "Include every original page exactly once. Missing pages, duplicates and out-of-range numbers are rejected; use Remove Pages to delete pages.",
      ],
      ["Reverse a document.", "For a 5-page scan fed in backwards, enter 5,4,3,2,1."],
      [
        "Combine with Merge.",
        "Merge several files first, then reorder the pages of the combined PDF.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I repeat a page?",
        a: "No. Reorder requires every page exactly once. For a three-page PDF, 3,1,2 is valid; 1,1,2 is rejected.",
      },
      {
        q: "What if I enter a number that doesn't exist?",
        a: "The tool reports an error. Use only page numbers from 1 through the document page count, with none missing or repeated.",
      },
      {
        q: "Is there a page limit?",
        a: "There is no fixed page-count quota. Browser memory can still limit large documents; keep the original and verify the output order.",
      },
    ],
  },

  "add-blank-page-to-pdf": {
    heading: "Insert a blank page into a PDF",
    intro: [
      "Add an empty page anywhere in a PDF — to leave room for handwritten notes, separate chapters, or make a document print correctly double-sided.",
      "The blank page uses the same size as your document's first page, so it fits in neatly.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file."],
      [
        "Choose where.",
        "Enter the page number to insert after. Use 0 to put the blank page at the very start.",
      ],
      ["Click Process.", "A blank page is added."],
      ["Download.", "Save the updated PDF."],
    ],
    tipsTitle: "Common reasons to add blank pages",
    tips: [
      ["Double-sided printing.", "Make each chapter start on a right-hand page."],
      ["Notes and signatures.", "Leave space for handwritten comments in a printed copy."],
      ["Booklets.", "Pad the page count to a multiple of four for folded booklets."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I add several blank pages?",
        a: "Run the tool once for each page you want to add.",
      },
      { q: "Is the blank page really empty?", a: "Yes, it's a plain white page with no content." },
      { q: "What size is the new page?", a: "The same size as the first page of your document." },
    ],
  },

  "add-margin-to-pdf": {
    heading: "Add margins to PDF pages",
    intro: [
      "Content too close to the edge gets cut off when printing or binding. This tool adds even white space around every page by making each page slightly larger — your content stays exactly the same size.",
      "Useful for documents you'll print, bind, punch holes in, or annotate by hand.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file."],
      ["Set the margin.", "Enter it in points: 36 pt is half an inch (about 12.7 mm)."],
      ["Click Process.", "Every page gets the new margin."],
      ["Download.", "Print a test page to check it."],
    ],
    tipsTitle: "Choosing a margin",
    tips: [
      ["18 pt (≈6 mm)", "is enough to stop printers clipping edges."],
      ["36 pt (≈13 mm)", "gives room for hole punching and notes."],
      ["Want to remove white space instead?", "Use Crop PDF."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Will my content shrink?",
        a: "No. Your content keeps its size; each page grows by the margin on every side.",
      },
      { q: "What is a point?", a: "A point is 1/72 of an inch, the standard unit in PDF files." },
      { q: "Does text stay selectable?", a: "Yes. Nothing is converted into images." },
    ],
  },

  "add-page-numbers-to-pdf": {
    heading: "Add page numbers to a PDF",
    intro: [
      "Number every page of a PDF automatically — essential for reports, theses, assignments, legal bundles and anything that will be printed or referenced.",
      "Choose Bottom center, Bottom right, Bottom left or Top center, and set the font size. Numbering starts at 1 and uses the format current / total.",
    ],
    steps: [
      ["Add your PDF.", "Choose the document."],
      ["Choose a position.", "Bottom center is the most common; bottom right suits reports."],
      ["Set the font size.", "10–12 is right for most documents."],
      [
        "Click Process and download.",
        "Every page shows its position and total count, such as 1 / 3, 2 / 3 and 3 / 3.",
      ],
    ],
    tipsTitle: "Tips",
    tips: [
      ["Leave room at the edge.", "If numbers overlap content, use Add Margin first."],
      [
        "Combine files first.",
        "Merge all parts before numbering so the count runs through the whole document.",
      ],
      [
        "Need “Page 1 of 10”?",
        "The current format is current / total, such as 1 / 10. Custom wording, Roman numerals, color and starting-number controls are not supported.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I skip the cover page?",
        a: "Not yet. A workaround: extract the cover, number the rest, then merge them back together.",
      },
      {
        q: "Which font is used?",
        a: "Helvetica, a clean standard font available in every PDF viewer.",
      },
      {
        q: "Can I remove the numbers later?",
        a: "Keep an unnumbered original. Numbers become page content; running the tool again adds another overlay instead of replacing previous numbers.",
      },
    ],
  },

  "add-text-to-pdf": {
    heading: "Add text to a PDF",
    intro: [
      "Type a name, date, reference number or short note onto any page of a PDF — handy for filling simple forms that aren't fillable, or labelling documents.",
      "You choose the page, the position and the size of the text.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file."],
      ["Type your text.", "Enter what you want to add."],
      [
        "Set the page and position.",
        "X is the distance from the left edge, Y from the bottom, in points (72 points = 1 inch).",
      ],
      [
        "Click Process and download.",
        "Open the file to check the placement, and adjust if needed.",
      ],
    ],
    tipsTitle: "Positioning help",
    tips: [
      ["A4 is 595 × 842 points.", "So X 50, Y 800 is near the top-left corner."],
      ["US Letter is 612 × 792 points.", "Y 50 is close to the bottom of any page."],
      ["Need it on every page?", "Use Watermark PDF or Add Page Numbers instead."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can I edit existing text in the PDF?",
        a: "No. This tool adds new text on top of the page; it doesn't change what's already there.",
      },
      {
        q: "Which characters are supported?",
        a: "English and other Latin-alphabet languages. Sinhala, Tamil and Arabic aren't supported by the built-in font yet.",
      },
      {
        q: "Can I add a signature?",
        a: "You can type your name. Drawing a signature isn't available yet.",
      },
    ],
  },

  "watermark-pdf": {
    heading: "Add a watermark to a PDF",
    intro: [
      "Stamp words like CONFIDENTIAL, DRAFT, COPY or your company name diagonally across every page. Watermarks discourage copying and make it clear how a document should be treated.",
      "Adjust the opacity so the watermark is visible without hiding the content beneath.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file to protect."],
      ["Type the watermark text.", "Keep it short — one or two words work best."],
      ["Set opacity and size.", "0.2–0.3 opacity is subtle but clear."],
      ["Click Process and download.", "Every page now carries the watermark."],
    ],
    tipsTitle: "Watermark ideas",
    tips: [
      ["DRAFT", "for documents still under review."],
      ["SAMPLE or PREVIEW", "for work you're showing a client before payment."],
      ["Your name or business", "on certificates, price lists and portfolios."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Can people remove the watermark?",
        a: "It's drawn onto each page, so it can't simply be switched off. Determined users with editing software can still alter any PDF, so treat it as a deterrent.",
      },
      {
        q: "Can I use an image watermark?",
        a: "Only text watermarks are supported at the moment.",
      },
      {
        q: "Does it cover the text underneath?",
        a: "No, it's semi-transparent. Lower the opacity if it's too strong.",
      },
    ],
  },

  "flatten-pdf": {
    heading: "Flatten a PDF",
    intro: [
      "Flattening replaces interactive form fields with their visible appearances. It does not lock the PDF, prevent later editing, add password protection or securely redact information.",
      "Choose “Everything” to also merge comments, stamps and annotations into the page — useful before printing or submitting a final copy.",
    ],
    steps: [
      ["Add your PDF.", "Usually a filled-in form."],
      [
        "Choose what to flatten.",
        "Form fields only keeps text selectable. Everything converts each page to an image.",
      ],
      ["Click Process.", "The PDF is flattened."],
      [
        "Download.",
        "Check the flattened copy before sending or printing it. Keep the original for future form edits.",
      ],
    ],
    tipsTitle: "When to flatten",
    tips: [
      [
        "Before submitting forms.",
        "Flattening can help preserve filled field appearances. Check every field in the output; some forms and fonts are not supported.",
      ],
      [
        "Before printing.",
        "If a viewer omits field appearances or annotations when printing, review a flattened copy and print a test page.",
      ],
      ["Keep an editable copy.", "Flattening can't be undone, so save the original too."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Why does it say there are no form fields?",
        a: "Your PDF has no fillable fields. Choose “Everything” to flatten comments and annotations instead.",
      },
      {
        q: "Can I unflatten a PDF?",
        a: "No. Flattening is permanent, which is the point. Keep the original if you might need to edit it.",
      },
      {
        q: "Will the file get bigger?",
        a: "Output size varies. “Everything” mode may make the file larger because pages become images. Compare the download with your original.",
      },
    ],
  },

  "crop-pdf": {
    heading: "Crop PDF pages",
    intro: [
      "Trim white space, scanner borders, headers or footers from the edges of PDF pages. Cropping makes documents easier to read on phones and tablets and removes distracting margins.",
      "Set how much to trim from each side in millimetres, for all pages or a selection.",
    ],
    steps: [
      ["Add your PDF.", "Choose the file."],
      ["Enter the trim amounts.", "Millimetres to remove from the top, right, bottom and left."],
      ["Choose pages (optional).", "Leave blank to crop every page."],
      ["Click Process and download.", "Open the result and adjust the numbers if needed."],
    ],
    tipsTitle: "Cropping tips",
    tips: [
      ["Start small.", "10 mm on each side removes typical scanner borders."],
      ["Lecture slides with big margins?", "Crop 20–30 mm for much easier reading on a phone."],
      ["Want more margin instead?", "Use Add Margin."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Is the cropped content deleted?",
        a: "It's hidden by the PDF's crop box, which all standard viewers and printers respect. The data is still inside the file, so don't rely on cropping to remove confidential information.",
      },
      { q: "Does cropping reduce quality?", a: "No. Nothing is re-compressed." },
      { q: "Can I crop just one page?", a: "Yes. Enter that page number in the Pages box." },
    ],
  },

  "grayscale-pdf": {
    heading: "Convert a PDF to grayscale (black and white)",
    intro: [
      "Turn a colour PDF into black and white. Grayscale documents are cheaper to print, often required by print shops and exam boards, and easier to read when photocopied.",
      "Every page — text, photos and charts — is converted to shades of grey.",
    ],
    steps: [
      ["Add your PDF.", "Choose the colour document."],
      ["Click Process.", "Each page is converted to grayscale."],
      ["Download.", "Print or share the black-and-white copy."],
    ],
    tipsTitle: "Good to know",
    tips: [
      [
        "Check printer settings.",
        "The PDF will look gray, but black-ink-only printing depends on your printer and driver. Choose that setting in the print dialog if available.",
      ],
      [
        "Check your charts.",
        "Colours that look different can become similar greys, so make sure graphs still read clearly.",
      ],
      [
        "Text becomes part of the image.",
        "Pages are redrawn, so text can't be selected afterwards.",
      ],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Why can't I select text after converting?",
        a: "Each page becomes a grayscale image. This removes selectable text, links and interactive form fields. Keep the original if you need those features.",
      },
      {
        q: "Will the file be bigger?",
        a: "It can be for text-only PDFs. Use Compress PDF afterwards if you need a smaller file.",
      },
      {
        q: "Can I convert only some pages?",
        a: "Extract those pages first, convert them, then merge the document back together.",
      },
    ],
  },

  "edit-pdf-metadata": {
    heading: "Edit or remove PDF metadata",
    intro: [
      "Every PDF stores hidden details such as its title, author and keywords. The title is what browsers and search engines show for the file, and the author field can reveal your name or your company's software.",
      "Edit title, author, subject and keywords. The clear option also blanks creator and producer. This is not a full hidden-data sanitizer: an existing creation date, embedded XMP, comments, attachments and page content can remain; the modification date is updated.",
    ],
    steps: [
      ["Add your PDF.", "Its current title, author, subject and keywords appear in the boxes."],
      ["Edit the fields.", "Change any value, or clear a box to remove it."],
      [
        "Or clear selected properties.",
        "Tick “Clear selected document properties” to blank title, author, subject, keywords, creator and producer. Other hidden data may remain.",
      ],
      ["Click Process and download.", "The content of the pages isn't changed."],
    ],
    tipsTitle: "Why metadata matters",
    tips: [
      [
        "Better search results.",
        "A clear title helps Google show your PDF properly when it's published online.",
      ],
      [
        "Privacy.",
        "Clear the author property if needed, then inspect the pages and other hidden data separately. This tool cannot guarantee an anonymous document.",
      ],
      ["Professional files.", "Replace titles like “Document1” with something meaningful."],
      PRIVATE,
    ],
    faqs: [
      {
        q: "Does this change the content of the PDF?",
        a: "No. Only the document properties are changed.",
      },
      {
        q: "Where can I see a PDF's metadata?",
        a: "In most viewers, open File › Properties or Document Properties.",
      },
      {
        q: "Does it remove all hidden data?",
        a: "No. The clear option blanks six standard text properties. An existing creation date is preserved, the modification date is updated, and embedded XMP data, comments, attachments and page content are not removed.",
      },
    ],
  },
};
