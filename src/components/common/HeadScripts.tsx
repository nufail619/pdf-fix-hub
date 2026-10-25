import { useEffect, useRef } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { serviceIds } from "@/lib/privacy-consent";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
};

function script(id: string, src: string, crossOrigin?: string) {
  if (document.getElementById(id)) return;
  const element = document.createElement("script");
  element.id = id;
  element.async = true;
  element.src = src;
  if (crossOrigin) element.crossOrigin = crossOrigin;
  document.head.append(element);
}

export function HeadScripts() {
  const cfg = useSiteConfig();
  const { choices } = usePrivacy();
  const consentInitialized = useRef(false);
  useEffect(() => {
    if (!choices) return;
    const ids = serviceIds(cfg);
    const win = window as TrackingWindow;
    win.dataLayer ||= [];
    function gtag(..._args: unknown[]) {
      // Google's documented queue format uses the function's argument record.
      // eslint-disable-next-line prefer-rest-params
      win.dataLayer!.push(arguments);
    }
    gtag("consent", consentInitialized.current ? "update" : "default", {
      analytics_storage: choices.analytics ? "granted" : "denied",
      ad_storage: choices.advertising ? "granted" : "denied",
      ad_user_data: choices.advertising ? "granted" : "denied",
      ad_personalization: choices.advertising ? "granted" : "denied",
    });
    consentInitialized.current = true;
    if (choices.analytics) {
      if (ids.gtm) {
        if (!document.getElementById("head-gtm"))
          win.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
        script("head-gtm", `https://www.googletagmanager.com/gtm.js?id=${ids.gtm}`);
      } else if (ids.ga) {
        if (!document.getElementById("head-ga")) {
          gtag("js", new Date());
          gtag("config", ids.ga);
        }
        script("head-ga", `https://www.googletagmanager.com/gtag/js?id=${ids.ga}`);
      }
      if (ids.clarity) {
        win.clarity ||= Object.assign(
          (...args: unknown[]) => {
            win.clarity!.q ||= [];
            win.clarity!.q.push(args);
          },
          { q: [] as unknown[][] },
        );
        script("head-clarity", `https://www.clarity.ms/tag/${ids.clarity}`);
      }
    }
    if (choices.advertising && ids.adsense)
      script(
        "head-adsense",
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ids.adsense}`,
        "anonymous",
      );
  }, [cfg, choices]);
  return null;
}
