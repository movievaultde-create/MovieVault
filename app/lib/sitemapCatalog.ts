import type { MetadataRoute } from "next";
import { getCombinedBlogPosts, getCombinedBlogTags } from "./blog";
import { HOT_MOVIE_IDS, HOT_TV_IDS } from "./hotCatalog";
import { SITE_URL } from "./siteUrl";
import { watchPath } from "./watchUrl";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";
const REVALIDATE = 86_400;

const PAGES_PER_CHUNK = 50;
const MOVIE_POPULAR_PAGES = 100;
const TV_POPULAR_PAGES = 100;
const MOVIE_CHUNKS = Math.ceil(MOVIE_POPULAR_PAGES / PAGES_PER_CHUNK);
const TV_CHUNKS = Math.ceil(TV_POPULAR_PAGES / PAGES_PER_CHUNK);

export const SITEMAP_FILE_COUNT = 1 + MOVIE_CHUNKS + 1 + TV_CHUNKS + 1;

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

async function fetchPages(
  path: string,
  type: "movie" | "tv",
  pageList: number[]
): Promise<CatalogItem[]> {
  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") return [];
  const urls = pageList.map(
    (page) =>
      `${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}&language=en-US&page=${page}`
  );
  const chunks: CatalogItem[] = [];
  for (let i = 0; i < urls.length; i += 8) {
    const batch = await Promise.all(urls.slice(i, i + 8).map(fetchJson));
    chunks.push(...batch.flatMap((data) => itemsFromList(data, type)));
  }
  return chunks;
}

function uniqueItems(items: CatalogItem[]): CatalogItem[] {
  const byKey = new Map<string, CatalogItem>();
  for (const item of items) {
    const key = `${item.type}:${item.id}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()];
}

function toWatchEntries(
  items: CatalogItem[],
  changeFrequency: "daily" | "weekly"
): MetadataRoute.Sitemap {
  const now = new Date();
  return uniqueItems(items).map((item) => ({
    url: encodeURI(`${SITE_URL}${watchPath(item.type, item.id, item.title)}`),
    lastModified: now,
    changeFrequency,
    priority: 0.8,
  }));
}

async function fetchHotMissing(): Promise<CatalogItem[]> {
  const out: CatalogItem[] = [];
  const missing: Array<{ type: "movie" | "tv"; id: number }> = [
    ...HOT_MOVIE_IDS.map((id) => ({ type: "movie" as const, id })),
    ...HOT_TV_IDS.map((id) => ({ type: "tv" as const, id })),
  ];
  for (let i = 0; i < missing.length; i += 8) {
    const batch = missing.slice(i, i + 8);
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

async function staticSitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [blogPosts, blogTags] = await Promise.all([
    getCombinedBlogPosts(),
    getCombinedBlogTags(),
  ]);
  const BASE = SITE_URL;

  return [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${BASE}/movies`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/tv-series`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/anime`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/korean-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/indian-movies`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/arab-movies`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/arab-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/turkish-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/foreign-movies`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/foreign-series`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/collections`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacy-policy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/affiliate-disclosure`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/impressum`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE}/datenschutz`, lastModified: now, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/blog/rss.xml`, lastModified: now, changeFrequency: "daily", priority: 0.4 },
    { url: `${BASE}/guides`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/guides/best-action-movies-2026`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/guides/family-movies-weekend`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/guides/how-to-choose-movie-tonight`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    ...blogPosts.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...blogTags.map((tag) => ({
      url: `${BASE}/blog/tag/${tag}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}

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

/** Homepage rails + hubs + language catalogs — sent to IndexNow twice daily. */
export async function getFreshWatchUrls(): Promise<string[]> {
  const [
    nowPlaying,
    upcoming,
    onAir,
    trendingMovies,
    trendingTv,
    popularMovies,
    popularTv,
    arabMovies,
    arabTv,
    turkishTv,
    koreanTv,
    hindiMovies,
  ] = await Promise.all([
    fetchPages("/movie/now_playing", "movie", pages(1, 3)),
    fetchPages("/movie/upcoming", "movie", pages(1, 3)),
    fetchPages("/tv/on_the_air", "tv", pages(1, 3)),
    fetchPages("/trending/movie/day", "movie", pages(1, 2)),
    fetchPages("/trending/tv/day", "tv", pages(1, 2)),
    fetchPages("/movie/popular", "movie", pages(1, 2)),
    fetchPages("/tv/popular", "tv", pages(1, 2)),
    fetchPages("/discover/movie?with_original_language=ar&sort_by=popularity.desc", "movie", pages(1, 2)),
    fetchPages("/discover/tv?with_original_language=ar&sort_by=popularity.desc", "tv", pages(1, 2)),
    fetchPages("/discover/tv?with_original_language=tr&sort_by=popularity.desc", "tv", pages(1, 2)),
    fetchPages("/discover/tv?with_original_language=ko&sort_by=popularity.desc", "tv", pages(1, 2)),
    fetchPages("/discover/movie?with_original_language=hi&sort_by=popularity.desc", "movie", pages(1, 2)),
  ]);
  const watchUrls = uniqueItems([
    ...nowPlaying,
    ...upcoming,
    ...onAir,
    ...trendingMovies,
    ...trendingTv,
    ...popularMovies,
    ...popularTv,
    ...arabMovies,
    ...arabTv,
    ...turkishTv,
    ...koreanTv,
    ...hindiMovies,
  ]).map((item) => encodeURI(`${SITE_URL}${watchPath(item.type, item.id, item.title)}`));
  const hubs = HUB_PATHS.map((path) => `${SITE_URL}${path === "/" ? "" : path}`);
  return [...hubs, `${SITE_URL}/sitemap.xml`, ...watchUrls];
}

export async function getSitemapEntriesForId(id: number): Promise<MetadataRoute.Sitemap> {
  if (id <= 0) return staticSitemap();

  if (id <= MOVIE_CHUNKS) {
    const start = (id - 1) * PAGES_PER_CHUNK + 1;
    const end = Math.min(id * PAGES_PER_CHUNK, MOVIE_POPULAR_PAGES);
    return toWatchEntries(await fetchPages("/movie/popular", "movie", pages(start, end)), "weekly");
  }

  const movieExtrasId = MOVIE_CHUNKS + 1;
  if (id === movieExtrasId) {
    const [top, nowPlaying, upcoming, trending, arab, hindi, korean] = await Promise.all([
      fetchPages("/movie/top_rated", "movie", pages(1, 15)),
      fetchPages("/movie/now_playing", "movie", pages(1, 5)),
      fetchPages("/movie/upcoming", "movie", pages(1, 5)),
      fetchPages("/trending/movie/week", "movie", pages(1, 3)),
      fetchPages("/discover/movie?with_original_language=ar&sort_by=popularity.desc", "movie", pages(1, 8)),
      fetchPages("/discover/movie?with_original_language=hi&sort_by=popularity.desc", "movie", pages(1, 8)),
      fetchPages("/discover/movie?with_original_language=ko&sort_by=popularity.desc", "movie", pages(1, 5)),
    ]);
    return toWatchEntries(
      [...top, ...nowPlaying, ...upcoming, ...trending, ...arab, ...hindi, ...korean],
      "weekly"
    );
  }

  const tvStartId = movieExtrasId + 1;
  if (id < tvStartId + TV_CHUNKS) {
    const chunk = id - tvStartId + 1;
    const start = (chunk - 1) * PAGES_PER_CHUNK + 1;
    const end = Math.min(chunk * PAGES_PER_CHUNK, TV_POPULAR_PAGES);
    return toWatchEntries(await fetchPages("/tv/popular", "tv", pages(start, end)), "daily");
  }

  const [top, onAir, trending, arab, turkish, korean, hindi, hot] = await Promise.all([
    fetchPages("/tv/top_rated", "tv", pages(1, 15)),
    fetchPages("/tv/on_the_air", "tv", pages(1, 5)),
    fetchPages("/trending/tv/week", "tv", pages(1, 3)),
    fetchPages("/discover/tv?with_original_language=ar&sort_by=popularity.desc", "tv", pages(1, 8)),
    fetchPages("/discover/tv?with_original_language=tr&sort_by=popularity.desc", "tv", pages(1, 8)),
    fetchPages("/discover/tv?with_original_language=ko&sort_by=popularity.desc", "tv", pages(1, 8)),
    fetchPages("/discover/tv?with_original_language=hi&sort_by=popularity.desc", "tv", pages(1, 5)),
    fetchHotMissing(),
  ]);
  return toWatchEntries(
    [...top, ...onAir, ...trending, ...arab, ...turkish, ...korean, ...hindi, ...hot],
    "daily"
  );
}
