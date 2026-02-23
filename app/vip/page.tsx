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
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20">
        <div className="w-full max-w-md rounded-3xl border border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent p-8 text-center shadow-2xl sm:p-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20">
            <svg width="40" height="40" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="mb-2 text-3xl font-extrabold text-white">{t("vipActive")}</h1>
          <p className="mb-1 text-base text-gray-400">{vipEmail}</p>
          <p className="mb-8 text-sm text-gray-500">{t("vipNoAds")}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className="rounded-2xl bg-primary px-6 py-4 text-base font-bold text-white transition-colors hover:bg-primary-hover"
            >
              {t("navHome")}
            </Link>
            <button
              onClick={logout}
              className="rounded-2xl border border-white/10 px-6 py-4 text-base font-medium text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
            >
              {t("vipLogout")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-20 pb-10">
      <div className="w-full max-w-lg">
        {/* VIP Icon */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/10 ring-2 ring-amber-500/20 sm:h-28 sm:w-28">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#f59e0b" className="sm:h-14 sm:w-14">
              <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
            </svg>
          </div>

          {/* Main Title */}
          <h1 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            {t("vipLogin")}
          </h1>

          {/* Hero Text */}
          <div className="mx-auto max-w-sm space-y-3">
            <p className="text-lg font-bold text-amber-400 sm:text-xl">
              {t("vipHeroTitle")}
            </p>
            <p className="text-[15px] leading-relaxed text-gray-400 sm:text-base">
              {t("vipHeroDesc")}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-sm sm:p-8">
          <p className="mb-5 text-center text-sm text-gray-500">
            {t("vipDesc")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(false); }}
                placeholder={t("vipEmailPlaceholder")}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-base text-white placeholder-gray-600 outline-none transition-all focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20"
                required
                autoFocus
                dir="ltr"
              />
            </div>

            {error && (
              <div className={`flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 text-sm text-red-400 ${isRtl ? "flex-row-reverse text-right" : ""}`}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <circle cx="12" cy="12" r="10" /><path d="M15 9l-6 6M9 9l6 6" />
                </svg>
                {t("vipError")}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-primary py-4 text-lg font-bold text-white shadow-lg shadow-amber-500/15 transition-all hover:shadow-xl hover:shadow-amber-500/25 disabled:opacity-50"
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

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-gray-500 transition-colors hover:text-white">
            ← {t("backToHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
