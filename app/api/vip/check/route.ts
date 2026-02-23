import { NextRequest, NextResponse } from "next/server";

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
    const valid = VIP_EMAILS.includes(email.trim().toLowerCase());
    return NextResponse.json({ valid });
  } catch {
    return NextResponse.json({ valid: false });
  }
}
