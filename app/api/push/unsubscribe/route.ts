import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; endpoint?: string };
    const email = normalizeEmail(body.email ?? "");
    const endpoint = body.endpoint?.trim() ?? "";
    if (!email || !endpoint) {
      return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    const { error } = await supabase
      .from("app_push_subscriptions")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("user_email", email)
      .eq("endpoint", endpoint);

    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
