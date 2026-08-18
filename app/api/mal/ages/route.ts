import { NextResponse } from "next/server";
import { peekMalAgeRating } from "../../../lib/mal/ageRating";
import type { AgeCode } from "../../../lib/mal/ageRatingMap";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const ANILIST = "https://graphql.anilist.co";

function parseIds(raw: string | null, limit: number) {
  return (raw ?? "")
    .split(",")
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id) && id > 0)
    .slice(0, limit);
}

async function anilistMalIds(anilistIds: number[]): Promise<Map<number, number>> {
  const unique = [...new Set(anilistIds)];
  if (!unique.length) return new Map();
  const response = await fetch(ANILIST, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query: `query($ids:[Int],$perPage:Int){Page(page:1,perPage:$perPage){media(id_in:$ids,type:ANIME){id idMal}}}`,
      variables: { ids: unique, perPage: unique.length },
    }),
    signal: AbortSignal.timeout(6_000),
  }).catch(() => null);
  if (!response?.ok) return new Map();
  const json = (await response.json()) as {
    data?: { Page?: { media?: Array<{ id: number; idMal: number | null }> } };
  };
  const map = new Map<number, number>();
  for (const item of json.data?.Page?.media ?? []) {
    if (item.idMal && item.idMal > 0) map.set(item.id, item.idMal);
  }
  return map;
}

async function mapPool<T, R>(items: T[], concurrency: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out = new Array<R>(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      out[index] = await fn(items[index]!);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => worker()));
  return out;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const malIds = parseIds(url.searchParams.get("ids"), 64);
  const anilistIds = parseIds(url.searchParams.get("anilistIds"), 64);
  const anilistToMal = await anilistMalIds(anilistIds);
  const ids = [...new Set([...malIds, ...anilistToMal.values()])].slice(0, 64);

  const ages: Record<string, AgeCode> = {};
  const live = await Promise.race([
    mapPool(ids, 4, (id) => peekMalAgeRating(id).catch(() => null)),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
  ]);
  if (live) {
    live.forEach((rating, index) => {
      const id = ids[index];
      if (id && rating?.code) ages[String(id)] = rating.code;
    });
  }

  const anilist: Record<string, AgeCode> = {};
  for (const [anilistId, malId] of anilistToMal) {
    const code = ages[String(malId)];
    if (code) anilist[String(anilistId)] = code;
  }

  return NextResponse.json({ ages, anilist });
}
