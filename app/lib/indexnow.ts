import { SITE_URL } from "./siteUrl";

/** Public IndexNow key (must match the file in /public). */
export const INDEXNOW_KEY = "movie-vault-indexnow-8f3c1a2b";
export const INDEXNOW_KEY_LOCATION = `${SITE_URL}/${INDEXNOW_KEY}.txt`;

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

function canNotify(): boolean {
  if (process.env.VERCEL_ENV === "preview") return false;
  if (process.env.NEXT_PHASE === "phase-production-build") return false;
  return true;
}

/** Submit up to 10,000 URLs to IndexNow (Bing / Yandex / partners including Google). */
export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; submitted: number }> {
  const unique = [...new Set(urls.map((url) => url.trim()).filter((url) => url.startsWith("http")))];
  if (!canNotify() || unique.length === 0) return { ok: false, submitted: 0 };

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: INDEXNOW_KEY_LOCATION,
        urlList: unique.slice(0, 10_000),
      }),
      signal: AbortSignal.timeout(8_000),
      cache: "no-store",
    });
    return { ok: res.ok || res.status === 202, submitted: unique.length };
  } catch {
    return { ok: false, submitted: 0 };
  }
}

/**
 * Tell search engines about one watch page.
 * Cached a week per URL so repeat visits do not hit IndexNow again.
 */
export async function notifyIndexNow(url: string): Promise<void> {
  if (!canNotify() || !url.startsWith("http")) return;
  const ping = `${INDEXNOW_ENDPOINT}?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}&keyLocation=${encodeURIComponent(INDEXNOW_KEY_LOCATION)}`;
  try {
    await fetch(ping, {
      method: "GET",
      signal: AbortSignal.timeout(1_500),
      next: { revalidate: 60 * 60 * 24 * 7 },
    } as RequestInit);
  } catch {
    // IndexNow must never block watching.
  }
}
