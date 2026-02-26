import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email";

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
    const body = (await req.json()) as { email?: string; name?: string };
    const email = normalizeEmail(body.email ?? "");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    const name = (body.name ?? "").trim() || "there";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://movie-vault.dev";
    const heroImageUrl = `${siteUrl.replace(/\/+$/, "")}/og-image.jpg`;

    const ok = await sendEmail({
      to: email,
      subject: "🍿 Your movie night is ready! Discover the latest additions to MovieVault",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <p>
            <img src="${heroImageUrl}" alt="MovieVault" width="600" style="max-width:100%;border-radius:12px;display:block" />
          </p>
          <p>Hi ${name},</p>
          <p>No need to search endlessly for "What should I watch tonight?"... We've updated the library just for you! 🎬</p>
          <p>We've just added a carefully curated selection of shows that we're sure you'll love:</p>
          <p>
            Dune: Part Two – [Movie] 🌟<br/>
            The Gentlemen – [Series] 🔥<br/>
            Oppenheimer – [Movie] ✨
          </p>
          <p><strong>Ready to watch?</strong></p>
          <p>With one click, jump straight into your favorite world:</p>
          <p><a href="${siteUrl}" target="_blank" rel="noopener">Click here to watch now</a></p>
          <p>Have a great night,<br/>The MovieVault Team</p>
        </div>
      `,
      text: `Hi ${name},

No need to search endlessly for "What should I watch tonight?"... We've updated the library just for you!

We've just added a carefully curated selection of shows that we're sure you'll love:
- Dune: Part Two - [Movie] 🌟
- The Gentlemen - [Series] 🔥
- Oppenheimer - [Movie] ✨

Ready to watch?
Click here to watch now: ${siteUrl}

Direct image URL: ${heroImageUrl}

Have a great night,
The MovieVault Team`,
    });

    if (!ok) {
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sent: 1 });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
