import { loadEnv } from "vite";

export function siteSettings(root = process.cwd(), runtime = process.env) {
  const env = { ...loadEnv("production", root, ""), ...runtime };
  const url = new URL(env.VITE_SITE_URL || "https://mypdffix.com");
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "VITE_SITE_URL must be an HTTPS website origin without credentials, a path, query or fragment.",
    );
  const preview = !!env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== "main";
  return { env, siteUrl: url.origin, noIndex: preview || env.VITE_NOINDEX === "true" };
}
