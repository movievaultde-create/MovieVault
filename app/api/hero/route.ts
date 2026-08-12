import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";
const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];

/** Daily hero — TMDB trending/day #1 with backdrop. Revalidates every 24h. */
const fetchOpts = { next: { revalidate: 86400 } } as RequestInit;

interface TmdbTrendingItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  overview?: string;
  backdrop_path: string | null;
  poster_path: string | null;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
}

interface TmdbGenre {
  id: number;
  name: string;
}

const FALLBACK = {
  id: 693134,
  type: "movie" as const,
  title: "Dune: Part Two",
  overview:
    "Paul Atreides unites with the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
  year: "2024",
  rating: "8.6",
  runtime: "166 min",
  genre: "Sci-Fi, Adventure",
  backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
  poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
};

export async function GET(req: NextRequest) {
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";

  const headers = {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
  };

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json(FALLBACK, { headers });
  }

  try {
    const trendingRes = await fetch(
      `${BASE}/trending/all/day?api_key=${TMDB_KEY}&language=${lang}&page=1`,
      fetchOpts
    );

    if (!trendingRes.ok) {
      return NextResponse.json(FALLBACK, { headers });
    }

    const trending = (await trendingRes.json()) as { results?: TmdbTrendingItem[] };
    const pick =
      trending.results?.find(
        (item) =>
          (item.media_type === "movie" || item.media_type === "tv") &&
          Boolean(item.backdrop_path)
      ) ?? null;

    if (!pick || !pick.backdrop_path) {
      return NextResponse.json(FALLBACK, { headers });
    }

    const type = pick.media_type === "tv" ? "tv" : "movie";
    const detailRes = await fetch(
      `${BASE}/${type}/${pick.id}?api_key=${TMDB_KEY}&language=${lang}`,
      fetchOpts
    );

    if (!detailRes.ok) {
      return NextResponse.json(
        {
          id: pick.id,
          type,
          title: pick.title ?? pick.name ?? FALLBACK.title,
          overview: pick.overview || FALLBACK.overview,
          year: (pick.release_date ?? pick.first_air_date ?? "").slice(0, 4) || FALLBACK.year,
          rating: pick.vote_average?.toFixed(1) ?? FALLBACK.rating,
          runtime: null,
          genre: "",
          backdrop: `https://image.tmdb.org/t/p/original${pick.backdrop_path}`,
          poster: pick.poster_path
            ? `https://image.tmdb.org/t/p/w500${pick.poster_path}`
            : null,
        },
        { headers }
      );
    }

    const detail = await detailRes.json();
    const genres: string = (detail.genres as TmdbGenre[] | undefined)
      ?.slice(0, 2)
      .map((g) => g.name)
      .join(", ") ?? "";

    let runtime: string | null = null;
    if (type === "movie" && detail.runtime) {
      runtime = `${detail.runtime} min`;
    } else if (type === "tv") {
      if (detail.number_of_seasons) {
        runtime = `${detail.number_of_seasons} season${detail.number_of_seasons > 1 ? "s" : ""}`;
      } else if (Array.isArray(detail.episode_run_time) && detail.episode_run_time[0]) {
        runtime = `${detail.episode_run_time[0]} min`;
      }
    }

    return NextResponse.json(
      {
        id: detail.id ?? pick.id,
        type,
        title: detail.title ?? detail.name ?? pick.title ?? pick.name ?? FALLBACK.title,
        overview: detail.overview || pick.overview || FALLBACK.overview,
        year: (detail.release_date ?? detail.first_air_date ?? pick.release_date ?? pick.first_air_date ?? "").slice(0, 4) || FALLBACK.year,
        rating: (detail.vote_average ?? pick.vote_average)?.toFixed(1) ?? FALLBACK.rating,
        runtime,
        genre: genres,
        backdrop: `https://image.tmdb.org/t/p/original${detail.backdrop_path ?? pick.backdrop_path}`,
        poster: (detail.poster_path ?? pick.poster_path)
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path ?? pick.poster_path}`
          : null,
      },
      { headers }
    );
  } catch {
    return NextResponse.json(FALLBACK, { headers });
  }
}
