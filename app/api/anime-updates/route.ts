import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ANILIST = "https://graphql.anilist.co";
const WCA = "https://watchclashanime.com";

/**
 * Same pin order as watchclashanime `TRENDING_NOW_PINNED_IDS`.
 * Requested titles stay first in homepage «الرائج الأنمي 🔥».
 */
const TRENDING_NOW_PINNED_IDS = [
  101310, // Boarding School Juliet
  20613, // Akame ga Kill!
  156111, // The Girl Downstairs
  143200, // Summer Pockets
  201514, // Rich Girl Caretaker
  133965, // Komi Can't Communicate
  142984, // Komi Can't Communicate Part 2
  146625, // Engage Kiss
  190704, // Mistress Kanan is Devilishly Easy
  20997, // Charlotte
  187940, // Inexpressive Kashiwada and Expressive Oota
  21290, // And you thought there is never a girl online?
  8074, // High School of the Dead
  199418, // Above Myriads
  185874, 190569, 135865, 189046, 21355, 178789, 108465, 177699, 184951, 210031,
  204466, 21, 196187, 187538, 178869, 198946, 188525, 206521, 177637, 207674,
  182205, 101280, 103139, 143338, 132052, 167144, 98596, 136934, 152681, 7593,
  5042, 5958, 141949, 21243, 20755, 133412, 175872, 11499, 135806, 128712, 20984,
  127911,
] as const;

const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native }
  coverImage { large medium }
  averageScore
  seasonYear
  genres
  isAdult
`;

type Media = {
  id: number;
  idMal: number | null;
  title: { romaji: string | null; english: string | null; native: string | null };
  coverImage: { large: string | null; medium: string | null } | null;
  averageScore: number | null;
  seasonYear: number | null;
  genres: string[] | null;
  isAdult: boolean | null;
};

function mapMedia(mediaList: Media[]) {
  return mediaList.map((m) => {
    const title = m.title?.english || m.title?.romaji || m.title?.native || "Unknown";
    return {
      id: m.id,
      anilistId: m.id,
      malId: m.idMal ?? null,
      title,
      poster: m.coverImage?.large || m.coverImage?.medium || null,
      rating: m.averageScore != null ? (m.averageScore / 10).toFixed(1) : "0",
      year: m.seasonYear != null ? String(m.seasonYear) : "",
      episodeHint: null as string | null,
      href: `${WCA}/anime/${m.id}`,
      genres: m.genres ?? [],
      isAdult: Boolean(m.isAdult),
    };
  });
}

async function anilistQuery(query: string, variables: Record<string, unknown>): Promise<Media[]> {
  const res = await fetch(ANILIST, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "MovieVault/1.0",
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600, tags: ["catalog", "wca-most-watched"] },
  } as RequestInit);
  if (!res.ok) return [];
  const json = (await res.json()) as { data?: { Page?: { media?: Media[] } } };
  return json?.data?.Page?.media ?? [];
}

async function fetchTrending(perPage = 24): Promise<Media[]> {
  return anilistQuery(
    `query($perPage:Int){Page(page:1,perPage:$perPage){media(sort:TRENDING_DESC,type:ANIME,isAdult:false){${MEDIA_FIELDS}}}}`,
    { perPage },
  );
}

async function fetchByIds(ids: readonly number[]): Promise<Media[]> {
  const unique = [...new Set(ids.filter((id) => id > 0))];
  if (!unique.length) return [];

  const chunks: number[][] = [];
  for (let i = 0; i < unique.length; i += 50) {
    chunks.push(unique.slice(i, i + 50));
  }

  const pages = await Promise.all(
    chunks.map((chunk) =>
      anilistQuery(
        `query($ids:[Int],$perPage:Int){Page(page:1,perPage:$perPage){media(id_in:$ids,type:ANIME,isAdult:false){${MEDIA_FIELDS}}}}`,
        { ids: chunk, perPage: chunk.length },
      ),
    ),
  );

  const byId = new Map(pages.flat().map((row) => [row.id, row]));
  return unique.map((id) => byId.get(id)).filter((row): row is Media => Boolean(row));
}

/** Same pin-first order as watchclashanime.com «الرائج الأنمي 🔥». */
export async function GET() {
  try {
    const [pinned, live] = await Promise.all([
      fetchByIds(TRENDING_NOW_PINNED_IDS),
      fetchTrending(24),
    ]);

    const seen = new Set<number>();
    const pool: Media[] = [];
    for (const anime of [...pinned, ...live]) {
      if (seen.has(anime.id)) continue;
      seen.add(anime.id);
      pool.push(anime);
    }

    const results = mapMedia(pool.slice(0, 36));

    return NextResponse.json(
      {
        results,
        count: results.length,
        source: `${WCA}/`,
        section: "الرائج الأنمي",
        date: new Date().toISOString().slice(0, 10),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        results: [],
        count: 0,
        error: "fetch_failed",
        message: e instanceof Error ? e.message : "unknown",
      },
      { status: 500 },
    );
  }
}
