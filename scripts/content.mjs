import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const safeSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const localImage = /^\/uploads\/[a-zA-Z0-9/_-]+\.(?:jpe?g|png|webp|gif|avif)$/i;
export const articleSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    slug: z.string().max(150).regex(safeSlug),
    excerpt: z.string().trim().min(1).max(500),
    seoDescription: z.string().trim().min(1).max(200),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const d = new Date(`${v}T00:00:00Z`);
        return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === v;
      }, "Use a real calendar date"),
    author: z.string().trim().min(1).max(100),
    readTime: z.string().trim().min(1).max(50),
    body: z.string().trim().min(1).max(200000),
    status: z.enum(["draft", "published"]),
    featuredImage: z
      .string()
      .refine(
        (v) => v === "" || (localImage.test(v) && !v.includes("..")),
        "Use a supported image in /uploads/",
      )
      .default(""),
    featuredImageAlt: z.string().max(300).default(""),
    categories: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  })
  .strict()
  .superRefine((article, ctx) => {
    if (article.featuredImage && !article.featuredImageAlt.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["featuredImageAlt"],
        message: "Describe the featured image",
      });
    }
  });

export async function loadContent(root = process.cwd()) {
  const result = { blog: [], guides: [] };
  for (const collection of Object.keys(result)) {
    const folder = resolve(root, "content", collection);
    const entries = await readdir(folder, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.name.endsWith(".json")) continue;
      if (!entry.isFile()) throw new Error(`Content must be a regular JSON file: ${entry.name}`);
      const article = articleSchema.parse(
        JSON.parse(await readFile(resolve(folder, entry.name), "utf8")),
      );
      if (basename(entry.name, ".json") !== article.slug)
        throw new Error(`Filename must match slug: ${entry.name}`);
      if (article.featuredImage) {
        await readFile(resolve(root, "public", article.featuredImage.slice(1)));
      }
      // Never place draft text in public HTML, client bundles, or the sitemap.
      if (article.status === "published") {
        const { status: _status, ...published } = article;
        result[collection].push(published);
      }
    }
    result[collection].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
  }
  return result;
}

export async function prepareContent(root = process.cwd()) {
  const content = await loadContent(root);
  await mkdir(resolve(root, "src/generated"), { recursive: true });
  await writeFile(
    resolve(root, "src/generated/content.ts"),
    `// Generated from published CMS entries. Do not edit.\nexport const publishedContent = ${JSON.stringify(content, null, 2)};\n`,
  );
  return content;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const content = await prepareContent();
  console.log(
    `Prepared ${content.blog.length} blog posts and ${content.guides.length} guides (published only).`,
  );
}
