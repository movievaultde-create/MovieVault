import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { getEmailPreferences, upsertEmailSubscriber } from "../../../lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  if (!email || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
  }

  const prefs = await getEmailPreferences(supabase, email);
  return NextResponse.json({ ok: true, preferences: prefs });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      email?: string;
      name?: string;
      subscribed?: boolean;
      wantsNewReleases?: boolean;
      wantsVipUpdates?: boolean;
    };

    const email = normalizeEmail(body.email ?? "");
    if (!email || !email.includes("@")) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
    }

    const subscribe = body.subscribed ?? true;
    if (subscribe) {
      await upsertEmailSubscriber(supabase, {
        email,
        name: body.name ?? null,
        userEmail: email,
        sendWelcome: true,
      });
    }

    const { error } = await supabase.from("app_email_subscribers").upsert(
      {
        email,
        name: body.name?.trim() || null,
        user_email: email,
        is_active: subscribe,
        wants_new_releases: body.wantsNewReleases ?? true,
        wants_vip_updates: body.wantsVipUpdates ?? true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );

    if (error) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const preferences = await getEmailPreferences(supabase, email);
    return NextResponse.json({ ok: true, preferences });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
