"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

export default function VipPage() {
  const { isVip, vipEmail, login, logout } = useVip();
  const { t } = useLang();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(false);
    const ok = await login(email.trim());
    setLoading(false);
    if (ok) {
      router.push("/");
    } else {
      setError(true);
    }
  };

  if (isVip) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
        <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-8 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">{t("vipActive")}</h1>
          <p className="mb-1 text-sm text-text-secondary">{vipEmail}</p>
          <p className="mb-6 text-xs text-text-muted">{t("vipNoAds")}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-hover"
            >
              {t("navHome")}
            </Link>
            <button
              onClick={logout}
              className="rounded-xl border border-surface-border px-6 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-light hover:text-white"
            >
              {t("vipLogout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
      <div className="w-full max-w-md rounded-2xl border border-surface-border bg-surface p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b">
              <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">{t("vipLogin")}</h1>
          <p className="text-sm text-text-secondary">{t("vipDesc")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              placeholder={t("vipEmailPlaceholder")}
              className="w-full rounded-xl border border-surface-border bg-background px-4 py-3.5 text-sm text-white placeholder-text-muted outline-none transition-colors focus:border-primary"
              required
              autoFocus
              dir="ltr"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
              {t("vipError")}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
          >
            {loading ? "..." : t("vipSubmit")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-text-muted transition-colors hover:text-white">
            {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
