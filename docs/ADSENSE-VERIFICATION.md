# AdSense ownership and advertising eligibility

The owner-approved public publisher ID is `ca-pub-1040851064865171`, defined once
in `scripts/adsense.mjs`. Vite uses that same value in client configuration, and
the static build generates the matching `ads.txt` record. Old or blank hosting
`VITE_ADSENSE_ID` values cannot substitute a different publisher.

Every public production page has this ownership tag in its initial HTML head:

```html
<meta name="google-adsense-account" content="ca-pub-1040851064865171" />
```

Google documents this verification option in
[Connect your site to AdSense](https://support.google.com/adsense/answer/7584263?hl=en).
The same publisher's loader is also retained on eligible content pages:

```html
<script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1040851064865171"
  crossorigin="anonymous"
></script>
```

The loader follows denied Google consent defaults and
`adsbygoogle.pauseAdRequests = 1`. It is excluded from Preview/noindex builds,
admin, missing pages, the homepage and article listings, Contact, and legal pages.
Searchable listings stay ad-free even when they have results, so typing or
changing a filter cannot leave a previously loaded ad runtime on an empty screen.
Ownership metadata and `ads.txt` do not require loading the advertising runtime.
At the current inventory, all 40 public pages have ownership metadata and 32
content pages have the verification loader (25 tools, six articles and About).

Runtime eligibility requires a known published content URL, successful settled
router matches, an indexable production build and advertising consent. This gate
also applies to the reusable manual ad-slot component, which is currently unused.
Navigating from a document containing Google's loader to an excluded URL pauses
requests and uses a full document navigation. This is necessary because removing
a script element does not undo code it already ran, including Auto ads. Eligible
content-to-content navigation can still use the client router without adding a
second loader. Privacy revocation retains the existing reload behavior.

Loading verification on eligible pages contacts Google before a privacy choice.
The privacy notice and policies disclose that request. Browser opt-out signals
keep advertising paused. Analytics consent handling remains separate from page
advertising eligibility. A custom preference dialog and a pause flag do not by
themselves establish compliance with any Google-certified CMP requirement.
Review the account's applicable consent requirements before monetization.

Production `https://mypdffix.com/ads.txt` remains:

```text
google.com, pub-1040851064865171, DIRECT, f08c47fec0942fa0
```

Automated tests inspect all 40 pages' initial ownership markup, eligible loader
placement, ID and attributes. Browser tests cover denied defaults, advertising
consent, revocation, opt-out, direct 404s, missing article routes, empty searches,
client navigation and back/forward navigation with saved consent. The tests use
an inert Google loader substitute and record requests without generating real ad
traffic. They do not prove actual ad fill or Google account approval.

The production build remains `npm run build`, output `dist`. Cloudflare Pages
production tracks `main`; development Preview tracks `develop/pdf-tools-repair`.
The current readiness changes must not be committed, pushed or deployed without
owner approval. After an approved release, recheck the live head and `ads.txt`,
then complete verification/review in the owner's AdSense account as needed.

Policy reference checked during this improvement task:
[Google-served ads on screens without publisher-content](https://support.google.com/publisherpolicies/answer/11112688?hl=en).
Google excludes screens without publisher content or with low-value content,
and screens for alerts, navigation or other behavioral purposes. Its examples
include error and other dead-end screens. These exclusions are not a statement
that every short page violates policy or that these fixes guarantee approval.
