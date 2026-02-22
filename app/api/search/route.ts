import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

interface TmdbSearchResult {
  id: number;
  title?: string;
  name?: string;
  media_type: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `${BASE}/search/multi?api_key=${TMDB_KEY}&language=${lang}&query=${encodeURIComponent(q)}&page=1&include_adult=false`
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();

    const results = (data.results ?? [])
      .filter(
        (item: TmdbSearchResult) =>
          item.media_type === "movie" || item.media_type === "tv"
      )
      .slice(0, 8)
      .map((item: TmdbSearchResult) => ({
        id: item.id,
        title: item.title ?? item.name ?? "",
        type: item.media_type as "movie" | "tv",
        poster: item.poster_path
          ? `https://image.tmdb.org/t/p/w92${item.poster_path}`
          : null,
        year: (item.release_date ?? item.first_air_date ?? "").slice(0, 4),
        rating: item.vote_average?.toFixed(1) ?? "0",
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
