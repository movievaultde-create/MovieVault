import { unstable_cache } from "next/cache";
import { mapMalRatingToAge, type AgeRating } from "./ageRatingMap";

function malClientId() {
  return process.env.MAL_CLIENT_ID?.trim() || process.env.MYANIMELIST_CLIENT_ID?.trim() || "";
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<unknown | null> {
  const response = await fetch(url, {
    headers: { Accept: "application/json", ...headers },
    signal: AbortSignal.timeout(4_000),
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) return null;
  return response.json().catch(() => null);
}

async function fetchOfficialMalRating(malId: number): Promise<string | null> {
  const clientId = malClientId();
  if (!clientId) return null;
  const payload = (await fetchJson(
    `https://api.myanimelist.net/v2/anime/${malId}?fields=rating`,
    { "X-MAL-CLIENT-ID": clientId },
  )) as { rating?: string | null } | null;
  return payload?.rating?.trim() || null;
}

async function fetchJikanRating(malId: number): Promise<string | null> {
  const payload = (await fetchJson(`https://api.jikan.moe/v4/anime/${malId}`, {
    "User-Agent": "movie-vault.dev/age-rating",
  })) as { data?: { rating?: string | null } } | null;
  return payload?.data?.rating?.trim() || null;
}

export async function fetchMalRatingUncached(malId: number): Promise<AgeRating | null> {
  const id = Math.floor(malId);
  if (!Number.isFinite(id) || id <= 0) return null;

  const official = await fetchOfficialMalRating(id);
  const mappedOfficial = mapMalRatingToAge(official);
  if (mappedOfficial) return mappedOfficial;

  return mapMalRatingToAge(await fetchJikanRating(id));
}

export async function peekMalAgeRating(malId: number | null | undefined): Promise<AgeRating | null> {
  const id = Math.floor(Number(malId));
  if (!Number.isFinite(id) || id <= 0) return null;

  return unstable_cache(
    () => fetchMalRatingUncached(id),
    [`mv-mal-age-rating-v1-${id}`],
    { revalidate: 60 * 60 * 6 },
  )();
}
