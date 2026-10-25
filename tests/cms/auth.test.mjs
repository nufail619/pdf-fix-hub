import test from "node:test";
import assert from "node:assert/strict";
import worker from "../../cms-auth/index.js";

const env = {
  ALLOWED_DOMAINS: "pdf.example.test",
  GITHUB_CLIENT_ID: "test-client-id",
  GITHUB_CLIENT_SECRET: "test-only-secret",
};
const request = (path, headers) => new Request(`https://cms-auth.example.test${path}`, { headers });

test("auth fails closed without credentials or an exact allowlist", async () => {
  for (const value of [
    {},
    { ...env, GITHUB_CLIENT_SECRET: "" },
    { ...env, ALLOWED_DOMAINS: "*" },
    { ...env, ALLOWED_DOMAINS: "*.example.test" },
  ]) {
    assert.equal(
      (await worker.fetch(request("/auth?provider=github&site_id=pdf.example.test"), value)).status,
      503,
    );
  }
});

test("auth redirects to GitHub and sets a Secure HttpOnly CSRF cookie", async () => {
  const response = await worker.fetch(
    request("/auth?provider=github&site_id=pdf.example.test"),
    env,
  );
  assert.equal(response.status, 302);
  const url = new URL(response.headers.get("Location"));
  assert.equal(url.origin, "https://github.com");
  assert.equal(url.pathname, "/login/oauth/authorize");
  assert.match(url.searchParams.get("state"), /^[a-f0-9]{32}$/);
  assert.match(response.headers.get("Set-Cookie"), /HttpOnly.*SameSite=Lax; Secure/);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("untrusted sites and unsupported OAuth providers cannot start authentication", async () => {
  assert.match(
    await (await worker.fetch(request("/auth?provider=github&site_id=evil.test"), env)).text(),
    /UNSUPPORTED_DOMAIN/,
  );
  assert.match(
    await (
      await worker.fetch(request("/auth?provider=gitlab&site_id=pdf.example.test"), env)
    ).text(),
    /MISCONFIGURED_CLIENT/,
  );
});

test("missing or mismatched callback state is rejected before a token exchange", async () => {
  const state = "a".repeat(32);
  const response = await worker.fetch(
    request(`/callback?code=test-code&state=${state}`, {
      Cookie: `csrf-token=github_${"b".repeat(32)}`,
    }),
    env,
  );
  assert.match(await response.text(), /CSRF_DETECTED/);
  assert.match(response.headers.get("Set-Cookie"), /Max-Age=0/);
  assert.match(response.headers.get("Content-Security-Policy"), /script-src 'sha256-/);
  const missing = await worker.fetch(request("/callback"), env);
  assert.match(await missing.text(), /UNSUPPORTED_BACKEND/);
});

test("token exchange stays server-side and the response checks opener origin", async (t) => {
  const state = "a".repeat(32);
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    return Response.json({ access_token: "TEST-ONLY-NOT-A-CREDENTIAL" });
  });
  const response = await worker.fetch(
    request(`/callback?code=test-code&state=${state}`, { Cookie: `csrf-token=github_${state}` }),
    env,
  );
  const html = await response.text();
  assert.equal(calls[0].url, "https://github.com/login/oauth/access_token");
  assert.equal(calls[0].body.client_secret, env.GITHUB_CLIENT_SECRET);
  assert(!html.includes(env.GITHUB_CLIENT_SECRET));
  assert.match(html, /isTrusted\(origin\)/);
  assert.match(html, /authorization:github:success/);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("only GET auth and callback routes are accepted", async () => {
  assert.equal((await worker.fetch(request("/unexpected"), env)).status, 404);
  assert.equal(
    (await worker.fetch(new Request("https://cms-auth.example.test/auth", { method: "POST" }), env))
      .status,
    405,
  );
});
