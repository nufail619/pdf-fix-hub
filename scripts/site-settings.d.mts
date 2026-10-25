export function siteSettings(
  root?: string,
  runtime?: NodeJS.ProcessEnv,
): {
  env: Record<string, string>;
  siteUrl: string;
  noIndex: boolean;
};
