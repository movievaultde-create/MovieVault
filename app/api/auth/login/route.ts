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
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://movie-vault.dev";
      const logoUrl = `${siteUrl.replace(/\/+$/, "")}/og-image.jpg`;
      const safeName = data.name || "there";

      await sendEmail({
        to: safeEmail,
        subject: "You're back! 🍿 Your night starts now on MovieVault",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.7;color:#101418">
            <p style="margin:0 0 14px">
              <img src="${logoUrl}" alt="MovieVault" width="600" style="max-width:100%;border-radius:12px;display:block" />
            </p>
            <h2 style="margin:0 0 8px">Welcome back, ${safeName},</h2>
            <p style="margin:0 0 8px">You have successfully logged into your account. We're glad to have you back!</p>
            <p style="margin:0 0 8px">We missed you!</p>
            <p style="margin:0 0 16px">Get your favorite snack ready, lots of fun awaits you inside the app.</p>
            <p style="margin:0 0 16px">
              <a href="${siteUrl}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#111827;color:#ffffff;text-decoration:none;font-weight:600">Go to Library</a>
            </p>
            <p style="margin:0">Happy watching,<br/>Best regards,<br/>The MovieVault Team</p>
          </div>
        `,
        text: `Welcome back, ${safeName},
You have successfully logged into your account. We're glad to have you back!

We missed you!

Get your favorite snack ready, lots of fun awaits you inside the app.

Go to Library: ${siteUrl}

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
