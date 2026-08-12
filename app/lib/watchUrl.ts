import { stripSubtitleLabel } from "./mediaTitle";

/** SEO-friendly watch paths: /watch/predator-مترجم-106 */

export const MUTARJAM_SLUG = "مترجم";

function normalizeSegment(value: string): string {
  try {
    return decodeURIComponent(value).normalize("NFC").trim();
  } catch {
    return value.normalize("NFC").trim();
  }
}

export function slugifyTitle(title: string): string {
  const base = stripSubtitleLabel(title)
    .normalize("NFC")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .normalize("NFC");
  return base || "watch";
}

export function watchPath(
  type: "movie" | "tv",
  id: number | string,
  title?: string | null
): string {
  const numericId = String(id).match(/(\d+)/)?.[1] ?? String(id);
  const slug = title?.trim() ? slugifyTitle(title) : "";
  const mutarjam = MUTARJAM_SLUG.normalize("NFC");
  const segment = slug ? `${slug}-${mutarjam}-${numericId}` : numericId;
  return type === "tv" ? `/watch/tv/${segment}` : `/watch/${segment}`;
}

/**
 * Extract TMDB id from:
 * - predator-مترجم-106
 * - predator-106-مترجم
 * - predator-106
 * - 106
 */
export function parseWatchParam(param: string): string {
  const decoded = normalizeSegment(param);
  if (/^\d+$/.test(decoded)) return decoded;

  const trailing = decoded.match(/(?:^|-)(\d+)$/);
  if (trailing) return trailing[1];

  const beforeMutarjam = decoded.match(/(?:^|-)(\d+)-مترجم$/u);
  if (beforeMutarjam) return beforeMutarjam[1];

  const numbers = [...decoded.matchAll(/(\d{2,})/g)];
  if (numbers.length > 0) return numbers[numbers.length - 1][1];

  return decoded;
}

export function isCanonicalWatchParam(
  param: string,
  type: "movie" | "tv",
  id: number | string,
  title?: string | null
): boolean {
  const expected = watchPath(type, id, title);
  const prefix = type === "tv" ? "/watch/tv/" : "/watch/";
  const actual = `${prefix}${normalizeSegment(param)}`;
  return normalizeSegment(actual) === normalizeSegment(expected);
}
