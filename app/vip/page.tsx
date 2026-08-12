"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useVip } from "../context/VipContext";
import { useLang } from "../context/LanguageContext";

export default function VipPage() {
  const { isVip, vipEmail, login, logout } = useVip();
  const { t, isRtl } = useLang();
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 pt-24">
        <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-[var(--bg-card)] p-8 text-center shadow-lg sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20">
            <svg width="40" height="40" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-[var(--text-primary)]">{t("vipActive")}</h1>
          <p className="mb-1 text-base text-[var(--text-muted)]">{vipEmail}</p>
          <p className="mb-8 text-sm text-[var(--text-dim)]">{t("vipNoAds")}</p>
          <div className="flex flex-col gap-3">
            <Link href="/" className="btn-primary">
              {t("navHome")}
            </Link>
            <button type="button" onClick={logout} className="btn-ghost">
              {t("vipLogout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 pt-24 pb-10">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--accent-soft)] ring-2 ring-[var(--accent)]/20 sm:h-28 sm:w-28">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="var(--accent)" className="sm:h-14 sm:w-14">
              <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
            </svg>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold text-[var(--text-primary)] sm:text-4xl">
            {t("vipLogin")}
          </h1>

          <div className="mx-auto max-w-sm space-y-3">
            <p className="text-lg font-bold text-[var(--accent)] sm:text-xl">
              {t("vipHeroTitle")}
            </p>
            <p className="text-[15px] leading-relaxed text-[var(--text-muted)] sm:text-base">
              {t("vipHeroDesc")}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-lg sm:p-8">
          <p className="mb-5 text-center text-sm text-[var(--text-dim)]">
            {t("vipDesc")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
                placeholder={t("vipEmailPlaceholder")}
                className="input-field"
                required
                autoFocus
                dir="ltr"
              />
            </div>

            {error && (
              <div className={`flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-500 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                {t("vipError")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </span>
              ) : (
                t("vipSubmit")
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[var(--text-dim)] transition-colors hover:text-[var(--accent)]">
            ← {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
