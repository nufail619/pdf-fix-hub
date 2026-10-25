/* Authentication is provided by GitHub and the configured Sveltia authenticator. */
(async () => {
  const message = document.getElementById("setup-message");
  try {
    const response = await fetch("/admin/runtime.json", { cache: "no-store" });
    if (!response.ok) throw new Error("The admin configuration could not be loaded.");
    const runtime = await response.json();
    if (!runtime.authConfigured) {
      message.textContent =
        "GitHub sign-in is not configured yet. Complete the OAuth setup in docs/CMS-SETUP.md, set CMS_AUTH_URL in Cloudflare Pages, and rebuild. No content can be changed from this screen.";
      return;
    }
    const script = document.createElement("script");
    script.src = "/admin/vendor/sveltia-cms.js";
    script.onload = () => document.getElementById("setup")?.remove();
    script.onerror = () => {
      message.textContent =
        "The content manager could not load. Please reload or contact the site administrator.";
    };
    document.head.append(script);
  } catch {
    message.textContent =
      "The content manager is unavailable. Please check the admin setup and rebuild the site.";
  }
})();
