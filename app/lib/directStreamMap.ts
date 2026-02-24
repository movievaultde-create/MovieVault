export type WatchServer = {
  name: string;
  label: string;
  premium: boolean;
  url: string;
  playerType: "iframe" | "direct";
  directUrl?: string;
};

// Per-movie direct sources (TMDB movie id -> direct HLS/MP4 URL).
const DIRECT_MOVIE_MAP: Record<string, string> = {
  // Test streams currently used to validate VAST in-player ads.
  "12428862": "https://vz-4cf47e6c-8db.b-cdn.net/525fd39d-e53c-481f-a2cc-d5268ea545d8/playlist.m3u8",
  "1428862": "https://vz-4cf47e6c-8db.b-cdn.net/525fd39d-e53c-481f-a2cc-d5268ea545d8/playlist.m3u8",
  "1268609": "https://vz-4cf47e6c-8db.b-cdn.net/525fd39d-e53c-481f-a2cc-d5268ea545d8/playlist.m3u8",
};

// Per-episode direct sources (tmdbId:season:episode -> direct HLS/MP4 URL).
const DIRECT_TV_MAP: Record<string, string> = {
  // Example:
  // "1396:1:1": "https://your-cdn/tv/1396/1/1/master.m3u8",
};

function movieTemplateUrl(id: string): string | undefined {
  const template = process.env.NEXT_PUBLIC_DIRECT_MOVIE_URL_TEMPLATE?.trim();
  if (!template) return undefined;
  return template.replaceAll("{id}", id);
}

function tvTemplateUrl(id: string, season: number, episode: number): string | undefined {
  const template = process.env.NEXT_PUBLIC_DIRECT_TV_URL_TEMPLATE?.trim();
  if (!template) return undefined;
  return template
    .replaceAll("{id}", id)
    .replaceAll("{season}", String(season))
    .replaceAll("{episode}", String(episode));
}

export function resolveDirectMovieUrl(id: string): string | undefined {
  return DIRECT_MOVIE_MAP[id] || movieTemplateUrl(id);
}

export function resolveDirectTvUrl(
  id: string,
  season: number,
  episode: number
): string | undefined {
  const key = `${id}:${season}:${episode}`;
  return DIRECT_TV_MAP[key] || tvTemplateUrl(id, season, episode);
}

