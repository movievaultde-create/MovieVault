import { NextRequest, NextResponse } from "next/server";
import { fetchAniListDiscover } from "../../../lib/anilist";

/**
 * AniList discover: returns anime (TV + movies) in same shape as TMDB discover.
 * Only includes items that have a TMDB id in AniList external links so watch page
 * can use existing servers and translations.
 */
export async function GET(req: NextRequest) {
  const page = Math.min(Math.max(Number(req.nextUrl.searchParams.get("page")) || 1, 1), 50);
  const format = req.nextUrl.searchParams.get("format") ?? ""; // TV, MOVIE, or empty = all
  const perPage = 25;

  try {
    const formatMap =
      format.toUpperCase() === "MOVIE"
        ? "MOVIE"
        : format.toUpperCase() === "TV"
          ? "TV"
          : null;
    const data = await fetchAniListDiscover({
      page,
      perPage,
      format: formatMap,
      sort: ["POPULARITY_DESC"],
    });

    // Only include items with TMDB id so /watch/tv/[id] and our servers/subs work
    const withTmdb = data.results.filter((r) => r.tmdbId != null);
    const results = withTmdb.map(({ tmdbId, title, poster, rating, year, type }) => ({
      id: tmdbId,
      title,
      poster,
      rating,
      year,
      type,
    }));

    return NextResponse.json({
      results,
      page: data.page,
      total_pages: data.total_pages,
    });
  } catch {
    return NextResponse.json({ results: [], page: 1, total_pages: 1 });
  }
}
