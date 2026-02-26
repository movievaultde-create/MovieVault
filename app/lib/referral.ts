import { randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const MILESTONE_SIZE = 5;
const REWARD_DAYS = 30;
const MAX_QUALIFIED_PER_IP_DAILY = 2;
const MAX_QUALIFIED_PER_REFERRER_IP_30D = 2;

export interface ReferralSecuritySignals {
  ipHash: string | null;
  deviceHash: string | null;
  userAgentHash: string | null;
}

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
  referralCode: string,
  signals: ReferralSecuritySignals
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

  let status: "qualified" | "rejected" = "qualified";
  let rejectionReason: string | null = null;

  if (signals.deviceHash) {
    const { count: deviceCount, error: deviceError } = await supabase
      .from("app_referrals")
      .select("*", { count: "exact", head: true })
      .eq("device_hash", signals.deviceHash)
      .eq("status", "qualified");
    if (deviceError) throw deviceError;
    if ((deviceCount ?? 0) > 0) {
      status = "rejected";
      rejectionReason = "device_reused";
    }
  }

  if (status === "qualified" && signals.ipHash) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: ipDailyCount, error: ipDailyError } = await supabase
      .from("app_referrals")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", signals.ipHash)
      .eq("status", "qualified")
      .gte("created_at", since24h);
    if (ipDailyError) throw ipDailyError;
    if ((ipDailyCount ?? 0) >= MAX_QUALIFIED_PER_IP_DAILY) {
      status = "rejected";
      rejectionReason = "ip_daily_limit";
    }
  }

  if (status === "qualified" && signals.ipHash) {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: referrerIpCount, error: referrerIpError } = await supabase
      .from("app_referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_email", referrerEmail)
      .eq("ip_hash", signals.ipHash)
      .eq("status", "qualified")
      .gte("created_at", since30d);
    if (referrerIpError) throw referrerIpError;
    if ((referrerIpCount ?? 0) >= MAX_QUALIFIED_PER_REFERRER_IP_30D) {
      status = "rejected";
      rejectionReason = "referrer_ip_limit";
    }
  }

  const { error: referralInsertError } = await supabase.from("app_referrals").insert({
    referrer_email: referrerEmail,
    referred_email: safeEmail,
    referral_code: safeCode,
    status,
    rejection_reason: rejectionReason,
    ip_hash: signals.ipHash,
    device_hash: signals.deviceHash,
    user_agent_hash: signals.userAgentHash,
  });

  if (referralInsertError && referralInsertError.code !== "23505") {
    throw referralInsertError;
  }
  if (status !== "qualified") return;

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
