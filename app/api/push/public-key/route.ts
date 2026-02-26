import { NextResponse } from "next/server";
import { getVapidPublicKey } from "../../../lib/webPush";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ ok: false, error: "push_not_configured" }, { status: 500 });
  }
  return NextResponse.json({ ok: true, publicKey });
}
