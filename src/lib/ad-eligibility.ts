import { tools } from "@/data/tools";
import { blogPosts } from "@/data/blogPosts";
import { guides } from "@/data/guides";
import { isAdEligiblePath } from "../../scripts/adsense.mjs";

const contentPaths = [
  "/about",
  ...tools.map((tool) => `/${tool.slug}`),
  ...blogPosts.map((post) => `/blog/${post.slug}`),
  ...guides.map((post) => `/guides/${post.slug}`),
];
export function isAdvertisingContent(pathname: string) {
  return isAdEligiblePath(pathname, contentPaths);
}
