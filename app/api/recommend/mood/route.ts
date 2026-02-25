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
  strictGenres: number[];
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
  type: "movie";
  reason: string;
  confidence: number;
}

interface RankedRecommendationItem extends RecommendationItem {
  moodScore: number;
}

const MOOD_PROFILES: Record<MoodKey, MoodProfile> = {
  exciting: {
    key: "exciting",
    label: "Exciting",
    movieGenres: [28, 12, 53],
    strictGenres: [28, 12],
  },
  funny: {
    key: "funny",
    label: "Funny",
    movieGenres: [35],
    strictGenres: [35],
  },
  dark: {
    key: "dark",
    label: "Dark",
    movieGenres: [27, 53, 9648],
    strictGenres: [27, 53, 9648],
  },
  chill: {
    key: "chill",
    label: "Chill",
    movieGenres: [18, 10749],
    strictGenres: [18, 10749],
  },
  mindblowing: {
    key: "mindblowing",
    label: "Mind-Blowing",
    movieGenres: [878, 9648, 53],
    strictGenres: [878, 9648],
  },
  family: {
    key: "family",
    label: "Family",
    movieGenres: [16, 10751, 12],
    strictGenres: [16, 10751],
  },
  romantic: {
    key: "romantic",
    label: "Romantic",
    movieGenres: [10749, 18],
    strictGenres: [10749],
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
  const minReleaseDate = mediaType === "movie" ? "2010-01-01" : "2010-01-01";
  return (
    `${BASE}/discover/${mediaType}?api_key=${TMDB_KEY}` +
    `&language=${lang}` +
    `&include_adult=false` +
    `&include_null_first_air_dates=false` +
    `&sort_by=popularity.desc` +
    `&vote_count.gte=50` +
    `&with_genres=${genres.join(",")}` +
    `&page=${page}` +
    `&${dateSortField}.gte=${minReleaseDate}` +
    `&${dateSortField}.lte=${new Date().toISOString().slice(0, 10)}`
  );
}

function normalizeItem(item: TmdbDiscoverItem): RecommendationItem | null {
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
    type: "movie",
    reason: "",
    confidence,
  };
}

function buildReason(item: RecommendationItem, mood: MoodProfile): string {
  const yearPart = item.year ? ` and a ${item.year} release` : "";
  return `${mood.label} match with strong audience score (${item.rating})${yearPart}.`;
}

function calcMoodScore(itemGenres: number[], profile: MoodProfile): number {
  const strictHits = itemGenres.filter((g) => profile.strictGenres.includes(g)).length;
  const broadHits = itemGenres.filter((g) => profile.movieGenres.includes(g)).length;
  return strictHits * 3 + broadHits;
}

function getWeeklySeed(): number {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const days = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start.getTime()) / 86400000);
  return Math.floor((days + start.getUTCDay() + 1) / 7);
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
        locked: false,
        isVip,
        items: [],
      },
      { status: 200 },
    );
  }

  try {
    // Rotate source pages weekly so each mood list refreshes automatically every week.
    const weeklySeed = getWeeklySeed();
    const basePage = (weeklySeed % 8) + 1;
    const moviePages = [basePage, basePage + 1, basePage + 2, basePage + 3];
    const responses = await Promise.all(
      moviePages.map((page) =>
        fetch(
          buildDiscoverUrl({
            mediaType: "movie",
            lang,
            page,
            genres: mood.movieGenres,
          }),
          { next: { revalidate: 900 } } as RequestInit,
        ),
      ),
    );

    const payloads = await Promise.all(
      responses.map(async (res) => (res.ok ? ((await res.json()) as { results?: TmdbDiscoverItem[] }) : { results: [] })),
    );

    const deduped = new Map<number, RankedRecommendationItem>();
    for (const payload of payloads) {
      for (const rawItem of payload.results ?? []) {
        const itemGenres = rawItem.genre_ids ?? [];
        // Strict mood matching: comedy stays comedy, romance stays romance, etc.
        if (!itemGenres.some((g) => mood.strictGenres.includes(g))) continue;
        const normalized = normalizeItem(rawItem);
        if (!normalized) continue;
        if (!deduped.has(normalized.id)) {
          deduped.set(normalized.id, {
            ...normalized,
            reason: buildReason(normalized, mood),
            moodScore: calcMoodScore(itemGenres, mood),
          });
        }
      }
    }

    const ranked = [...deduped.values()].sort((a, b) => {
      if (b.moodScore !== a.moodScore) return b.moodScore - a.moodScore;
      return b.confidence - a.confidence;
    });
    const fullLimit = 20;
    const limited = ranked.slice(0, fullLimit);

    return NextResponse.json({
      mood: mood.key,
      label: mood.label,
      weekSeed: weeklySeed,
      locked: false,
      isVip,
      total: ranked.length,
      items: limited,
      upgradeMessage: null,
    });
  } catch {
    return NextResponse.json(
      {
        mood: mood.key,
        label: mood.label,
        locked: false,
        isVip,
        items: [],
      },
      { status: 200 },
    );
  }
}
