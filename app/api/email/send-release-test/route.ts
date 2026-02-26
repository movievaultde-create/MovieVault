import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_KEY = process.env.TMDB_API_KEY?.trim() ?? "";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

async function fetchTmdb(path: string) {
  if (!TMDB_KEY) return null;
  const res = await fetch(`${TMDB_BASE}${path}${path.includes("?") ? "&" : "?"}api_key=${TMDB_KEY}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

async function getSampleItems() {
  const imageBase = "https://image.tmdb.org/t/p/w500";
  const seeds: Array<{ id: number; type: "movie" | "tv"; fallbackTitle: string }> = [
    { id: 693134, type: "movie", fallbackTitle: "Dune: Part Two" },
    { id: 236994, type: "tv", fallbackTitle: "The Gentlemen" },
    { id: 872585, type: "movie", fallbackTitle: "Oppenheimer" },
  ];

  const items = await Promise.all(
    seeds.map(async (seed) => {
      const details = await fetchTmdb(`/${seed.type}/${seed.id}?language=en-US`);
      const title =
        (seed.type === "movie" ? details?.title : details?.name)?.toString()?.trim() || seed.fallbackTitle;
      const genres = Array.isArray(details?.genres)
        ? details.genres
            .map((genre: { name?: string }) => genre?.name?.trim())
            .filter((genreName: string | undefined): genreName is string => Boolean(genreName))
        : [];
      const genresLabel = genres.length > 0 ? genres.slice(0, 2).join("/") : seed.type === "movie" ? "Movie" : "Series";
      const posterPath = typeof details?.poster_path === "string" ? details.poster_path : null;
      const posterUrl = posterPath ? `${imageBase}${posterPath}` : null;
      return { ...seed, title, genresLabel, posterUrl };
    })
  );

  return items;
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
    const baseUrl = siteUrl.replace(/\/+$/, "");
    const heroImageUrl = `${baseUrl}/og-image.jpg`;
    const footerImageUrl = `${baseUrl}/email-footer.png`;

    const items = await getSampleItems();
    const emojis = ["🌟", "🔥", "✨"];
    const pickLinesHtml = items
      .map((item, index) => {
        const posterHtml = item.posterUrl
          ? `<img src="${item.posterUrl}" alt="${item.title}" width="140" style="display:block;border-radius:10px;margin:8px 0;" />`
          : "";
        return `
          <div style="margin:0 0 16px">
            <div><strong>${item.title}</strong> – [${item.genresLabel}] ${emojis[index] ?? "🎬"}</div>
            ${posterHtml}
          </div>
        `;
      })
      .join("");
    const pickLinesText = items
      .map((item, index) => {
        return `${item.title} - [${item.genresLabel}] ${emojis[index] ?? "🎬"}${item.posterUrl ? `\nPoster: ${item.posterUrl}` : ""}`;
      })
      .join("\n\n");

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
          ${pickLinesHtml}
          <p><strong>Ready to watch?🥳</strong></p>
          <p>With one click, jump straight into your favorite world:</p>
          <p><a href="${siteUrl}" target="_blank" rel="noopener">Click here to watch now</a></p>
          <p>Have a great night,🌙🌒<br/>The MovieVault Team😉</p>
          <p style="margin:24px 0 0">
            <img src="${footerImageUrl}" alt="MovieVault Library" width="600" style="max-width:100%;border-radius:12px;display:block;border:1px solid #e5e7eb" />
          </p>
        </div>
      `,
      text: `Hi ${name},

No need to search endlessly for "What should I watch tonight?"... We've updated the library just for you!

We've just added a carefully curated selection of shows that we're sure you'll love:
${pickLinesText}

Ready to watch?🥳
Click here to watch now: ${siteUrl}

Direct image URL: ${heroImageUrl}

Have a great night,🌙🌒
The MovieVault Team😉

Footer image: ${footerImageUrl}`,
    });

    if (!ok) {
      return NextResponse.json({ ok: false, error: "send_failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, sent: 1 });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
