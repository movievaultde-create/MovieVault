/** Prefer English/original title for Arabic UI + SEO slugs. */

export function preferEnglishTitle(options: {
  title?: string | null;
  name?: string | null;
  originalTitle?: string | null;
  originalName?: string | null;
  lang?: string | null;
}): string {
  const localized = (options.title ?? options.name ?? "").trim();
  const original = (options.originalTitle ?? options.originalName ?? "").trim();
  const lang = options.lang ?? "";

  if (lang.startsWith("ar")) {
    if (original && /[A-Za-z]/.test(original)) return original;
    if (localized && /[A-Za-z]/.test(localized)) return localized;
  }

  return localized || original;
}

/** Strip trailing "مترجم" / "Subbed" so we don't duplicate in URLs/labels. */
export function stripSubtitleLabel(title: string): string {
  return title
    .replace(
      /\s*(مترجم|مترجمة|مترجمه|subtitled|subbed|subtitles|subtitulado|subtitulada|legendado|legendada|vostfr|sous-titré|sous-titrée|untertitel|altyazılı|altyazili|subtitry)\s*$/i,
      "",
    )
    .trim();
}
