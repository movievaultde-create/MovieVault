import { NextRequest, NextResponse } from "next/server";

const TMDB_KEY = process.env.TMDB_API_KEY ?? "";
const BASE = "https://api.themoviedb.org/3";

const POPULAR_COLLECTIONS = [
  86311, 529892, 131295, 573436, // Avengers, Avengers (full), Spider-Man MCU, Spider-Verse
  10, 1241, 119, 121938,         // Star Wars, Harry Potter, LOTR, Hunger Games
  9485, 87359, 84930, 295,       // Fast & Furious, Mission Impossible, John Wick, Pirates
  328, 263, 748, 2344,           // Jurassic Park, Dark Knight, X-Men, Matrix
  528, 8091, 2150, 404609,       // Terminator, Alien, Shrek, Deadpool
  264, 1570, 131635, 422837,     // Back to Future, Die Hard, Conjuring, Transformers
  33514, 735, 230, 1733,         // Rocky, Batman, Godfather, Mummy
  556, 645, 1582, 448150,        // Spider-Man Webb, James Bond, Despicable Me, Sonic
  726871, 173710, 386382, 537982, // Dune, Planet of Apes, Toy Story, Frozen
  91361, 304, 151, 2980,         // Venom, Ocean's, Cars, Kung Fu Panda
];

interface CollectionData {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  parts: { id: number }[];
}

export async function GET(req: NextRequest) {
  const langParam = req.nextUrl.searchParams.get("lang") ?? "en-US";

  if (!TMDB_KEY || TMDB_KEY === "YOUR_TMDB_API_KEY_HERE") {
    return NextResponse.json({ results: [] });
  }

  try {
    const fetches = POPULAR_COLLECTIONS.map((id) =>
      fetch(`${BASE}/collection/${id}?api_key=${TMDB_KEY}&language=${langParam}`, {
        next: { revalidate: 86400 },
      } as RequestInit)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    );

    const allData = await Promise.all(fetches);

    const results = (allData.filter(Boolean) as CollectionData[]).map((c) => ({
      id: c.id,
      name: c.name,
      poster: c.poster_path ? `https://image.tmdb.org/t/p/w500${c.poster_path}` : null,
      backdrop: c.backdrop_path ? `https://image.tmdb.org/t/p/w1280${c.backdrop_path}` : null,
      parts: c.parts?.length ?? 0,
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
