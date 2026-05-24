import { useEffect } from "react";
import { useSiteConfig } from "@/context/SiteConfigContext";

export function AdSlot({
  slotId,
  className = "",
  label = "Ad",
}: {
  slotId: string;
  className?: string;
  label?: string;
}) {
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

  if (!adsenseId) {
    return (
      <div
        className={`flex min-h-[120px] items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground ${className}`}
        aria-label="Ad slot placeholder"
      >
        {label} slot
      </div>
    );
  }

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
