import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

interface TmdbPart {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
  release_date?: string;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";

  if (!TMDB_KEY) {
    return NextResponse.json({ name: "", overview: "", parts: [] });
  }

  try {
    const res = await fetch(
      `${BASE}/collection/${id}?api_key=${TMDB_KEY}&language=${langParam}`,
      { next: { revalidate: 3600 } } as RequestInit
    );

    if (!res.ok) {
      return NextResponse.json({ name: "", overview: "", parts: [] });
    }

    const data = await res.json();

    const parts = (data.parts ?? [])
      .sort((a: TmdbPart, b: TmdbPart) => {
        const da = a.release_date ?? "9999";
        const db = b.release_date ?? "9999";
        return da.localeCompare(db);
      })
      .map((p: TmdbPart) => ({
        id: p.id,
        title: p.title,
        poster: p.poster_path ? `https://image.tmdb.org/t/p/w500${p.poster_path}` : null,
        rating: p.vote_average?.toFixed(1) ?? "0",
        year: (p.release_date ?? "").slice(0, 4),
        type: "movie" as const,
      }));

    return NextResponse.json({
      name: data.name ?? "",
      overview: data.overview ?? "",
      backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      parts,
    });
  } catch {
    return NextResponse.json({ name: "", overview: "", parts: [] });
  }
}
