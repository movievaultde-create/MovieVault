"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useLang } from "../context/LanguageContext";
import { useWatchlist } from "../context/WatchlistContext";
import WatchlistButton from "../components/WatchlistButton";

export default function WatchlistPage() {
  const { isAr } = useLang();
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
      <div className="flex min-h-screen items-center justify-center bg-background px-4 pt-24">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-surface/70 p-7 text-center shadow-2xl">
          <h1 className="text-2xl font-bold text-white">{text.needLogin}</h1>
          <Link
            href="/login"
            className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
          >
            {text.goLogin}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-24">
      <div className="mx-auto max-w-[1400px]">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-white">{text.title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{text.subtitle}</p>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-text-muted">
              {items.length} {text.count}
            </span>
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => clearWatchlist()}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20"
              >
                {text.clear}
              </button>
            )}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-surface/60 p-10 text-center">
            <p className="text-lg font-semibold text-white">{text.empty}</p>
            <Link
              href="/"
              className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-hover"
            >
              {text.goHome}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                className="group relative flex flex-col overflow-hidden rounded-lg bg-surface transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-light">
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-muted">N/A</div>
                  )}

                  <WatchlistButton item={item} />

                  <span className="absolute end-2 top-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {item.rating}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <h3 className="truncate text-sm font-semibold text-white transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-text-muted">{item.year}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
