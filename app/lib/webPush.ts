import webpush, { type PushSubscription } from "web-push";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:admin@movievault.local";

let configured = false;

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export function isWebPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
}

function ensureWebPushConfigured() {
  if (configured) return;
  if (!isWebPushConfigured()) {
    throw new Error("web_push_not_configured");
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
}

export async function sendWebPush(
  subscription: PushSubscription,
  payload: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; statusCode?: number }> {
  try {
    ensureWebPushConfigured();
    await webpush.sendNotification(subscription, JSON.stringify(payload), {
      TTL: 60 * 60,
      urgency: "normal",
    });
    return { ok: true };
  } catch (error) {
    const statusCode =
      typeof error === "object" && error && "statusCode" in error
        ? Number((error as { statusCode?: number }).statusCode)
        : undefined;
    return { ok: false, statusCode };
  }
}
