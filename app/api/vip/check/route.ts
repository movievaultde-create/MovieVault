import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

const VIP_EMAILS = (process.env.VIP_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return NextResponse.json({ valid: false });
    }

    const safeEmail = email.trim().toLowerCase();
    let valid = VIP_EMAILS.includes(safeEmail);

    if (!valid) {
      try {
        const supabase = getSupabaseAdmin();
        const { data } = await supabase
          .from("app_vip_grants")
          .select("id")
          .eq("user_email", safeEmail)
          .gt("expires_at", new Date().toISOString())
          .order("expires_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        valid = Boolean(data);
      } catch {
        // keep env-list fallback only
      }
    }

    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
