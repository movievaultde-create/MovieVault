export type AgeCode = "all" | "7" | "13" | "17" | "18";

export type AgeRating = {
  code: AgeCode;
  malRating: string;
};

const AGE_CODES = new Set<AgeCode>(["all", "7", "13", "17", "18"]);

export function isAgeCode(value: string | null | undefined): value is AgeCode {
  return Boolean(value && AGE_CODES.has(value as AgeCode));
}

export function mapMalRatingToAge(rating: string | null | undefined): AgeRating | null {
  if (!rating?.trim()) return null;
  const raw = rating.trim();
  const value = raw.toLowerCase().replace(/_/g, "-").replace(/\s+/g, " ");

  if (/\brx\b/.test(value) || value.includes("hentai")) {
    return { code: "18", malRating: raw };
  }
  if (value.includes("r+") || value.includes("mild nudity")) {
    return { code: "18", malRating: raw };
  }
  if (/\b17\+/.test(value) || /(^|[\s(])r(?:\s|-|$)(?!\+)/.test(value) || value === "r") {
    return { code: "17", malRating: raw };
  }
  if (value.includes("pg-13") || value.includes("pg13") || value.includes("13 or older")) {
    return { code: "13", malRating: raw };
  }
  if (/(^|[\s(])pg(\s|-|$)/.test(value) || value === "pg") {
    return { code: "7", malRating: raw };
  }
  if (value === "g" || value.startsWith("g -") || value.includes("all ages")) {
    return { code: "all", malRating: raw };
  }
  return null;
}

/** Immediate cover age when MAL has not answered yet. */
export function fallbackAgeFromMedia(media: {
  isAdult?: boolean | null;
  genres?: string[] | null;
}): AgeCode {
  if (media.isAdult) return "18";
  const genres = (media.genres ?? []).map((genre) => genre.toLowerCase());
  if (genres.includes("hentai")) return "18";
  if (genres.includes("ecchi")) return "18";
  if (genres.includes("kids") || genres.includes("childcare")) return "7";
  return "13";
}

export function formatAgeBadge(code: AgeCode, locale: string): string {
  const lang = locale.toLowerCase();
  if (code === "all") {
    if (lang === "ja") return "全年齢";
    if (lang === "ar") return "للكل";
    return "All";
  }
  return `+${code}`;
}

export function ageBadgeClass(code: AgeCode): string {
  if (code === "18") return "bg-red-600 text-white";
  if (code === "17") return "bg-orange-600 text-white";
  if (code === "13") return "bg-amber-500 text-white";
  if (code === "7") return "bg-sky-600 text-white";
  return "bg-emerald-600 text-white";
}
