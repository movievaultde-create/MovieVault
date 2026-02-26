import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type FollowType = "movie" | "tv";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getTableName(type: FollowType): "app_notify_movie_alerts" | "app_notify_series_follows" {
  return type === "movie" ? "app_notify_movie_alerts" : "app_notify_series_follows";
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  const type = req.nextUrl.searchParams.get("type");
  const id = Number(req.nextUrl.searchParams.get("id") ?? 0);
  if (!email || (type !== "movie" && type !== "tv") || !id) {
    return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
  }

  const table = getTableName(type);
  const idColumn = type === "movie" ? "movie_id" : "tv_id";
  const { data, error } = await supabase
    .from(table)
    .select("id")
    .eq("user_email", email)
    .eq(idColumn, id)
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  return NextResponse.json({ ok: true, following: Boolean(data) });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      type?: FollowType;
      id?: number;
      title?: string;
    };
    const email = normalizeEmail(body.email ?? "");
    const type = body.type;
    const id = Number(body.id ?? 0);
    const title = (body.title ?? "").trim();

    if (!email || (type !== "movie" && type !== "tv") || !id || !title) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    const table = getTableName(type);
    const payload =
      type === "movie"
        ? { user_email: email, movie_id: id, title }
        : { user_email: email, tv_id: id, title };

    const { error } = await supabase.from(table).upsert(payload, {
      onConflict: type === "movie" ? "user_email,movie_id" : "user_email,tv_id",
    });
    if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; type?: FollowType; id?: number };
    const email = normalizeEmail(body.email ?? "");
    const type = body.type;
    const id = Number(body.id ?? 0);
    if (!email || (type !== "movie" && type !== "tv") || !id) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    const table = getTableName(type);
    const idColumn = type === "movie" ? "movie_id" : "tv_id";
    const { error } = await supabase.from(table).delete().eq("user_email", email).eq(idColumn, id);
    if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
