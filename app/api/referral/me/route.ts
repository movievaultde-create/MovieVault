import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { ensureReferralCode } from "../../../lib/referral";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function GET(req: NextRequest) {
  const email = normalizeEmail(req.nextUrl.searchParams.get("email") ?? "");
  if (!email) {
    return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
  }

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch {
    return NextResponse.json({ ok: false, error: "db_not_configured" }, { status: 500 });
  }

  try {
    const code = await ensureReferralCode(supabase, email);

    const { count, error: countError } = await supabase
      .from("app_referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_email", email)
      .eq("status", "qualified");

    if (countError) {
      return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    }

    const successfulReferrals = count ?? 0;
    const rewardsEarned = Math.floor(successfulReferrals / 5);
    const inCurrentCycle = successfulReferrals % 5;
    const neededToReward = inCurrentCycle === 0 ? 5 : 5 - inCurrentCycle;

    return NextResponse.json({
      ok: true,
      code,
      successfulReferrals,
      rewardsEarned,
      neededToReward,
      nextRewardAt: successfulReferrals + neededToReward,
      inviteLink: `${req.nextUrl.origin}/signup?ref=${encodeURIComponent(code)}`,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "request_error" }, { status: 400 });
  }
}
