import type { SupabaseClient } from "@supabase/supabase-js";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SubscriberPreferences = {
  email: string;
  name: string | null;
  isActive: boolean;
  wantsNewReleases: boolean;
  wantsVipUpdates: boolean;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim() ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM?.trim() || "MovieVault <noreply@movie-vault.dev>";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://movie-vault.dev";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

export async function sendEmail(input: SendEmailInput): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [normalizeEmail(input.to)],
        subject: input.subject,
        html: input.html,
        text: input.text ?? "",
      }),
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function upsertEmailSubscriber(
  supabase: SupabaseClient,
  args: { email: string; name?: string | null; userEmail?: string | null; sendWelcome?: boolean }
): Promise<void> {
  const email = normalizeEmail(args.email);
  if (!email) return;

  let safeUserEmail: string | null = null;
  const candidateUserEmail = args.userEmail ? normalizeEmail(args.userEmail) : null;
  if (candidateUserEmail) {
    const { data: userRow } = await supabase
      .from("app_users")
      .select("email")
      .eq("email", candidateUserEmail)
      .maybeSingle();
    safeUserEmail = userRow?.email ?? null;
  }

  const { data: existing } = await supabase
    .from("app_email_subscribers")
    .select("email,is_active")
    .eq("email", email)
    .maybeSingle();

  const wasActive = Boolean(existing?.is_active);

  await supabase.from("app_email_subscribers").upsert(
    {
      email,
      name: args.name?.trim() || null,
      user_email: safeUserEmail,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" }
  );

  if (args.sendWelcome && !wasActive) {
    const safeName = args.name?.trim() || "there";
    await sendEmail({
      to: email,
      subject: "Your account was created successfully - MovieVault",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.7;color:#101418">
          <h2 style="margin:0 0 8px">Hello ${safeName},</h2>
          <p style="margin:0 0 8px">Thank you for choosing MovieVault. We hope our platform exceeds your expectations.</p>
          <p style="margin:0 0 8px">Your account has been created successfully.</p>
          <p style="margin:0 0 8px">You can now watch movies and series, and enable smart notifications.</p>
          <p style="margin:0 0 8px">You can also access VIP for free by inviting friends, or via an affordable monthly plan.</p>
          <p style="margin:0 0 8px">
            Website:
            <a href="${SITE_URL}" target="_blank" rel="noopener">${SITE_URL}</a>
          </p>
          <p style="margin:0">Best regards, and enjoy your watch time.</p>
        </div>
      `,
      text: `Hello ${safeName},
Thank you for choosing MovieVault.
Your account has been created successfully.
You can now watch movies and series, and enable smart notifications.
You can access VIP for free by inviting friends, or via an affordable monthly plan.
Website: ${SITE_URL}
Best regards, and enjoy your watch time.`,
    });
  }
}

export async function getEmailPreferences(
  supabase: SupabaseClient,
  emailRaw: string
): Promise<SubscriberPreferences> {
  const email = normalizeEmail(emailRaw);
  const { data } = await supabase
    .from("app_email_subscribers")
    .select("email,name,is_active,wants_new_releases,wants_vip_updates")
    .eq("email", email)
    .maybeSingle();

  return {
    email,
    name: data?.name ?? null,
    isActive: Boolean(data?.is_active),
    wantsNewReleases: data?.wants_new_releases ?? true,
    wantsVipUpdates: data?.wants_vip_updates ?? true,
  };
}

export async function sendVipStatusEmail(args: {
  email: string;
  active: boolean;
  expiresAt?: string;
}): Promise<void> {
  const subject = args.active ? "Your VIP has been activated" : "Your VIP has been deactivated";
  const expiryLine = args.expiresAt ? `<p>Expires at: ${new Date(args.expiresAt).toUTCString()}</p>` : "";
  await sendEmail({
    to: args.email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>${args.active ? "VIP activated" : "VIP deactivated"}</h2>
        <p>${args.active ? "Your VIP access is now active." : "Your VIP access has been turned off."}</p>
        ${expiryLine}
        <p><a href="${SITE_URL}/dashboard" target="_blank" rel="noopener">Go to Dashboard</a></p>
      </div>
    `,
    text: `${args.active ? "VIP activated" : "VIP deactivated"}. ${args.expiresAt ? `Expires at ${args.expiresAt}.` : ""} ${SITE_URL}/dashboard`,
  });
}

