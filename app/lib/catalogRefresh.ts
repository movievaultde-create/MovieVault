import { revalidatePath, revalidateTag } from "next/cache";
import { submitIndexNow } from "./indexnow";
import { getFreshWatchUrls } from "./sitemapCatalog";
import { SITE_URL } from "./siteUrl";

export const CATALOG_CACHE_TAG = "catalog";

const HUB_PATHS = [
  "/",
  "/movies",
  "/tv-series",
  "/korean-series",
  "/indian-series",
  "/indian-movies",
  "/arab-movies",
  "/arab-series",
  "/turkish-series",
  "/foreign-movies",
  "/foreign-series",
  "/collections",
];

/**
 * Twice daily: bust TMDB catalog caches so arab/turkish/korean/etc hubs refresh,
 * then submit fresh watch + hub URLs to IndexNow.
 */
export async function refreshCatalogAndIndex() {
  revalidateTag(CATALOG_CACHE_TAG, "max");
  for (const path of HUB_PATHS) {
    revalidatePath(path);
  }
  revalidatePath("/sitemap.xml");

  const urls = await getFreshWatchUrls();
  const result = await submitIndexNow(urls);
  await submitIndexNow([`${SITE_URL}/sitemap.xml`]);
  return { ...result, urls: urls.length };
}
