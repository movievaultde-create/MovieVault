import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];

interface TmdbItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
}

function mapItem(item: TmdbItem, type: "movie" | "tv") {
  return {
    id: item.id,
    title: item.title ?? item.name ?? "",
    poster: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    rating: item.vote_average?.toFixed(1) ?? "0",
    year: (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
    type,
  };
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function weekAgoStr() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString().slice(0, 10);
}

const fetchOpts = { next: { revalidate: 3600 } } as RequestInit;

export async function GET(req: NextRequest) {
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({
      addedToday: [],
      trending: [],
      movies: [],
      series: [],
      anime: [],
    });
  }

  const today = todayStr();
  const weekAgo = weekAgoStr();

  try {
    const [addedTodayRes, trendingRes, moviesRes, seriesRes, animeRes] = await Promise.all([
      fetch(
        `${BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&primary_release_date.gte=${weekAgo}&primary_release_date.lte=${today}&page=1`,
        fetchOpts
      ),
      fetch(
        `${BASE}/trending/all/week?api_key=${TMDB_KEY}&language=${lang}&page=1`,
        fetchOpts
      ),
      fetch(
        `${BASE}/trending/movie/week?api_key=${TMDB_KEY}&language=${lang}&page=1`,
        fetchOpts
      ),
      fetch(
        `${BASE}/tv/popular?api_key=${TMDB_KEY}&language=${lang}&page=1`,
        fetchOpts
      ),
      fetch(
        `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&with_genres=16&with_keywords=210024&with_original_language=ja&sort_by=popularity.desc&page=1`,
        fetchOpts
      ),
    ]);

    const [addedToday, trending, movies, series, anime] = await Promise.all([
      addedTodayRes.ok ? addedTodayRes.json() : { results: [] },
      trendingRes.ok ? trendingRes.json() : { results: [] },
      moviesRes.ok ? moviesRes.json() : { results: [] },
      seriesRes.ok ? seriesRes.json() : { results: [] },
      animeRes.ok ? animeRes.json() : { results: [] },
    ]);

    return NextResponse.json({
      addedToday: addedToday.results?.slice(0, 12).map((m: TmdbItem) => mapItem(m, "movie")) ?? [],
      trending: trending.results
        ?.filter((t: TmdbItem) => t.media_type === "movie" || t.media_type === "tv")
        .slice(0, 12)
        .map((t: TmdbItem) => mapItem(t, (t.media_type as "movie" | "tv") ?? "movie")) ?? [],
      movies: movies.results?.slice(0, 12).map((m: TmdbItem) => mapItem(m, "movie")) ?? [],
      series: series.results?.slice(0, 12).map((s: TmdbItem) => mapItem(s, "tv")) ?? [],
      anime: anime.results?.slice(0, 12).map((a: TmdbItem) => mapItem(a, "tv")) ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
