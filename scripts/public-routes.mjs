import { readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { loadContent } from "./content.mjs";

export async function publicRoutes(root = process.cwd()) {
  const files = await readdir(resolve(root, "src/routes"));
  const routes = files
    .filter((file) => file.endsWith(".tsx") && !file.startsWith("__") && !file.includes("$"))
    .map((file) => file.replace(/\.tsx$/, "").replace(/\.index$/, ""))
    .map((route) => (route === "index" ? "/" : `/${route}`));
  const content = await loadContent(root);
  for (const collection of ["blog", "guides"])
    for (const article of content[collection]) routes.push(`/${collection}/${article.slug}`);
  return [...new Set(routes)].sort();
}
