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
};

export const defaultSiteConfig: SiteConfig = {
  siteName: "MY PDF FIX",
  siteUrl: "",
  defaultTitle: "MY PDF FIX — Free Online PDF Tools",
  defaultDescription:
    "Every tool you need to work with PDFs in one place. Merge, split, compress, convert and edit PDFs for free, right in your browser.",
  defaultOgImage: "/og-default.svg",
  contactEmail: "hello@example.com",
  adsenseId: "",
  adsenseAutoAdsCode: "",
  gaId: "",
  gtmId: "",
  clarityId: "",
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
