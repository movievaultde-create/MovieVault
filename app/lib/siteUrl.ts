function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/** Public brand domain that should appear in Google/Bing search results. */
export const BRAND_SITE_URL = "https://movie-vault.dev";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const fallback = BRAND_SITE_URL;
  if (!raw) return fallback;
  const cleaned = stripTrailingSlash(raw);
  const host = hostnameOf(cleaned);
  // Alias/parked hosts must not become the canonical search identity.
  if (!host || host === "shaheiid4u.net" || host.endsWith(".vercel.app")) {
    return fallback;
  }
  return cleaned;
}

/**
 * Canonical origin for search, Open Graph, sitemap, and robots (no trailing slash).
 */
export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
