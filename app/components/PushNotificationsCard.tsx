"use client";

import { useEffect, useMemo, useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationsCard({ email, isAr }: { email: string; isAr: boolean }) {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const text = useMemo(
    () => ({
      title: isAr ? "الإشعارات الذكية" : "Smart Notifications",
      subtitle: isAr
        ? "تنبيهك عند نزول حلقة جديدة أو توفر نسخة BluRay."
        : "Get alerts for new episodes and BluRay availability.",
      enable: isAr ? "تفعيل الإشعارات" : "Enable Notifications",
      disable: isAr ? "إيقاف الإشعارات" : "Disable Notifications",
      enabled: isAr ? "الإشعارات مفعلة" : "Notifications enabled",
      blocked: isAr ? "المتصفح حظر الإشعارات" : "Browser blocked notifications",
      notSupported: isAr ? "المتصفح لا يدعم Web Push" : "Web Push is not supported",
    }),
    [isAr]
  );

  useEffect(() => {
    const isSupported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setSupported(isSupported);
    if (!isSupported) return;
    setPermission(Notification.permission);

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => setSubscribed(false));
  }, []);

  const enable = async () => {
    if (!supported || loading) return;
    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.register("/sw.js");
      const keyRes = await fetch("/api/push/public-key");
      const keyData = (await keyRes.json()) as { ok?: boolean; publicKey?: string };
      if (!keyRes.ok || !keyData.ok || !keyData.publicKey) return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subscription }),
      });
      if (saveRes.ok) setSubscribed(true);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    if (!supported || loading) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }
      setSubscribed(false);
    } catch {
      // no-op
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
      <h2 className="text-base font-bold text-[var(--accent)]">{text.title}</h2>
      <p className="mt-1 text-xs text-[var(--text-muted)]">{text.subtitle}</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!supported && <span className="text-xs text-yellow-700">{text.notSupported}</span>}
        {supported && permission === "denied" && <span className="text-xs text-red-500">{text.blocked}</span>}
        {supported && permission !== "denied" && (
          <>
            {subscribed ? (
              <button
                type="button"
                onClick={() => void disable()}
                disabled={loading}
                className="btn-ghost !px-4 !py-2 !text-xs disabled:opacity-60"
              >
                {loading ? "..." : text.disable}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void enable()}
                disabled={loading}
                className="btn-primary !px-4 !py-2 !text-xs disabled:opacity-60"
              >
                {loading ? "..." : text.enable}
              </button>
            )}
            {subscribed && <span className="text-xs text-emerald-600">{text.enabled}</span>}
          </>
        )}
      </div>
    </div>
  );
}
