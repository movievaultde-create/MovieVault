import { NextRequest, NextResponse } from "next/server";
import { submitIndexNow } from "../../../lib/indexnow";
import { getFreshWatchUrls } from "../../../lib/sitemapCatalog";
import { SITE_URL } from "../../../lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}

/** Daily: send new/trending watch URLs to IndexNow so Bing/Google recrawl them. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const urls = await getFreshWatchUrls();
  const result = await submitIndexNow(urls);

  return NextResponse.json({
    ok: result.ok,
    submitted: result.submitted,
    sitemap: `${SITE_URL}/sitemap.xml`,
  });
}
