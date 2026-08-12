import { NextRequest, NextResponse } from "next/server";
import { refreshCatalogAndIndex } from "../../../lib/catalogRefresh";
import { SITE_URL } from "../../../lib/siteUrl";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return true;
  return (req.headers.get("authorization") ?? "") === `Bearer ${secret}`;
}

/** Morning + evening: refresh homepage rails and submit new titles to IndexNow. */
export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await refreshCatalogAndIndex();
  return NextResponse.json({
    ok: result.ok,
    submitted: result.submitted,
    urls: result.urls,
    sitemap: `${SITE_URL}/sitemap.xml`,
  });
}
