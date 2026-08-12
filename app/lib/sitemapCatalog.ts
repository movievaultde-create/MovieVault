import type { MetadataRoute } from "next";
import { HOT_MOVIE_IDS, HOT_TV_IDS } from "./hotCatalog";
import { SITE_URL } from "./siteUrl";
import { watchPath } from "./watchUrl";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const REVALIDATE = 86_400;

type CatalogItem = { type: "movie" | "tv"; id: number; title: string };

type TmdbListResponse = {
  results?: Array<{
    id?: number;
    title?: string;
    name?: string;
    media_type?: string;
  }>;
};

function pages(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

async function fetchJson(url: string): Promise<TmdbListResponse | null> {
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE } } as RequestInit);
    if (!res.ok) return null;
    return (await res.json()) as TmdbListResponse;
  } catch {
    return null;
  }
}

function itemsFromList(
  data: TmdbListResponse | null,
  fallbackType: "movie" | "tv"
): CatalogItem[] {
  if (!data?.results) return [];
  const out: CatalogItem[] = [];
  for (const row of data.results) {
    const id = Number(row.id);
    if (!Number.isFinite(id) || id <= 0) continue;
    const type =
      row.media_type === "tv" || row.media_type === "movie"
        ? row.media_type
        : fallbackType;
    const title = (type === "tv" ? row.name : row.title) || row.name || row.title || "";
    if (!title.trim()) continue;
    out.push({ type, id, title: title.trim() });
  }
  return out;
}

async function fetchPages(path: string, type: "movie" | "tv", pageList: number[]): Promise<CatalogItem[]> {
  const urls = pageList.map(
    (page) => `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}&language=en-US&page=${page}`
  );
  const chunks: CatalogItem[] = [];
  for (let i = 0; i < urls.length; i += 6) {
    const batch = await Promise.all(urls.slice(i, i + 6).map(fetchJson));
    chunks.push(...batch.flatMap((data) => itemsFromList(data, type)));
  }
  return chunks;
}

async function fetchHotMissing(existing: Set<string>): Promise<CatalogItem[]> {
  const missing: Array<{ type: "movie" | "tv"; id: number }> = [
    ...HOT_MOVIE_IDS.map((id) => ({ type: "movie" as const, id })),
    ...HOT_TV_IDS.map((id) => ({ type: "tv" as const, id })),
  ].filter((item) => !existing.has(`${item.type}:${item.id}`));

  const out: CatalogItem[] = [];
  for (let i = 0; i < missing.length; i += 6) {
    const batch = missing.slice(i, i + 6);
    const rows = await Promise.all(
      batch.map(async (item) => {
        const data = await fetchJson(
          `${TMDB_BASE}/${item.type}/${item.id}?api_key=${TMDB_KEY}&language=en-US`
        );
        const title =
          item.type === "tv"
            ? (data as { name?: string } | null)?.name
            : (data as { title?: string } | null)?.title;
        if (!title?.trim()) return null;
        return { type: item.type, id: item.id, title: title.trim() } satisfies CatalogItem;
      })
    );
    out.push(...rows.filter((row): row is CatalogItem => row !== null));
  }
  return out;
}

/** Popular / trending watch pages for Google & Bing sitemap discovery. */
export async function getWatchSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return [];

  const [
    popularMovies,
    topMovies,
    nowPlaying,
    upcoming,
    trendingMovies,
    popularTv,
    topTv,
    onAir,
    trendingTv,
    arabMovies,
    arabTv,
    turkishTv,
  ] = await Promise.all([
    fetchPages("/movie/popular", "movie", pages(1, 20)),
    fetchPages("/movie/top_rated", "movie", pages(1, 10)),
    fetchPages("/movie/now_playing", "movie", pages(1, 3)),
    fetchPages("/movie/upcoming", "movie", pages(1, 3)),
    fetchPages("/trending/movie/week", "movie", pages(1, 2)),
    fetchPages("/tv/popular", "tv", pages(1, 20)),
    fetchPages("/tv/top_rated", "tv", pages(1, 10)),
    fetchPages("/tv/on_the_air", "tv", pages(1, 3)),
    fetchPages("/trending/tv/week", "tv", pages(1, 2)),
    fetchPages("/discover/movie?with_original_language=ar&sort_by=popularity.desc", "movie", pages(1, 5)),
    fetchPages("/discover/tv?with_original_language=ar&sort_by=popularity.desc", "tv", pages(1, 5)),
    fetchPages("/discover/tv?with_original_language=tr&sort_by=popularity.desc", "tv", pages(1, 5)),
  ]);

  const merged = [
    ...popularMovies,
    ...topMovies,
    ...nowPlaying,
    ...upcoming,
    ...trendingMovies,
    ...popularTv,
    ...topTv,
    ...onAir,
    ...trendingTv,
    ...arabMovies,
    ...arabTv,
    ...turkishTv,
  ];

  const byKey = new Map<string, CatalogItem>();
  for (const item of merged) {
    const key = `${item.type}:${item.id}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }

  for (const item of await fetchHotMissing(new Set(byKey.keys()))) {
    byKey.set(`${item.type}:${item.id}`, item);
  }

  const now = new Date();
  return [...byKey.values()].slice(0, 2000).map((item) => ({
    url: encodeURI(`${SITE_URL}${watchPath(item.type, item.id, item.title)}`),
    lastModified: now,
    changeFrequency: item.type === "tv" ? "daily" : "weekly",
    priority: 0.8,
  }));
}
