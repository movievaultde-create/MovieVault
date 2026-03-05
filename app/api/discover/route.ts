import { NextRequest, NextResponse } from "next/server";
import { fetchAniListDiscover } from "../../lib/anilist";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];

/** Normalize title for similarity: lowercase, collapse spaces, remove punctuation. */
function normalizeTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Similarity score 0..1: 1 = exact match, high = one contains the other or very close. */
function titleSimilarity(a: string, b: string): number {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (na === nb) return 1;
  if (na.length < 2 || nb.length < 2) return 0;
  if (na.includes(nb) || nb.includes(na)) return Math.min(na.length, nb.length) / Math.max(na.length, nb.length);
  const wordsA = new Set(na.split(" ").filter(Boolean));
  const wordsB = new Set(nb.split(" ").filter(Boolean));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = wordsA.size + wordsB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

const ANILIST_TMDB_SIMILARITY_THRESHOLD = 0.4;

/**
 * Fallback: search TMDB via /search/multi by title (Romaji or English); return TMDB id + type if name and year match.
 * Uses multi so we don't ignore items — both movie and TV results are considered.
 */
async function findTmdbIdByTitleMulti(
  title: string,
  year: string | null,
  lang: string
): Promise<{ id: number; type: "movie" | "tv" } | null> {
  if (!TMDB_KEY || !title || title.length < 2) return null;
  const url = `${BASE}/search/multi?api_key=${TMDB_KEY}&language=${lang}&query=${encodeURIComponent(title)}&page=1`;
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) return null;
    const data = await res.json();
    const results = (data.results ?? []).filter(
      (item: { media_type?: string }) => item.media_type === "movie" || item.media_type === "tv"
    );
    if (results.length === 0) return null;
    const yearNum = year ? parseInt(year, 10) : null;
    let best: { id: number; type: "movie" | "tv"; score: number } | null = null;
    for (const item of results.slice(0, 10)) {
      const name = item.name ?? item.title ?? "";
      const releaseYear = (item.first_air_date ?? item.release_date ?? "").slice(0, 4);
      const relYear = releaseYear ? parseInt(releaseYear, 10) : null;
      const score = titleSimilarity(title, name);
      const yearMatch = yearNum == null || relYear == null || Math.abs(yearNum - relYear) <= 2;
      const finalScore = yearMatch ? score : score * 0.6;
      if (
        finalScore >= ANILIST_TMDB_SIMILARITY_THRESHOLD &&
        (best == null || finalScore > best.score)
      ) {
        best = {
          id: item.id,
          type: item.media_type === "movie" ? "movie" : "tv",
          score: finalScore,
        };
      }
    }
    return best ? { id: best.id, type: best.type } : null;
  } catch {
    return null;
  }
}

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

function mapItem(item: TmdbItem, type: "movie" | "tv") {
  const fallbackTitle = item.original_title ?? item.original_name ?? "";
  return {
    id: item.id,
    title: item.title ?? item.name ?? fallbackTitle,
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    rating: item.vote_average?.toFixed(1) ?? "0",
    year: (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
    type,
  };
}

export async function GET(req: NextRequest) {
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";
  const page = Math.min(Math.max(Number(req.nextUrl.searchParams.get("page")) || 1, 1), 500);
  const category = req.nextUrl.searchParams.get("category") ?? "movies";

  // AniList (optional demographic: Shounen, Seinen)
  const anilistCategories = ["anilist", "anilist-shounen", "anilist-seinen"];
  const demographicByCategory: Record<string, "Shounen" | "Seinen" | null> = {
    anilist: null,
    "anilist-shounen": "Shounen",
    "anilist-seinen": "Seinen",
  };
  if (anilistCategories.includes(category)) {
    const demographic = demographicByCategory[category];
    try {
      const data = await fetchAniListDiscover({
        page,
        perPage: 20,
        sort: ["POPULARITY_DESC"],
        genre: demographic ?? undefined,
      });
      // Don't ignore items without TMDB in external links: fallback via /search/multi (name + year)
      const needFallback =
        TMDB_KEY && TMDB_KEY !== "YOUR_TMDB_API_KEY_HERE"
          ? data.results.filter((r) => r.tmdbId == null)
          : [];
      const fallbackMatches = await Promise.all(
        needFallback.map((r) => findTmdbIdByTitleMulti(r.title, r.year || null, lang))
      );
      const withFallback = data.results.map((r) => {
        if (r.tmdbId != null) return r;
        const idx = needFallback.indexOf(r);
        const match = idx >= 0 ? fallbackMatches[idx] : null;
        if (match) return { ...r, tmdbId: match.id, type: match.type };
        return r;
      });
      const results = withFallback
        .filter((r) => r.tmdbId != null)
        .map((r) => ({
          id: r.tmdbId,
          title: r.title,
          poster: r.poster,
          rating: r.rating,
          year: r.year,
          type: r.type,
          studio: r.studio ?? undefined,
        }));
      return NextResponse.json({ results, page: data.page, total_pages: data.total_pages });
    } catch {
      return NextResponse.json({ results: [], page: 1, total_pages: 1 });
    }
  }

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({ results: [], page: 1, total_pages: 1 });
  }

  try {
    let url: string;

    switch (category) {
      case "movies":
        url = `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&page=${page}`;
        break;
      case "series":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&page=${page}&without_genres=16`;
        break;
      // Anime: TMDB genre 16=Animation, keyword 210024=anime, ja=Japanese
      case "anime":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      // Action: + genre 10759 (Action & Adventure) - TMDB TV genres
      case "anime-action":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16,10759&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      // Family: + genre 10751 (Family) - TMDB TV genres
      case "anime-family":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16,10751&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      // 18+: show all anime so the category is never empty; banner on page notes "may contain mature content"
      case "anime-18":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      case "arab-movies":
        url = `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=ar-SA&with_original_language=ar&sort_by=popularity.desc&page=${page}`;
        break;
      case "arab-series":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=ar-SA&with_original_language=ar&sort_by=popularity.desc&page=${page}`;
        break;
      case "turkish-series":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_original_language=tr&sort_by=popularity.desc&page=${page}`;
        break;
      case "korean-series":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_original_language=ko&sort_by=popularity.desc&page=${page}`;
        break;
      case "indian-series":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_original_language=hi&sort_by=popularity.desc&page=${page}`;
        break;
      case "indian-movies":
        url = `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&with_original_language=hi&sort_by=popularity.desc&page=${page}`;
        break;
      case "trending":
        url = `${BASE}/trending/all/week?api_key=${TMDB_KEY}&language=${lang}&page=${page}`;
        break;
      default:
        url = `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&page=${page}`;
    }

    const fetchOpts = { next: { revalidate: 86400 } } as RequestInit;
    let res = await fetch(url, fetchOpts);
    let data: { results?: unknown[]; page?: number; total_pages?: number } = { results: [], page: 1, total_pages: 1 };

    if (res.ok) {
      data = await res.json();
    }

    if (!res.ok) {
      return NextResponse.json({ results: [], page: 1, total_pages: 1 });
    }

    const type = (category === "movies" || category === "arab-movies" || category === "indian-movies") ? "movie" : category === "trending" ? "movie" : "tv";

    const rawResults = (data.results ?? []) as (TmdbItem & { media_type?: string })[];
    const results = rawResults.map((item) => {
      const itemType = item.media_type
        ? (item.media_type as "movie" | "tv")
        : (type as "movie" | "tv");
      return mapItem(item, itemType);
    });

    return NextResponse.json({
      results,
      page: data.page ?? page,
      total_pages: Math.min(data.total_pages ?? 1, 500),
    });
  } catch {
    return NextResponse.json({ results: [], page, total_pages: 1 });
  }
}
