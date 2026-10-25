export type PrivacyChoices = { analytics: boolean; advertising: boolean };
export type StoredPrivacyChoices = PrivacyChoices & { version: 1; savedAt: number };
export const PRIVACY_STORAGE_KEY = "pdf-fix-hub-privacy-v1";
export const deniedChoices: PrivacyChoices = { analytics: false, advertising: false };

export function parsePrivacyChoices(
  raw: string | null,
  now = Date.now(),
): StoredPrivacyChoices | null {
  try {
    const value = JSON.parse(raw || "null");
    if (
      !value ||
      value.version !== 1 ||
      typeof value.analytics !== "boolean" ||
      typeof value.advertising !== "boolean" ||
      !Number.isFinite(value.savedAt) ||
      value.savedAt > now ||
      now - value.savedAt > 180 * 24 * 60 * 60 * 1000
    )
      return null;
    return {
      version: 1,
      savedAt: value.savedAt,
      analytics: value.analytics,
      advertising: value.advertising,
    };
  } catch {
    return null;
  }
}

export function serviceIds(config: {
  gaId: string;
  gtmId: string;
  clarityId: string;
  adsenseId: string;
}) {
  return {
    ga: /^G-[A-Z0-9]+$/.test(config.gaId) ? config.gaId : "",
    gtm: /^GTM-[A-Z0-9]+$/.test(config.gtmId) ? config.gtmId : "",
    clarity: /^[a-z0-9]{5,30}$/i.test(config.clarityId) ? config.clarityId : "",
    adsense: /^ca-pub-\d{16}$/.test(config.adsenseId) ? config.adsenseId : "",
  };
}
