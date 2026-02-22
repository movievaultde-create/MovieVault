import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; season: string }> }
) {
  const { id, season } = await params;
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({
      season_number: Number(season),
      episodes: Array.from({ length: 10 }, (_, i) => ({
        episode_number: i + 1,
        name: `Episode ${i + 1}`,
        overview: "",
        still: null,
        runtime: 45,
        vote_average: 0,
      })),
    });
  }

  try {
    const res = await fetch(
      `${BASE}/tv/${id}/season/${season}?api_key=${TMDB_KEY}&language=${lang}`,
      { next: { revalidate: 3600 } } as RequestInit
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Season not found" }, { status: res.status });
    }

    const data = await res.json();

    return NextResponse.json({
      season_number: data.season_number,
      episodes:
        data.episodes?.map(
          (ep: {
            episode_number: number;
            name: string;
            overview: string;
            still_path: string | null;
            runtime: number | null;
            vote_average: number;
          }) => ({
            episode_number: ep.episode_number,
            name: ep.name,
            overview: ep.overview,
            still: ep.still_path
              ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
              : null,
            runtime: ep.runtime,
            vote_average: ep.vote_average,
          })
        ) ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
