import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";
export const dynamic = "force-dynamic";

interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbRelatedShow {
  id: number;
  name?: string;
  poster_path?: string | null;
  vote_average?: number;
  first_air_date?: string;
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
      name: `TV Show #${id}`,
      overview: "",
      first_air_date: "",
      vote_average: 0,
      vote_count: 0,
      poster_path: null,
      backdrop_path: null,
      genres: [],
      number_of_seasons: 1,
      seasons: [{ season_number: 1, name: "Season 1", episode_count: 10, poster: null }],
      cast: [],
      relatedShows: [],
    });
  }

  try {
    const opts = { next: { revalidate: 3600 } } as RequestInit;
    const [showRes, creditsRes, videosRes] = await Promise.all([
      fetch(`${BASE}/tv/${id}?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${BASE}/tv/${id}/credits?api_key=${TMDB_KEY}&language=${lang}`, opts),
      fetch(`${BASE}/tv/${id}/videos?api_key=${TMDB_KEY}&language=${lang}`, opts),
    ]);

    if (!showRes.ok) {
      return NextResponse.json({ error: "Show not found" }, { status: showRes.status });
    }

    const show = await showRes.json();
    const credits = creditsRes.ok ? await creditsRes.json() : { cast: [] };
    const videos = videosRes.ok ? await videosRes.json() : { results: [] };
    const youtubeVideos: TmdbVideo[] = (videos.results ?? []).filter(
      (v: TmdbVideo) => v.site === "YouTube" && typeof v.key === "string" && v.key.length > 0,
    );
    const trailer =
      youtubeVideos.find((v) => v.type === "Trailer" && v.official) ??
      youtubeVideos.find((v) => v.type === "Trailer") ??
      youtubeVideos.find((v) => v.type === "Teaser") ??
      youtubeVideos[0];

    const genreIds: number[] = show.genres?.map((g: TmdbGenre) => g.id).filter(Boolean) ?? [];
    let relatedShows: Array<{
      id: number;
      title: string;
      poster: string | null;
      rating: string;
      year: string;
      type: "tv";
    }> = [];

    if (genreIds.length > 0) {
      const genreQuery = genreIds.join(",");
      const [relatedResPage1, relatedResPage2] = await Promise.all([
        fetch(
          `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&with_genres=${genreQuery}&vote_count.gte=1&page=1`,
          opts
        ),
        fetch(
          `${BASE}/discover/tv?api_key=${TMDB_KEY}&language=${lang}&sort_by=popularity.desc&with_genres=${genreQuery}&vote_count.gte=1&page=2`,
          opts
        ),
      ]);

      const relatedPayloads = await Promise.all([
        relatedResPage1.ok ? relatedResPage1.json() : { results: [] },
        relatedResPage2.ok ? relatedResPage2.json() : { results: [] },
      ]);

      const deduped = new Map<number, TmdbRelatedShow>();
      for (const payload of relatedPayloads) {
        for (const item of payload.results ?? []) {
          if (!item?.id || item.id === Number(id)) continue;
          deduped.set(item.id, item);
        }
      }

      relatedShows = [...deduped.values()]
        .slice(0, 10)
        .map((item: TmdbRelatedShow) => ({
          id: item.id,
          title: item.name ?? `TV Show #${item.id}`,
          poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
          rating: item.vote_average?.toFixed(1) ?? "0.0",
          year: (item.first_air_date ?? "").slice(0, 4),
          type: "tv" as const,
        }));

      if (relatedShows.length < 10) {
        const recommendationsRes = await fetch(
          `${BASE}/tv/${id}/recommendations?api_key=${TMDB_KEY}&language=${lang}&page=1`,
          opts
        );
        if (recommendationsRes.ok) {
          const recommendationsData = await recommendationsRes.json();
          const existingIds = new Set(relatedShows.map((showItem) => showItem.id));
          const fallback = (recommendationsData.results ?? [])
            .filter((item: TmdbRelatedShow) => item.id && !existingIds.has(item.id))
            .slice(0, 10 - relatedShows.length)
            .map((item: TmdbRelatedShow) => ({
              id: item.id,
              title: item.name ?? `TV Show #${item.id}`,
              poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
              rating: item.vote_average?.toFixed(1) ?? "0.0",
              year: (item.first_air_date ?? "").slice(0, 4),
              type: "tv" as const,
            }));
          relatedShows = [...relatedShows, ...fallback].slice(0, 10);
        }
      }
    }

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
      backdrop_path: show.backdrop_path
        ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
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
      trailerYoutubeKey: trailer?.key ?? null,
      relatedShows,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
