"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useWatchlist } from "../context/WatchlistContext";
import MediaCard from "../components/MediaCard";

export default function WatchlistPage() {
  const { isAr, t } = useLang();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { items, ready, clearWatchlist } = useWatchlist();

  const text = useMemo(
    () => ({
      title: isAr ? "قائمة المفضلة" : "Your Watchlist",
      subtitle: isAr ? "كل الأفلام والمسلسلات التي حفظتها" : "All your saved movies and shows",
      empty: isAr ? "لم تقم بحفظ أي عنوان بعد." : "You have not saved anything yet.",
      goHome: isAr ? "استكشاف المحتوى" : "Explore content",
      needLogin: isAr ? "سجّل الدخول للوصول إلى قائمة المفضلة." : "Login to access your watchlist.",
      goLogin: isAr ? "الذهاب لتسجيل الدخول" : "Go to Login",
      clear: isAr ? "مسح القائمة" : "Clear watchlist",
      count: isAr ? "عنصر محفوظ" : "saved titles",
    }),
    [isAr]
  );

  if (authLoading || !ready) return null;

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-base)] px-4 pt-24">
        <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-7 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">{text.needLogin}</h1>
          <Link href="/login" className="btn-primary mt-5 inline-flex">
            {text.goLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] px-4 pb-16 pt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">{text.title}</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{text.subtitle}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-dim)]">
              {items.length} {text.count}
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  void clearWatchlist();
                }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-500/20"
              >
                {text.clear}
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-10 text-center">
            <p className="text-lg font-semibold text-[var(--text-primary)]">{text.empty}</p>
            <Link href="/" className="btn-primary mt-4 inline-flex">
              {text.goHome}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <MediaCard key={`${item.type}-${item.id}`} item={item} tvLabel={t("tvShow")} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
