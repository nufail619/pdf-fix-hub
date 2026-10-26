# AdSense verification

The owner-approved public publisher ID is `ca-pub-1040851064865171`, defined once
in `scripts/adsense.mjs`. Vite uses the same value in client configuration and the
static build generates the matching `ads.txt` record. An old or blank hosting
`VITE_ADSENSE_ID` cannot substitute a different publisher.

The finalized initial HTML of each public production page contains exactly:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1040851064865171"
  crossorigin="anonymous"
></script>
```

The verification loader is added inside the HTML head after Google's denied
consent defaults and `adsbygoogle.pauseAdRequests = 1`. It is not injected into
Preview/noindex builds, the admin entry, or the shared 404 fallback. The existing
client loader checks script URLs as well as IDs, so advertising consent and
client navigation do not add a second copy.

Loading verification contacts Google before a visitor chooses privacy settings.
The privacy notice and policies disclose that request. Ad requests remain paused
until advertising consent, browser opt-out signals keep them paused, and
withdrawing advertising consent reloads with denied defaults. This is site
verification configuration, not a claim of approval for monetization or a
replacement for provider-required account/consent configuration.

Expected production `https://mypdffix.com/ads.txt` content:

```text
google.com, pub-1040851064865171, DIRECT, f08c47fec0942fa0
```

Automated checks inspect all 40 public pages' initial HTML, publisher ID, head
placement, script count and attributes. Browser checks verify paused defaults,
acceptance, navigation, revocation and browser opt-out behavior. The browser
suites use an inert substitute for Google's external loader to avoid creating
real ad traffic; production ships the actual Google URL above.

The production build command remains `npm run build`, with output `dist`.
Cloudflare Pages publishes production from GitHub `main`; development Preview
builds remain on `develop/pdf-tools-repair`. Publishing the tested commit to
production requires the owner's authorization, supplied for this change.

After publishing, verify the initial live HTML and `ads.txt`, then select Verify
in the owner's AdSense account if Google still requests confirmation. Installing
the code does not itself establish Google's account-side verification/approval.
