import { useEffect, useRef } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { isAdvertisingContent } from "@/lib/ad-eligibility";
import { useSiteConfig } from "@/context/SiteConfigContext";
import { usePrivacy } from "@/context/PrivacyContext";
import { serviceIds } from "@/lib/privacy-consent";

type TrackingWindow = Window & {
  dataLayer?: unknown[];
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  adsbygoogle?: unknown[] & { pauseAdRequests?: number };
};

function script(id: string, src: string, crossOrigin?: string) {
  if (document.getElementById(id) || Array.from(document.scripts).some((item) => item.src === src))
    return;
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
  const router = useRouter();
  const eligible =
    useRouterState({
      select: (state) =>
        state.status === "idle" &&
        state.matches.every((match) => match.status === "success" && !match._notFound) &&
        isAdvertisingContent(state.location.pathname),
    }) && !cfg.noIndex;
  useEffect(() => {
    // Removing a script cannot stop code it already executed (including Auto ads).
    // Leave the ad-bearing document entirely before showing an excluded screen.
    const unblock = router.history.block({
      enableBeforeUnload: false,
      blockerFn: ({ nextLocation }) => {
        const win = window as TrackingWindow;
        if (
          !isAdvertisingContent(router.parseLocation(nextLocation).pathname) &&
          Array.from(document.scripts).some((item) =>
            item.src.includes("/pagead/js/adsbygoogle.js"),
          )
        ) {
          (win.adsbygoogle ||= []).pauseAdRequests = 1;
          window.location.assign(nextLocation.href);
          return true;
        }
        return false;
      },
    });
    const pause = () => {
      ((window as TrackingWindow).adsbygoogle ||= []).pauseAdRequests = 1;
    };
    window.addEventListener("pagehide", pause);
    return () => {
      unblock();
      window.removeEventListener("pagehide", pause);
      pause();
    };
  }, [router]);
  useEffect(() => {
    const win = window as TrackingWindow;
    (win.adsbygoogle ||= []).pauseAdRequests = choices?.advertising && eligible ? 0 : 1;
    if (!choices) return;
    const ids = serviceIds(cfg);
    win.dataLayer ||= [];
    function gtag(..._args: unknown[]) {
      // Google's documented queue format uses the function's argument record.
      // eslint-disable-next-line prefer-rest-params
      win.dataLayer!.push(arguments);
    }
    const initialized =
      consentInitialized.current || !!document.getElementById("adsense-consent-default");
    gtag("consent", initialized ? "update" : "default", {
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
    if (eligible && choices.advertising && ids.adsense)
      script(
        "head-adsense",
        `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ids.adsense}`,
        "anonymous",
      );
  }, [cfg, choices, eligible]);
  return null;
}
