export type ToolCategory = "Organize" | "Optimize" | "Convert" | "Edit";
export type ToolAccent =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "teal"
  | "pink"
  | "yellow"
  | "indigo";

export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  accent: ToolAccent;
  icon: string; // Lucide icon name (PascalCase)
  processingType: "client" | "placeholder";
  accepts: string[]; // mime types or extensions
  multiple: boolean;
  related: string[]; // related slugs
};

export const TOOL_CATEGORIES: ToolCategory[] = ["Organize", "Optimize", "Convert", "Edit"];

export const tools: Tool[] = [
  {
    slug: "merge-pdf",
    name: "Merge PDF",
    description: "Combine multiple PDFs into a single document.",
    category: "Organize",
    accent: "red",
    icon: "Combine",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: true,
    related: ["split-pdf", "extract-pdf-pages", "reorder-pdf-pages"],
  },
  {
    slug: "split-pdf",
    name: "Split PDF",
    description: "Separate one PDF into multiple files by page ranges.",
    category: "Organize",
    accent: "blue",
    icon: "Scissors",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["merge-pdf", "extract-pdf-pages", "remove-pdf-pages"],
  },
  {
    slug: "compress-pdf",
    name: "Compress PDF",
    description: "Reduce PDF file size while keeping quality.",
    category: "Optimize",
    accent: "green",
    icon: "Minimize2",
    processingType: "placeholder",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["flatten-pdf", "merge-pdf", "split-pdf"],
  },
  {
    slug: "jpg-to-pdf",
    name: "JPG to PDF",
    description: "Convert JPG images into a single PDF document.",
    category: "Convert",
    accent: "orange",
    icon: "Image",
    processingType: "client",
    accepts: ["image/jpeg"],
    multiple: true,
    related: ["png-to-pdf", "pdf-to-jpg", "merge-pdf"],
  },
  {
    slug: "png-to-pdf",
    name: "PNG to PDF",
    description: "Convert PNG images into a single PDF document.",
    category: "Convert",
    accent: "purple",
    icon: "ImagePlus",
    processingType: "client",
    accepts: ["image/png"],
    multiple: true,
    related: ["jpg-to-pdf", "pdf-to-jpg", "merge-pdf"],
  },
  {
    slug: "pdf-to-jpg",
    name: "PDF to JPG",
    description: "Convert each PDF page into a JPG image.",
    category: "Convert",
    accent: "yellow",
    icon: "FileImage",
    processingType: "placeholder",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["jpg-to-pdf", "png-to-pdf", "compress-pdf"],
  },
  {
    slug: "word-to-pdf",
    name: "Word to PDF",
    description: "Convert Word documents into polished PDFs.",
    category: "Convert",
    accent: "indigo",
    icon: "FileText",
    processingType: "placeholder",
    accepts: [".doc", ".docx"],
    multiple: false,
    related: ["jpg-to-pdf", "png-to-pdf", "merge-pdf"],
  },
  {
    slug: "extract-pdf-pages",
    name: "Extract Pages",
    description: "Pull out specific pages and save them as a new PDF.",
    category: "Organize",
    accent: "teal",
    icon: "FileOutput",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["split-pdf", "remove-pdf-pages", "reorder-pdf-pages"],
  },
  {
    slug: "remove-pdf-pages",
    name: "Remove Pages",
    description: "Delete pages from a PDF you don't need.",
    category: "Organize",
    accent: "pink",
    icon: "FileMinus",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["extract-pdf-pages", "split-pdf", "reorder-pdf-pages"],
  },
  {
    slug: "reorder-pdf-pages",
    name: "Reorder Pages",
    description: "Change the order of pages in your PDF.",
    category: "Organize",
    accent: "blue",
    icon: "ArrowDownUp",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["merge-pdf", "extract-pdf-pages", "remove-pdf-pages"],
  },
  {
    slug: "rotate-pdf",
    name: "Rotate PDF",
    description: "Rotate PDF pages by 90, 180 or 270 degrees.",
    category: "Edit",
    accent: "orange",
    icon: "RotateCw",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["reorder-pdf-pages", "merge-pdf", "add-margin-to-pdf"],
  },
  {
    slug: "add-page-numbers-to-pdf",
    name: "Add Page Numbers",
    description: "Insert page numbers anywhere on your PDF.",
    category: "Edit",
    accent: "purple",
    icon: "Hash",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["add-text-to-pdf", "watermark-pdf", "add-margin-to-pdf"],
  },
  {
    slug: "add-text-to-pdf",
    name: "Add Text to PDF",
    description: "Write custom text on any page of your PDF.",
    category: "Edit",
    accent: "green",
    icon: "Type",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["add-page-numbers-to-pdf", "watermark-pdf", "add-blank-page-to-pdf"],
  },
  {
    slug: "add-blank-page-to-pdf",
    name: "Add Blank Page",
    description: "Insert blank pages anywhere in a PDF.",
    category: "Edit",
    accent: "yellow",
    icon: "FilePlus",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["merge-pdf", "reorder-pdf-pages", "add-margin-to-pdf"],
  },
  {
    slug: "add-margin-to-pdf",
    name: "Add Margin",
    description: "Add uniform white margins around your PDF pages.",
    category: "Edit",
    accent: "teal",
    icon: "Square",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["rotate-pdf", "add-text-to-pdf", "watermark-pdf"],
  },
  {
    slug: "watermark-pdf",
    name: "Watermark PDF",
    description: "Stamp text watermarks across every PDF page.",
    category: "Edit",
    accent: "pink",
    icon: "Stamp",
    processingType: "client",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["add-text-to-pdf", "add-page-numbers-to-pdf", "flatten-pdf"],
  },
  {
    slug: "flatten-pdf",
    name: "Flatten PDF",
    description: "Flatten form fields and annotations into the page.",
    category: "Optimize",
    accent: "indigo",
    icon: "Layers",
    processingType: "placeholder",
    accepts: ["application/pdf"],
    multiple: false,
    related: ["compress-pdf", "watermark-pdf", "merge-pdf"],
  },
];

export const toolBySlug = (slug: string): Tool | undefined =>
  tools.find((t) => t.slug === slug);

export const ACCENT_CLASSES: Record<ToolAccent, { bg: string; fg: string }> = {
  red: { bg: "bg-accent-red-bg", fg: "text-accent-red-fg" },
  blue: { bg: "bg-accent-blue-bg", fg: "text-accent-blue-fg" },
  green: { bg: "bg-accent-green-bg", fg: "text-accent-green-fg" },
  purple: { bg: "bg-accent-purple-bg", fg: "text-accent-purple-fg" },
  orange: { bg: "bg-accent-orange-bg", fg: "text-accent-orange-fg" },
  teal: { bg: "bg-accent-teal-bg", fg: "text-accent-teal-fg" },
  pink: { bg: "bg-accent-pink-bg", fg: "text-accent-pink-fg" },
  yellow: { bg: "bg-accent-yellow-bg", fg: "text-accent-yellow-fg" },
  indigo: { bg: "bg-accent-indigo-bg", fg: "text-accent-indigo-fg" },
};
