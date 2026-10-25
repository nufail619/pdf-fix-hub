import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadEnv } from "vite";
import { prepareContent } from "./content.mjs";

export function createCmsConfig(authUrl = "") {
  const fields = [
    { name: "title", label: "Title", widget: "string" },
    {
      name: "slug",
      label: "URL slug",
      widget: "string",
      pattern: ["^[a-z0-9]+(?:-[a-z0-9]+)*$", "Use lowercase words separated by hyphens."],
      hint: "Keep existing slugs to preserve links. Changing a slug changes the URL.",
    },
    {
      name: "status",
      label: "Publication status",
      widget: "select",
      options: [
        { label: "Draft / unpublished", value: "draft" },
        { label: "Published", value: "published" },
      ],
      default: "draft",
      hint: "Save as Published to include this article in the next site build. Save as Draft to unpublish it after the next successful build.",
    },
    { name: "excerpt", label: "Summary", widget: "text" },
    {
      name: "seoDescription",
      label: "SEO description",
      widget: "text",
      pattern: ["^[\\s\\S]{1,200}$", "Use 1–200 characters."],
    },
    {
      name: "date",
      label: "Publication date",
      widget: "datetime",
      format: "YYYY-MM-DD",
      date_format: "YYYY-MM-DD",
      time_format: false,
      hint: "Display date only. Publication is controlled by Publication status, not scheduled by this date.",
    },
    { name: "author", label: "Author", widget: "string", default: "The MY PDF FIX Team" },
    { name: "readTime", label: "Reading time", widget: "string", default: "5 min read" },
    {
      name: "featuredImage",
      label: "Featured image",
      widget: "image",
      required: false,
      default: "",
      choose_url: false,
      media_library: { config: { max_file_size: 5000000 } },
      hint: "Upload JPG, PNG, WebP, GIF or AVIF. Add alternative text below.",
    },
    {
      name: "featuredImageAlt",
      label: "Featured image alternative text",
      widget: "string",
      required: false,
      default: "",
    },
    {
      name: "categories",
      label: "Categories",
      widget: "list",
      default: [],
      required: false,
      hint: "Add one category per item.",
    },
    {
      name: "body",
      label: "Article body",
      widget: "markdown",
      hint: "Use headings, paragraphs, lists and links. Raw HTML is not published.",
    },
  ];
  return {
    backend: {
      name: "github",
      repo: "nufail619/pdf-fix-hub",
      branch: "develop/pdf-tools-repair",
      auth_methods: ["oauth"],
      ...(authUrl ? { base_url: authUrl } : {}),
      auth_scope: "repo",
      commit_messages: {
        create: "content: create {{collection}} {{slug}}",
        update: "content: update {{collection}} {{slug}}",
        delete: "content: delete {{collection}} {{slug}}",
        uploadMedia: "content: upload {{path}}",
        deleteMedia: "content: delete {{path}}",
      },
    },
    media_folder: "public/uploads",
    public_folder: "/uploads",
    media_libraries: {
      default: {
        config: {
          slugify_filename: true,
          transformations: { raster_image: { format: "webp", quality: 85 } },
        },
      },
    },
    logo: { src: "/admin/logo.svg" },
    show_preview_links: false,
    collections: [
      { name: "blog", label: "Blog posts", label_singular: "Blog post", folder: "content/blog" },
      { name: "guides", label: "Guides", label_singular: "Guide", folder: "content/guides" },
    ].map((collection) => ({
      ...collection,
      create: true,
      delete: true,
      format: "json",
      extension: "json",
      identifier_field: "slug",
      slug: "{{slug}}",
      summary: "{{title}} — {{status}}",
      editor: { preview: true },
      sortable_fields: ["date", "title", "status"],
      view_filters: [
        { label: "Published", field: "status", pattern: "published" },
        { label: "Drafts", field: "status", pattern: "draft" },
      ],
      fields,
    })),
  };
}

export async function prepareCms(
  root = process.cwd(),
  env = { ...loadEnv(process.env.NODE_ENV || "development", root, ""), ...process.env },
) {
  const raw = env.CMS_AUTH_URL || "";
  let authUrl = "";
  if (raw) {
    const url = new URL(raw);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.pathname !== "/" ||
      url.search ||
      url.hash
    )
      throw new Error(
        "CMS_AUTH_URL must be an HTTPS origin without a path, credentials, query or fragment.",
      );
    authUrl = url.origin;
  }
  const admin = resolve(root, "public/admin");
  await mkdir(admin, { recursive: true });
  await writeFile(
    resolve(admin, "config.yml"),
    JSON.stringify(createCmsConfig(authUrl), null, 2) + "\n",
  );
  await writeFile(
    resolve(admin, "runtime.json"),
    JSON.stringify({ authConfigured: !!authUrl }) + "\n",
  );
  await cp(resolve(root, "node_modules/@sveltia/cms/dist"), resolve(admin, "vendor"), {
    recursive: true,
    filter: (path) => !path.endsWith(".map"),
  });
  await cp(
    resolve(root, "node_modules/@sveltia/cms/LICENSE.txt"),
    resolve(admin, "vendor/LICENSE.txt"),
  );
  // Self-host the three fonts referenced by this pinned CMS bundle. Dependencies
  // are installed with their lockfile checksums; no CDN fetch is needed at build time.
  const fonts = [
    [
      "@fontsource-variable/source-sans-3",
      "source-sans-3-latin-wght-normal.woff2",
      "source-sans-3:vf@5.3.1/latin-wght-normal.woff2",
    ],
    [
      "@fontsource/noto-mono",
      "noto-mono-latin-400-normal.woff2",
      "noto-mono@5.3.0/latin-400-normal.woff2",
    ],
    [
      "@fontsource-variable/material-symbols-outlined",
      "material-symbols-outlined-latin-wght-normal.woff2",
      "material-symbols-outlined:vf@5.3.9/latin-wght-normal.woff2",
    ],
  ];
  await mkdir(resolve(admin, "vendor/fonts"), { recursive: true });
  const scriptPath = resolve(admin, "vendor/sveltia-cms.js");
  let script = await readFile(scriptPath, "utf8");
  for (const [pkg, file, cdnPath] of fonts) {
    const remote = `https://cdn.jsdelivr.net/fontsource/fonts/${cdnPath}`;
    if (!script.includes(remote))
      throw new Error("CMS font references changed; review the pinned self-hosted font mapping.");
    script = script.replaceAll(remote, `/admin/vendor/fonts/${file}`);
    await cp(
      resolve(root, "node_modules", pkg, "files", file),
      resolve(admin, "vendor/fonts", file),
    );
    await cp(
      resolve(root, "node_modules", pkg, "LICENSE"),
      resolve(admin, "vendor/fonts", pkg.split("/")[1] + "-LICENSE.txt"),
    );
  }
  await writeFile(scriptPath, script);
  await prepareContent(root);
}

if (process.argv[1] && resolve(process.argv[1]) === new URL(import.meta.url).pathname)
  await prepareCms();
