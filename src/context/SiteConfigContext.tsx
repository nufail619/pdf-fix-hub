import { createContext, useContext, type ReactNode } from "react";

export type SiteConfig = {
  siteName: string;
  siteUrl: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string;
  contactEmail: string;
  adsenseId: string;
  adsenseAutoAdsCode: string;
  gaId: string;
  gtmId: string;
  clarityId: string;
  noIndex: boolean;
};

// Values come from .env (VITE_*) at build time. See .env.example.
const env = import.meta.env;

export const defaultSiteConfig: SiteConfig = {
  siteName: "MY PDF FIX",
  siteUrl: (env.VITE_SITE_URL || "https://mypdffix.com").replace(/\/$/, ""),
  defaultTitle: "MY PDF FIX — Free Online PDF Tools",
  defaultDescription:
    "25 free browser-based PDF tools. Merge, split, compress, convert and add overlays without uploading document contents.",
  defaultOgImage: "/og-default.png",
  // Keep the owner's address authoritative even if hosting retains a template value.
  contactEmail: "mypdffix@gmail.com",
  adsenseId: env.VITE_ADSENSE_ID ?? "",
  adsenseAutoAdsCode: "",
  gaId: env.VITE_GA_ID ?? "",
  gtmId: env.VITE_GTM_ID ?? "",
  clarityId: env.VITE_CLARITY_ID ?? "",
  noIndex: env.VITE_NOINDEX === "true",
};

const SiteConfigContext = createContext<SiteConfig>(defaultSiteConfig);

export function SiteConfigProvider({
  value,
  children,
}: {
  value?: Partial<SiteConfig>;
  children: ReactNode;
}) {
  const merged = { ...defaultSiteConfig, ...value };
  return <SiteConfigContext.Provider value={merged}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
