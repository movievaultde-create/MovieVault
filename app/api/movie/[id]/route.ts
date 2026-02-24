import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbRelatedMovie {
  id: number;
  title?: string;
  poster_path?: string | null;
  vote_average?: number;
  release_date?: string;
}

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
      title: `Movie #${id}`,
      overview: "",
      release_date: "",
      runtime: 0,
      vote_average: 0,
      vote_count: 0,
      poster_path: null,
      backdrop_path: null,
      genres: [],
      original_language: "en",
      production_countries: [],
      director: null,
      cast: [],
      relatedMovies: [],
    });
  }

  try {
    const opts = { next: { revalidate: 3600 } } as RequestInit;
    const [movieRes, creditsRes] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${TMDB_BASE}/movie/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`, opts),
    ]);

    if (!movieRes.ok) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: movieRes.status }
      );
    }

    const movie = await movieRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };

    const director = credits.crew?.find(
      (c: { job: string }) => c.job === "Director"
    );
    const genreIds: number[] = movie.genres?.map((g: TmdbGenre) => g.id).filter(Boolean) ?? [];

    let relatedMovies: Array<{
      id: number;
      title: string;
      poster: string | null;
      rating: string;
      year: string;
      type: "movie";
    }> = [];

    if (genreIds.length > 0) {
      const relatedRes = await fetch(
        `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&with_genres=${genreIds[0]}&vote_count.gte=30&page=1`,
        opts
      );

      if (relatedRes.ok) {
        const relatedData = await relatedRes.json();
        relatedMovies = (relatedData.results ?? [])
          .filter((item: TmdbRelatedMovie) => item.id !== Number(id))
          .slice(0, 10)
          .map((item: TmdbRelatedMovie) => ({
            id: item.id,
            title: item.title ?? `Movie #${item.id}`,
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
            rating: item.vote_average?.toFixed(1) ?? "0.0",
            year: (item.release_date ?? "").slice(0, 4),
            type: "movie" as const,
          }));
      }
    }

    return NextResponse.json({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      runtime: movie.runtime,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      poster_path: movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null,
      backdrop_path: movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : null,
      genres: movie.genres?.map((g: { name: string }) => g.name) ?? [],
      original_language: movie.original_language,
      production_countries:
        movie.production_countries?.map((c: { name: string }) => c.name) ?? [],
      director: director?.name ?? null,
      cast:
        credits.cast
          ?.slice(0, 6)
          .map((c: { name: string; character: string; profile_path: string | null }) => ({
            name: c.name,
            character: c.character,
            photo: c.profile_path
              ? `https://image.tmdb.org/t/p/w185${c.profile_path}`
              : null,
          })) ?? [],
      relatedMovies,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 }
    );
  }
}
