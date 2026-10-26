export const ADSENSE_PUBLISHER_ID = "ca-pub-1040851064865171";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;

// Searchable listings and utility pages never load the ad runtime, including
// their nonempty states. The ownership meta tag and ads.txt remain available.
const excluded = new Set([
  "/",
  "/blog",
  "/guides",
  "/contact",
  "/privacy",
  "/cookie-policy",
  "/terms",
  "/disclaimer",
]);
export function isAdEligiblePath(pathname, publicPaths) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return publicPaths.includes(path) && !excluded.has(path);
}

export function addAdSenseVerification(html, { allowAds = true } = {}) {
  if (!html.includes("</head>")) throw new Error("AdSense requires an HTML head.");
  if (/<script\b[^>]*src=["'][^"']*adsbygoogle\.js/i.test(html))
    throw new Error("Refusing to add a duplicate AdSense loader.");
  const ownership = `<meta name="google-adsense-account" content="${ADSENSE_PUBLISHER_ID}">`;
  if (html.includes('name="google-adsense-account"'))
    throw new Error("Refusing to add duplicate AdSense ownership metadata.");
  if (!allowAds) return html.replace("</head>", `${ownership}</head>`);
  const consent =
    '<script id="adsense-consent-default">' +
    "window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.pauseAdRequests=1;" +
    "window.dataLayer=window.dataLayer||[];" +
    'window.dataLayer.push((function(){return arguments;})("consent","default",' +
    '{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"}));' +
    "</script>";
  const loader = `<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`;
  return html.replace("</head>", `${ownership}${consent}${loader}</head>`);
}
