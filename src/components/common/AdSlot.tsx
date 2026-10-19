import { useEffect } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function AdSlot({ slotId, className = "" }: { slotId: string; className?: string }) {
  const { adsenseId } = useSiteConfig();

  useEffect(() => {
    if (!adsenseId) return;
    try {
      // @ts-expect-error adsbygoogle is injected globally
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* no-op */
    }
  }, [adsenseId, slotId]);

  if (!adsenseId) return null;

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
