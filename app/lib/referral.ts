import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const MILESTONE_SIZE = 5;
const REWARD_DAYS = 30;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function randomCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export async function ensureReferralCode(supabase: SupabaseClient, email: string): Promise<string> {
  const safeEmail = normalizeEmail(email);
  const { data: existing } = await supabase
    .from("app_referral_codes")
    .select("code")
    .eq("user_email", safeEmail)
    .maybeSingle();

  if (existing?.code) return existing.code;

  for (let i = 0; i < 8; i += 1) {
    const code = randomCode();
    const { error } = await supabase.from("app_referral_codes").insert({
      user_email: safeEmail,
      code,
    });

    if (!error) return code;
    if (error.code !== "23505") {
      throw error;
    }
  }

  throw new Error("failed_to_create_referral_code");
}

export async function registerReferralSignup(
  supabase: SupabaseClient,
  referredEmail: string,
  referralCode: string
): Promise<void> {
  const safeEmail = normalizeEmail(referredEmail);
  const safeCode = referralCode.trim().toUpperCase();
  if (!safeCode) return;

  const { data: owner, error: ownerError } = await supabase
    .from("app_referral_codes")
    .select("user_email")
    .eq("code", safeCode)
    .maybeSingle();
  if (ownerError || !owner?.user_email) return;

  const referrerEmail = normalizeEmail(owner.user_email);
  if (referrerEmail === safeEmail) return;

  const { error: referralInsertError } = await supabase.from("app_referrals").insert({
    referrer_email: referrerEmail,
    referred_email: safeEmail,
    referral_code: safeCode,
    status: "qualified",
  });

  if (referralInsertError && referralInsertError.code !== "23505") {
    throw referralInsertError;
  }

  const { count, error: countError } = await supabase
    .from("app_referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_email", referrerEmail)
    .eq("status", "qualified");

  if (countError) throw countError;
  const successfulReferrals = count ?? 0;
  if (successfulReferrals === 0 || successfulReferrals % MILESTONE_SIZE !== 0) return;

  const milestone = successfulReferrals;
  const { data: reward, error: rewardError } = await supabase
    .from("app_referral_rewards")
    .insert({
      user_email: referrerEmail,
      milestone,
      reward_days: REWARD_DAYS,
    })
    .select("id")
    .maybeSingle();

  if (rewardError) {
    if (rewardError.code === "23505") return;
    throw rewardError;
  }
  if (!reward?.id) return;

  const { data: latestGrant } = await supabase
    .from("app_vip_grants")
    .select("expires_at")
    .eq("user_email", referrerEmail)
    .order("expires_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const latestExpiry = latestGrant?.expires_at ? new Date(latestGrant.expires_at) : null;
  const startDate = latestExpiry && latestExpiry > now ? latestExpiry : now;
  const expiresAt = new Date(startDate.getTime() + REWARD_DAYS * 24 * 60 * 60 * 1000);

  const { error: grantError } = await supabase.from("app_vip_grants").insert({
    user_email: referrerEmail,
    source: "referral_5_friends",
    starts_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
  });
  if (grantError) throw grantError;
}
