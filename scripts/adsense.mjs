export const ADSENSE_PUBLISHER_ID = "ca-pub-1040851064865171";
export const ADSENSE_SCRIPT_URL = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`;

// This runs only for prerendered public production pages. Keep the verification
// loader visible in the initial HTML without coupling it to React hydration.
export function addAdSenseVerification(html) {
  if (!html.includes("</head>")) throw new Error("AdSense requires an HTML head.");
  if (/<script\b[^>]*src=["'][^"']*adsbygoogle\.js/i.test(html))
    throw new Error("Refusing to add a duplicate AdSense loader.");
  const consent =
    '<script id="adsense-consent-default">' +
    "window.adsbygoogle=window.adsbygoogle||[];window.adsbygoogle.pauseAdRequests=1;" +
    "window.dataLayer=window.dataLayer||[];" +
    'window.dataLayer.push((function(){return arguments;})("consent","default",' +
    '{analytics_storage:"denied",ad_storage:"denied",ad_user_data:"denied",ad_personalization:"denied"}));' +
    "</script>";
  const loader = `<script async src="${ADSENSE_SCRIPT_URL}" crossorigin="anonymous"></script>`;
  return html.replace("</head>", `${consent}${loader}</head>`);
}
