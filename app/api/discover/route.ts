import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];

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
      case "anime":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      case "anime-action":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16,10759&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      case "anime-family":
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16,10751&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
        break;
      case "anime-18":
        // TMDB discover/tv does not support certification; use keyword 27281 (mature/ecchi) for real 18+ anime
        url = `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16&with_keywords=210024,27281&with_original_language=ja&sort_by=popularity.desc&page=${page}`;
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

    // Daily refresh (86400 = 24h)
    const res = await fetch(url, { next: { revalidate: 86400 } } as RequestInit);
    if (!res.ok) {
      return NextResponse.json({ results: [], page, total_pages: 1 });
    }

    const data = await res.json();
    const type = (category === "movies" || category === "arab-movies" || category === "indian-movies") ? "movie" : category === "trending" ? "movie" : "tv";

    const results = (data.results ?? []).map((item: TmdbItem & { media_type?: string }) => {
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
