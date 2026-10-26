export const ADSENSE_PUBLISHER_ID: string;
export const ADSENSE_SCRIPT_URL: string;
export function isAdEligiblePath(pathname: string, publicPaths: readonly string[]): boolean;
export function addAdSenseVerification(html: string, options?: { allowAds?: boolean }): string;
