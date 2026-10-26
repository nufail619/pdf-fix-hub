import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { usePrivacy } from "@/context/PrivacyContext";
import { isAdvertisingContent } from "@/lib/ad-eligibility";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function AdSlot({ slotId, className = "" }: { slotId: string; className?: string }) {
  const { adsenseId, noIndex } = useSiteConfig();
  const { choices } = usePrivacy();
  const content = useRouterState({
    select: (state) =>
      state.status === "idle" &&
      state.matches.every((match) => match.status === "success" && !match._notFound) &&
      isAdvertisingContent(state.location.pathname),
  });
  const eligible = content && !noIndex && choices?.advertising === true;

  useEffect(() => {
    if (!eligible || !adsenseId) return;
    try {
      // @ts-expect-error adsbygoogle is injected globally
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* no-op */
    }
  }, [adsenseId, slotId, eligible]);

  if (!eligible || !adsenseId) return null;

  return (
    <ins
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={adsenseId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
