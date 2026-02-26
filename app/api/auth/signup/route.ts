import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { hashPassword } from "../../../lib/password";
import { ensureReferralCode, registerReferralSignup } from "../../../lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json();
    const safeName = typeof name === "string" ? name.trim() : "";
    const safeEmail = typeof email === "string" ? normalizeEmail(email) : "";
    const safePassword = typeof password === "string" ? password.trim() : "";

    if (!safeName) return NextResponse.json({ ok: false, error: "name_required" }, { status: 400 });
    if (!safeEmail || !safeEmail.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    if (safePassword.length < 6) {
      return NextResponse.json({ ok: false, error: "password_short" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }
    const { data: existing, error: findError } = await supabase
      .from("app_users")
      .select("id")
      .eq("email", safeEmail)
      .maybeSingle();

    if (findError) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (existing) {
      return NextResponse.json({ ok: false, error: "email_exists" }, { status: 409 });
    }

    const passwordHash = await hashPassword(safePassword);
    const createdAt = new Date().toISOString();
    const { data, error: insertError } = await supabase
      .from("app_users")
      .insert({
        name: safeName,
        email: safeEmail,
        password_hash: passwordHash,
        created_at: createdAt,
      })
      .select("name,email,created_at")
      .single();

    if (insertError || !data) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    try {
      await ensureReferralCode(supabase, safeEmail);
      if (typeof referralCode === "string" && referralCode.trim()) {
        await registerReferralSignup(supabase, safeEmail, referralCode);
      }
    } catch {
      // Keep signup successful even if referral bookkeeping fails.
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
