import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import sirv from "sirv";

// Mirror Pages static _headers locally, including its CSP, for browser tests.
const groups = readFileSync("dist/_headers", "utf8")
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
const serve = sirv("dist", { single: true });
createServer((req, res) => {
  const pathname = new URL(req.url, "http://127.0.0.1").pathname;
  for (const { path, headers } of groups)
    if (path.endsWith("*") ? pathname.startsWith(path.slice(0, -1)) : pathname === path) {
      for (const [name, value] of headers) res.setHeader(name, value);
    }
  serve(req, res);
}).listen(4173, "127.0.0.1", () => console.log("CMS production test server ready"));
