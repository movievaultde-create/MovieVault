import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  try {
    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }
    const { data, error } = await supabase
      .from("app_users")
      .select("name,email,created_at")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      user: {
        name: data.name,
        email: data.email,
        createdAt: data.created_at,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
