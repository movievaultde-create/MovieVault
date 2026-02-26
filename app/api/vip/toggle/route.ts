import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEmailPreferences, sendVipStatusEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json()) as {
      email?: string;
      active?: boolean;
      days?: number;
    };
    const email = normalizeEmail(body.email ?? "");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (typeof body.active !== "boolean") {
      return NextResponse.json({ ok: false, error: "active_required" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    let expiresAt: string | undefined;

    if (body.active) {
      const days = Math.max(1, Math.min(365, Number(body.days ?? 30)));
      const now = new Date();
      const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      expiresAt = expires.toISOString();

      const { error } = await supabase.from("app_vip_grants").insert({
        user_email: email,
        source: "manual_toggle",
        starts_at: now.toISOString(),
        expires_at: expiresAt,
      });
      if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    } else {
      const { error } = await supabase
        .from("app_vip_grants")
        .update({ expires_at: new Date(Date.now() - 1000).toISOString() })
        .eq("user_email", email)
        .gt("expires_at", new Date().toISOString());
      if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const prefs = await getEmailPreferences(supabase, email);
    if (prefs.isActive && prefs.wantsVipUpdates) {
      await sendVipStatusEmail({ email, active: body.active, expiresAt });
    }

    return NextResponse.json({ ok: true, email, active: body.active, expiresAt: expiresAt ?? null });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
