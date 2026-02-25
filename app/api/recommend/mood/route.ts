import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";
const VALID_LANGS = ["en-US", "ar-SA", "de-DE", "fr-FR", "es-ES", "tr-TR"];
const VIP_EMAILS = (process.env.VIP_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

type MoodKey =
  | "exciting"
  | "funny"
  | "dark"
  | "chill"
  | "mindblowing"
  | "family"
  | "romantic";

interface MoodProfile {
  key: MoodKey;
  label: string;
  movieGenres: number[];
  tvGenres: number[];
}

interface TmdbDiscoverItem {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  popularity?: number;
  genre_ids?: number[];
}

interface RecommendationItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
  reason: string;
  confidence: number;
}

const MOOD_PROFILES: Record<MoodKey, MoodProfile> = {
  exciting: {
    key: "exciting",
    label: "Exciting",
    movieGenres: [28, 12, 53],
    tvGenres: [10759, 80],
  },
  funny: {
    key: "funny",
    label: "Funny",
    movieGenres: [35],
    tvGenres: [35],
  },
  dark: {
    key: "dark",
    label: "Dark",
    movieGenres: [27, 53, 9648],
    tvGenres: [9648, 80],
  },
  chill: {
    key: "chill",
    label: "Chill",
    movieGenres: [18, 10749],
    tvGenres: [18, 10751],
  },
  mindblowing: {
    key: "mindblowing",
    label: "Mind-Blowing",
    movieGenres: [878, 9648, 53],
    tvGenres: [9648, 10765],
  },
  family: {
    key: "family",
    label: "Family",
    movieGenres: [16, 10751, 12],
    tvGenres: [10751, 16],
  },
  romantic: {
    key: "romantic",
    label: "Romantic",
    movieGenres: [10749, 18],
    tvGenres: [18, 35],
  },
};

function buildDiscoverUrl({
  mediaType,
  lang,
  page,
  genres,
}: {
  mediaType: "movie" | "tv";
  lang: string;
  page: number;
  genres: number[];
}): string {
  const dateSortField = mediaType === "movie" ? "release_date" : "first_air_date";
  return (
    `${BASE}/discover/${mediaType}?api_key=${TMDB_KEY}` +
    `&language=${lang}` +
    `&include_adult=false` +
    `&include_null_first_air_dates=false` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=50` +
    `&with_genres=${genres.join(",")}` +
    `&page=${page}` +
    `&${dateSortField}.lte=${new Date().toISOString().slice(0, 10)}`
  );
}

function normalizeItem(item: TmdbDiscoverItem, type: "movie" | "tv"): RecommendationItem | null {
  const title = item.title ?? item.name ?? item.original_title ?? item.original_name ?? "";
  if (!title) return null;

  const year = (item.release_date ?? item.first_air_date ?? "").slice(0, 4);
  const posterPath = item.poster_path ?? item.backdrop_path ?? null;
  const poster = posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null;
  const voteAverage = item.vote_average ?? 0;
  const voteCount = item.vote_count ?? 0;
  const popularity = item.popularity ?? 0;
  const confidence = Math.min(
    99,
    Math.round(Math.max(55, voteAverage * 7 + Math.log10(voteCount + 1) * 10 + popularity / 25)),
  );

  return {
    id: item.id,
    title,
    poster,
    rating: voteAverage > 0 ? voteAverage.toFixed(1) : "N/A",
    year,
    type,
    reason: "",
    confidence,
  };
}

function buildReason(item: RecommendationItem, mood: MoodProfile): string {
  const yearPart = item.year ? ` and a ${item.year} release` : "";
  return `${mood.label} match with strong audience score (${item.rating})${yearPart}.`;
}

export async function GET(req: NextRequest) {
  const moodParam = (req.nextUrl.searchParams.get("mood") ?? "exciting").toLowerCase();
  const mood = (MOOD_PROFILES[moodParam as MoodKey] ?? MOOD_PROFILES.exciting) as MoodProfile;
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";
  const lang = VALID_LANGS.includes(langParam) ? langParam : "en-US";
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
  const isVip = email ? VIP_EMAILS.includes(email) : false;

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json(
      {
        mood: mood.key,
        label: mood.label,
        locked: !isVip,
        isVip,
        items: [],
      },
      { status: 200 },
    );
  }

  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(
        buildDiscoverUrl({
          mediaType: "movie",
          lang,
          page: 1,
          genres: mood.movieGenres,
        }),
        { next: { revalidate: 900 } } as RequestInit,
      ),
      fetch(
        buildDiscoverUrl({
          mediaType: "tv",
          lang,
          page: 1,
          genres: mood.tvGenres,
        }),
        { next: { revalidate: 900 } } as RequestInit,
      ),
    ]);

    const [movieData, tvData] = await Promise.all([
      movieRes.ok ? movieRes.json() : Promise.resolve({ results: [] }),
      tvRes.ok ? tvRes.json() : Promise.resolve({ results: [] }),
    ]);

    const movies = ((movieData.results ?? []) as TmdbDiscoverItem[])
      .map((item) => normalizeItem(item, "movie"))
      .filter((item): item is RecommendationItem => Boolean(item));
    const shows = ((tvData.results ?? []) as TmdbDiscoverItem[])
      .map((item) => normalizeItem(item, "tv"))
      .filter((item): item is RecommendationItem => Boolean(item));

    const merged = [...movies, ...shows];
    const deduped = new Map<string, RecommendationItem>();
    for (const item of merged) {
      const key = `${item.type}-${item.id}`;
      if (!deduped.has(key)) {
        deduped.set(key, {
          ...item,
          reason: buildReason(item, mood),
        });
      }
    }

    const ranked = [...deduped.values()].sort((a, b) => b.confidence - a.confidence);
    const fullLimit = 10;
    const teaserLimit = 2;
    const limited = ranked.slice(0, isVip ? fullLimit : teaserLimit);

    return NextResponse.json({
      mood: mood.key,
      label: mood.label,
      locked: !isVip,
      isVip,
      total: ranked.length,
      items: limited,
      upgradeMessage: !isVip
        ? "Unlock VIP to access the full AI recommendation list."
        : null,
    });
  } catch {
    return NextResponse.json(
      {
        mood: mood.key,
        label: mood.label,
        locked: !isVip,
        isVip,
        items: [],
      },
      { status: 200 },
    );
  }
}
