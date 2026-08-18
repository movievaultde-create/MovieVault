/**
 * AniList API v2 (GraphQL) - https://docs.anilist.co
 * Used to fetch anime list; when TMDB id is present in external links we use existing watch/servers.
 */

const ANILIST_GRAPHQL = "https://graphql.anilist.co";

export type AniListMediaFormat = "TV" | "TV_SHORT" | "MOVIE" | "SPECIAL" | "OVA" | "ONA" | "MUSIC";

export interface AniListMedia {
  id: number;
  idMal: number | null;
  title: { romaji: string | null; english: string | null; native: string | null };
  format: AniListMediaFormat | null;
  coverImage: { large: string | null; medium: string | null } | null;
  averageScore: number | null;
  seasonYear: number | null;
  episodes: number | null;
  genres?: string[] | null;
  isAdult?: boolean | null;
  externalLinks: Array<{ url: string | null; site: string | null }> | null;
  studios?: { nodes: Array<{ name: string }> } | null;
}

export type AniListDemographic = "Shounen" | "Seinen" | null;

function parseTmdbIdFromUrl(url: string | null): number | null {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/themoviedb\.org\/(?:movie|tv)\/(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

export function extractTmdbId(media: AniListMedia): number | null {
  const links = media.externalLinks ?? [];
  for (const { url } of links) {
    const id = parseTmdbIdFromUrl(url ?? null);
    if (id != null) return id;
  }
  return null;
}

const MEDIA_LIST_QUERY = `
query AniListDiscover($page: Int, $perPage: Int, $format: MediaFormat, $sort: [MediaSort], $genre: String) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { hasNextPage currentPage lastPage }
    media(
      type: ANIME
      format: $format
      sort: $sort
      genre: $genre
    ) {
      id
      idMal
      title { romaji english native }
      format
      coverImage { large medium }
      averageScore
      seasonYear
      episodes
      genres
      isAdult
      externalLinks { url site }
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

export interface AniListDiscoverVariables {
  page?: number;
  perPage?: number;
  format?: AniListMediaFormat | null;
  sort?: string[];
  /** Demographic filter: Shounen, Seinen, etc. */
  genre?: AniListDemographic;
}

export interface AniListDiscoverResult {
  results: Array<{
    id: number;
    title: string;
    poster: string | null;
    rating: string;
    year: string;
    type: "movie" | "tv";
    tmdbId: number | null;
    anilistId: number;
    malId?: number | null;
    genres?: string[];
    isAdult?: boolean;
    studio?: string | null;
  }>;
  page: number;
  hasNextPage: boolean;
  total_pages: number;
}

export async function fetchAniListDiscover(
  variables: AniListDiscoverVariables = {}
): Promise<AniListDiscoverResult> {
  const { page = 1, perPage = 20, format = null, sort = ["POPULARITY_DESC"], genre = null } = variables;
  const res = await fetch(ANILIST_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: MEDIA_LIST_QUERY,
      variables: { page, perPage, format, sort, genre },
    }),
    next: { revalidate: 86400 },
  } as RequestInit);

  if (!res.ok) {
    return { results: [], page: 1, hasNextPage: false, total_pages: 1 };
  }

  const json = await res.json();
  const pageData = json?.data?.Page;
  if (!pageData?.media) {
    return { results: [], page: 1, hasNextPage: false, total_pages: 1 };
  }

  const mediaList = pageData.media as AniListMedia[];
  const results = mediaList.map((m) => {
    const tmdbId = extractTmdbId(m);
    const title =
      m.title?.english || m.title?.romaji || m.title?.native || "Unknown";
    const poster = m.coverImage?.large || m.coverImage?.medium || null;
    const rating = m.averageScore != null ? (m.averageScore / 10).toFixed(1) : "0";
    const year = m.seasonYear != null ? String(m.seasonYear) : "";
    const type: "movie" | "tv" =
      m.format === "MOVIE" || m.format === "SPECIAL" ? "movie" : "tv";
    const studio = m.studios?.nodes?.[0]?.name ?? null;
    return {
      id: tmdbId ?? m.id,
      title,
      poster,
      rating,
      year,
      type,
      tmdbId,
      anilistId: m.id,
      malId: m.idMal ?? null,
      genres: m.genres ?? [],
      isAdult: Boolean(m.isAdult),
      studio: studio ?? undefined,
    };
  });

  const pageInfo = pageData.pageInfo ?? {};
  const currentPage = pageInfo.currentPage ?? page;
  const lastPage = Math.max(pageInfo.lastPage ?? 1, 1);
  const hasNextPage = !!pageInfo.hasNextPage;

  return {
    results,
    page: currentPage,
    hasNextPage,
    total_pages: lastPage,
  };
}
