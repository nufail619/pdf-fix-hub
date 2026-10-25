import authenticator from "./upstream.js";

// The upstream Sveltia authenticator handles OAuth, CSRF cookies and postMessage
// origin checks. Require its optional hostname allowlist here so it fails closed.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["/auth", "/callback"].includes(url.pathname))
      return new Response("Not found", { status: 404 });
    if (request.method !== "GET")
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET" } });
    const domains = (env.ALLOWED_DOMAINS || "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const configured =
      domains.length > 0 &&
      domains.every((v) => /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9-]+$/i.test(v));
    if (!configured || !env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return new Response("GitHub authentication is not configured.", {
        status: 503,
        headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
      });
    }
    // Do not allow this deployment to select an arbitrary OAuth token destination.
    const response = await authenticator.fetch(request, {
      ALLOWED_DOMAINS: domains.join(","),
      GITHUB_CLIENT_ID: env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: env.GITHUB_CLIENT_SECRET,
    });
    const headers = new Headers(response.headers);
    headers.set("Cache-Control", "no-store");
    headers.set("Referrer-Policy", "no-referrer");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("X-Frame-Options", "DENY");
    const body = await response.text();
    const script = body.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    const digest = script
      ? new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(script)))
      : null;
    const hash = digest ? btoa(String.fromCharCode(...digest)) : "";
    headers.set(
      "Content-Security-Policy",
      `default-src 'none'; script-src ${hash ? `'sha256-${hash}'` : "'none'"}; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`,
    );
    return new Response(body, { status: response.status, headers });
  },
};
