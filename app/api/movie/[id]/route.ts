import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const TMDB_BASE = "https://api.themoviedb.org/3";
export const dynamic = "force-dynamic";

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
  media_type?: string;
}

interface TmdbVideo {
  key?: string;
  site?: string;
  type?: string;
  official?: boolean;
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
    const [movieRes, creditsRes, videosRes] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/${id}?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${TMDB_BASE}/movie/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${TMDB_BASE}/movie/${id}/videos?api_key=${TMDB_KEY}&language=${lang}`, opts),
    ]);

    if (!movieRes.ok) {
      return NextResponse.json(
        { error: "Movie not found" },
        { status: movieRes.status }
      );
    }

    const movie = await movieRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [], crew: [] };
    const videos = videosRes.ok ? await videosRes.json() : { results: [] };
    const youtubeVideos: TmdbVideo[] = (videos.results ?? []).filter(
      (v: TmdbVideo) => v.site === "YouTube" && typeof v.key === "string" && v.key.length > 0,
    );
    const trailer =
      youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
      youtubeVideos.find((v) => v.type === "Trailer") ??
      youtubeVideos.find((v) => v.type === "Teaser") ??
      youtubeVideos[0];

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
      const genreQuery = genreIds.join(",");
      const relatedRequests = [
        fetch(
          `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&with_genres=${genreQuery}&vote_count.gte=1&page=1`,
          opts
        ),
        fetch(
          `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&with_genres=${genreQuery}&vote_count.gte=1&page=2`,
          opts
        ),
      ];

      const [relatedResPage1, relatedResPage2] = await Promise.all(relatedRequests);
      const relatedPayloads = await Promise.all([
        relatedResPage1.ok ? relatedResPage1.json() : { results: [] },
        relatedResPage2.ok ? relatedResPage2.json() : { results: [] },
      ]);

      const deduped = new Map<number, TmdbRelatedMovie>();
      for (const payload of relatedPayloads) {
        for (const item of payload.results ?? []) {
          if (!item?.id || item.id === Number(id)) continue;
          deduped.set(item.id, item);
        }
      }

      relatedMovies = [...deduped.values()]
        .slice(0, 10)
        .map((item: TmdbRelatedMovie) => ({
          id: item.id,
          title: item.title ?? `Movie #${item.id}`,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: item.vote_average?.toFixed(1) ?? "0.0",
          year: (item.release_date ?? "").slice(0, 4),
          type: "movie" as const,
        }));

      if (relatedMovies.length < 10) {
        const recommendationsRes = await fetch(
          `${TMDB_BASE}/movie/${id}/recommendations?api_key=${TMDB_KEY}&language=${lang}&page=1`,
          opts
        );
        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          const existingIds = new Set(relatedMovies.map((movieItem) => movieItem.id));
          const fallback = (recommendationsData.results ?? [])
            .filter((item: TmdbRelatedMovie) => item.id && !existingIds.has(item.id))
            .slice(0, 10 - relatedMovies.length)
            .map((item: TmdbRelatedMovie) => ({
              id: item.id,
              title: item.title ?? `Movie #${item.id}`,
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              rating: item.vote_average?.toFixed(1) ?? "0.0",
              year: (item.release_date ?? "").slice(0, 4),
              type: "movie" as const,
            }));
          relatedMovies = [...relatedMovies, ...fallback].slice(0, 10);
        }
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
      trailerYoutubeKey: trailer?.key ?? null,
      relatedMovies,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 }
    );
  }
}
