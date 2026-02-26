import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MediaType = "movie" | "tv";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isMediaType(value: unknown): value is MediaType {
  return value === "movie" || value === "tv";
}

function getConfiguredSupabase() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  const supabase = getConfiguredSupabase();
  if (!supabase) {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("app_watchlist")
    .select("media_id,media_type,title,poster,rating,year,added_at")
    .eq("user_email", email)
    .order("added_at", { ascending: false });

  if (error) {
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    items: (data ?? []).map((item) => ({
      id: Number(item.media_id),
      type: item.media_type as MediaType,
      title: item.title ?? "",
      poster: item.poster ?? null,
      rating: item.rating ?? "0.0",
      year: item.year ?? "",
      addedAt: item.added_at ?? new Date().toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      item?: {
        id?: number;
        type?: MediaType;
        title?: string;
        poster?: string | null;
        rating?: string;
        year?: string;
      };
    };

    const email = normalizeEmail(body.email ?? "");
    const item = body.item;
    if (!email) {
      return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    }
    if (!item || typeof item.id !== "number" || !isMediaType(item.type) || !item.title) {
      return NextResponse.json({ ok: false, error: "invalid_item" }, { status: 400 });
    }

    const supabase = getConfiguredSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    const { error } = await supabase.from("app_watchlist").upsert(
      {
        user_email: email,
        media_id: item.id,
        media_type: item.type,
        title: item.title,
        poster: item.poster ?? null,
        rating: item.rating ?? "0.0",
        year: item.year ?? "",
        added_at: new Date().toISOString(),
      },
      {
        onConflict: "user_email,media_id,media_type",
      }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      id?: number;
      type?: MediaType;
    };
    const email = normalizeEmail(body.email ?? "");
    if (!email) {
      return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    }

    const supabase = getConfiguredSupabase();
    if (!supabase) {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    let query = supabase.from("app_watchlist").delete().eq("user_email", email);
    if (typeof body.id === "number" && isMediaType(body.type)) {
      query = query.eq("media_id", body.id).eq("media_type", body.type);
    }

    const { error } = await query;
    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
