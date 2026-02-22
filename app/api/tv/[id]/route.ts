import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({
      id: Number(id),
      name: `TV Show #${id}`,
      overview: "",
      first_air_date: "",
      vote_average: 0,
      vote_count: 0,
      poster_path: null,
      genres: [],
      number_of_seasons: 1,
      seasons: [{ season_number: 1, name: "Season 1", episode_count: 10, poster: null }],
      cast: [],
    });
  }

  try {
    const opts = { next: { revalidate: 3600 } } as RequestInit;
    const [showRes, creditsRes] = await Promise.all([
      fetch(`${BASE}/tv/${id}?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${BASE}/tv/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`, opts),
    ]);

    if (!showRes.ok) {
      return NextResponse.json({ error: "Show not found" }, { status: showRes.status });
    }

    const show = await showRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };

    return NextResponse.json({
      id: show.id,
      name: show.name,
      overview: show.overview,
      first_air_date: show.first_air_date,
      vote_average: show.vote_average,
      vote_count: show.vote_count,
      poster_path: show.poster_path
        ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
        : null,
      genres: show.genres?.map((g: { name: string }) => g.name) ?? [],
      number_of_seasons: show.number_of_seasons,
      seasons: show.seasons
        ?.filter((s: { season_number: number }) => s.season_number > 0)
        .map(
          (s: {
            season_number: number;
            name: string;
            episode_count: number;
            poster_path: string | null;
          }) => ({
            season_number: s.season_number,
            name: s.name,
            episode_count: s.episode_count,
            poster: s.poster_path
              ? `https://image.tmdb.org/t/p/w300${s.poster_path}`
              : null,
          })
        ) ?? [],
      cast:
        credits.cast
          ?.slice(0, 6)
          .map(
            (c: { name: string; character: string; profile_path: string | null }) => ({
              name: c.name,
              character: c.character,
              photo: c.profile_path
                ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
                : null,
            })
          ) ?? [],
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
