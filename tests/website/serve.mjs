import { createServer } from "node:http";
import { readFileSync, existsSync } from "node:fs";
import sirv from "sirv";

export function websiteServer(root) {
  const redirects = existsSync(root + "/_redirects")
    ? readFileSync(root + "/_redirects", "utf8")
        .split("\n")
        .filter((line) => line.trim() && !line.startsWith("#"))
        .map((line) => line.trim().split(/\s+/))
    : [];
  const groups = readFileSync(root + "/_headers", "utf8")
    .split(/\n(?=\/)/)
    .map((block) => {
      const [path, ...lines] = block.trim().split("\n");
      return {
        path,
        headers: lines
          .filter((line) => line.startsWith("  "))
          .map((line) => {
            const index = line.indexOf(":");
            return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
          }),
      };
    });
  const serve = sirv(root, { dev: true });
  return createServer((req, res) => {
    const pathname = new URL(req.url, "http://localhost").pathname;
    const redirect = redirects.find(([source]) => source === pathname);
    if (redirect) {
      res.writeHead(Number(redirect[2]), { Location: redirect[1] });
      res.end();
      return;
    }
    for (const { path, headers } of groups)
      if (path.endsWith("*") ? pathname.startsWith(path.slice(0, -1)) : pathname === path)
        for (const [name, value] of headers) res.setHeader(name, value);
    serve(req, res, () => {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(readFileSync(root + "/404.html"));
    });
  });
}
if (process.argv[1]?.endsWith("tests/website/serve.mjs"))
  websiteServer("dist").listen(4173, "127.0.0.1");
