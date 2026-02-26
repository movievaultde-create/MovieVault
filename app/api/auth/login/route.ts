import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { verifyPassword } from "../../../lib/password";
import { sendEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;
  return "Unknown";
}

function getDeviceInfo(req: NextRequest): string {
  const userAgent = req.headers.get("user-agent")?.trim() || "Unknown device";
  const platform = req.headers.get("sec-ch-ua-platform")?.replace(/"/g, "").trim();
  return platform ? `${userAgent} | Platform: ${platform}` : userAgent;
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
      const timestamp = new Date().toUTCString();
      const clientIp = getClientIp(req);
      const country = req.headers.get("cf-ipcountry")?.trim();
      const locationText = country ? `${country} / ${clientIp}` : clientIp;
      const deviceInfo = getDeviceInfo(req);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://movie-vault.dev";
      const resetPasswordUrl =
        process.env.NEXT_PUBLIC_RESET_PASSWORD_URL?.trim() || `${siteUrl}/login`;

      await sendEmail({
        to: safeEmail,
        subject: "New login detected for your MovieVault account",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Hi ${data.name || "User"},</h2>
            <p>You have successfully logged into your account. We're glad to have you back!</p>
            <p>This is a quick notification to let you know that your MovieVault account was just accessed from a new device or browser.</p>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Device/Browser:</strong> ${deviceInfo}</p>
            <p><strong>Location/IP Address:</strong> ${locationText}</p>
            <p>If this was you, you can safely ignore this email.</p>
            <p><strong>Wasn't you?</strong><br/>
            Please secure your account immediately by changing your password:
            <a href="${resetPasswordUrl}" target="_blank" rel="noopener">${resetPasswordUrl}</a></p>
            <p>Happy watching,<br/>Best regards,<br/>The MovieVault Team</p>
          </div>
        `,
        text: `Hi ${data.name || "User"},
You have successfully logged into your account. We're glad to have you back!

This is a quick notification to let you know that your MovieVault account was just accessed from a new device or browser.

Time: ${timestamp}
Device/Browser: ${deviceInfo}
Location/IP Address: ${locationText}

If this was you, you can safely ignore this email.

Wasn't you?
Please secure your account immediately by changing your password: ${resetPasswordUrl}

Happy watching,
Best regards,
The MovieVault Team`,
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
