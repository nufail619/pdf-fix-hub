// Test-only in-memory GitHub API. Never sends a write to GitHub or the project checkout.
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";

const hash = (text) => createHash("sha1").update(text).digest("hex");
const token = "TEST-ONLY-NOT-A-CREDENTIAL";
const date = "2026-10-25T00:00:00Z";

export async function installGitHubMock(context, { canWrite = true, rejectToken = false } = {}) {
  const files = new Map();
  const writes = [];
  const unexpected = [];
  let head = "a".repeat(40);
  for (const collection of ["blog", "guides"]) {
    for (const file of await readdir(`content/${collection}`)) {
      files.set(
        `content/${collection}/${file}`,
        await readFile(`content/${collection}/${file}`, "utf8"),
      );
    }
  }
  const history = () => ({
    target: {
      history: {
        nodes: [
          {
            oid: head,
            message: "Mock content commit",
            committedDate: date,
            author: {
              name: "CMS Tester",
              email: "test@example.test",
              user: { id: 1, login: "cms-test" },
            },
          },
        ],
      },
    },
  });
  await context.route("https://api.github.com/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (rejectToken || !request.headers().authorization?.includes(token))
      return route.fulfill({ status: 401, json: { message: "Bad credentials" } });
    if (url.pathname === "/user")
      return route.fulfill({
        json: {
          id: 1,
          login: "cms-test",
          name: "CMS Tester",
          email: "test@example.test",
          html_url: "https://github.com/cms-test",
        },
      });
    if (url.pathname === "/user/repository_invitations") return route.fulfill({ json: [] });
    if (url.pathname === "/repos/nufail619/pdf-fix-hub")
      return route.fulfill({
        json: {
          id: 1,
          node_id: "R_test",
          name: "pdf-fix-hub",
          default_branch: "develop/pdf-tools-repair",
          permissions: { pull: true, push: canWrite },
        },
      });
    if (url.pathname.includes("/git/trees/"))
      return route.fulfill({
        json: {
          tree: [...files].map(([path, data]) => ({
            path,
            type: "blob",
            sha: hash(data),
            size: Buffer.byteLength(data),
            mode: "100644",
          })),
          truncated: false,
        },
      });
    if (url.pathname.includes("/git/blobs/")) {
      const sha = url.pathname.split("/").at(-1);
      const found = [...files.values()].find((data) => hash(data) === sha);
      return found === undefined ? route.fulfill({ status: 404 }) : route.fulfill({ body: found });
    }
    if (url.pathname === "/graphql") {
      const { query, variables = {} } = request.postDataJSON();
      if (query.includes("createCommitOnBranch")) {
        const input = variables.input;
        if (!canWrite) return route.fulfill({ status: 403, json: { message: "Forbidden" } });
        if (input.branch.branchName !== "develop/pdf-tools-repair")
          throw new Error("CMS tried to write outside the development branch");
        if (input.expectedHeadOid !== head)
          throw new Error("CMS did not preserve the expected branch head");
        writes.push(input);
        for (const { path, contents } of input.fileChanges.additions || []) {
          const data = Buffer.from(contents, "base64");
          files.set(path, path.startsWith("public/uploads/") ? data : data.toString());
        }
        for (const { path } of input.fileChanges.deletions || []) files.delete(path);
        head = hash(JSON.stringify([...files]) + head);
        const commit = { oid: head, committedDate: date };
        for (const match of query.matchAll(/(file_\d+):\s*file\(path:\s*("(?:[^"\\]|\\.)*")\)/g))
          commit[match[1]] = { oid: hash(files.get(JSON.parse(match[2])) || "") };
        return route.fulfill({ json: { data: { createCommitOnBranch: { commit } } } });
      }
      const repository = {
        id: "R_test",
        defaultBranchRef: { name: "develop/pdf-tools-repair" },
        ref: { ...history(), refUpdateRule: null },
      };
      for (const match of query.matchAll(/(\w+):\s*object\(oid:\s*"([a-f0-9]+)"\)/g)) {
        const found = [...files.values()].find((value) => hash(value) === match[2]);
        repository[match[1]] = { text: found || "", isTruncated: false };
      }
      for (const match of query.matchAll(/(\w+):\s*ref\(/g)) repository[match[1]] = history();
      return route.fulfill({ json: { data: { repository } } });
    }
    unexpected.push(`${request.method()} ${url.pathname}`);
    return route.fulfill({ status: 404, json: { message: "Unimplemented mock route" } });
  });
  await context.route("https://cms-auth.example.test/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<script>addEventListener('message',event=>{if(event.origin==='http://127.0.0.1:4173'&&event.data==='authorizing:github')opener.postMessage('authorization:github:success:'+JSON.stringify({provider:'github',token:'${token}'}),event.origin)});opener.postMessage('authorizing:github','http://127.0.0.1:4173');</script>`,
    }),
  );
  // Nonessential status/update/font checks must not contact real services in tests.
  await context.route("https://www.githubstatus.com/**", (route) =>
    route.fulfill({ json: { status: { indicator: "none" } } }),
  );
  return { files, writes, unexpected };
}
