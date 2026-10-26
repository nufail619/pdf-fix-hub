// Refuse to publish an empty SPA shell, a not-found document at a valid URL,
// duplicate site layouts, or contact information left over from a template.
export function validateStaticPage(html, route, { noIndex = false } = {}) {
  if (/data-spa-fallback="true"/.test(html))
    throw new Error(`Invalid static page ${route}: a public URL contains the shared fallback`);
  for (const element of ["h1", "header", "footer", "main"]) {
    const count = [...html.matchAll(new RegExp(`<${element}\\b[^>]*>`, "g"))].length;
    if (count !== 1)
      throw new Error(`Invalid static page ${route}: expected one ${element}, found ${count}`);
  }
  if (/<h1\b[^>]*>\s*404\s*<\/h1>/.test(html))
    throw new Error(`Invalid static page ${route}: a public URL rendered the 404 screen`);
  if (/hello@example\.com/i.test(html) || !html.includes("mailto:mypdffix@gmail.com"))
    throw new Error(`Invalid static page ${route}: incorrect contact information`);
  const robots = html.match(/<meta[^>]+name="robots"[^>]*>/g) || [];
  const expected = noIndex ? "noindex,nofollow" : "index,follow";
  if (robots.length !== 1 || !robots[0].includes(`content="${expected}"`))
    throw new Error(`Invalid static page ${route}: incorrect indexing metadata`);
}
