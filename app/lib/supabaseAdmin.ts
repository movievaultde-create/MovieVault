import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

function normalizeSupabaseUrl(rawUrl: string | undefined): string | null {
  if (!rawUrl) return null;
  const cleaned = rawUrl.trim().replace(/^['"]|['"]$/g, "");
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (cleaned.includes(".supabase.co")) return `https://${cleaned}`;
  return cleaned;
}

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.SUPABASE_PROJECT_URL;
  const url = normalizeSupabaseUrl(rawUrl);
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY;

  if (!url || !serviceRoleKey) {
    const missing = [];
    if (!url) missing.push("SUPABASE_URL");
    if (!serviceRoleKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    throw new Error(`Supabase env is missing: ${missing.join(", ")}`);
  }

  cached = createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
