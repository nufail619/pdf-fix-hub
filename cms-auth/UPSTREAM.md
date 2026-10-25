The MIT-licensed `upstream.js` is Sveltia CMS Authenticator from:
https://github.com/sveltia/sveltia-cms-auth

Pinned source commit: `5623041efafa3984ad5d9fd7820c63a05403b863`.
Its license is preserved in LICENSE.txt. The source is unchanged.

index.js wraps the upstream handler to require an exact hostname allowlist and
GitHub configuration, restrict it to GitHub.com, and add no-cache and security
headers. It is deployed separately from the static Cloudflare Pages website.
