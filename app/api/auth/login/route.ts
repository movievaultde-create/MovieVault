import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { verifyPassword } from "../../../lib/password";
import { sendEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const safeEmail = typeof email === "string" ? normalizeEmail(email) : "";
    const safePassword = typeof password === "string" ? password.trim() : "";

    if (!safeEmail || !safePassword) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }
    const { data, error } = await supabase
      .from("app_users")
      .select("name,email,created_at,password_hash")
      .eq("email", safeEmail)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ ok: false, error: "user_not_found" }, { status: 404 });
    }

    const valid = await verifyPassword(safePassword, data.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: "invalid_credentials" }, { status: 401 });
    }

    try {
      await sendEmail({
        to: safeEmail,
        subject: "Login successful - MovieVault",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Login successful</h2>
            <p>Hi ${data.name || "there"}, your MovieVault account was logged in successfully.</p>
            <p>Time: ${new Date().toUTCString()}</p>
            <p>If this wasn't you, change your password immediately.</p>
          </div>
        `,
        text: `Login successful for your MovieVault account at ${new Date().toUTCString()}. If this wasn't you, change your password immediately.`,
      });
    } catch {
      // Keep login successful even if email delivery fails.
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
