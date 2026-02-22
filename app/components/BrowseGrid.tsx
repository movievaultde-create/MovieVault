"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useLang, type TranslationKey } from "../context/LanguageContext";
import { triggerPopunder } from "../lib/ads";

interface BrowseItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
}

export default function BrowseGrid({
  category,
  titleKey,
}: {
  category: "movies" | "series" | "anime";
  titleKey: TranslationKey;
}) {
  const { t, tmdbLang } = useLang();
  const [items, setItems] = useState<BrowseItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchPage = useCallback(
    async (p: number, append: boolean) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/discover?category=${category}&lang=${tmdbLang}&page=${p}`
        );
        const data = await res.json();
        if (data.results) {
          setItems((prev) => (append ? [...prev, ...data.results] : data.results));
          setTotalPages(data.total_pages ?? 1);
        }
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [category, tmdbLang]
  );

  useEffect(() => {
    setItems([]);
    setPage(1);
    setInitialLoad(true);
    fetchPage(1, false);
  }, [fetchPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && page < totalPages) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, true);
          triggerPopunder();
        }
      },
      { rootMargin: "600px" }
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [page, totalPages, loading, fetchPage]);

  const skeletons = Array.from({ length: 18 });

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-text-secondary transition-colors hover:bg-surface-light hover:text-white"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{t(titleKey)}</h1>
          {!initialLoad && (
            <span className="rounded-full bg-surface px-3 py-1 text-xs text-text-muted">
              {totalPages * 20}+ {t(titleKey).toLowerCase()}
            </span>
          )}
        </div>

        {/* Grid */}
        {initialLoad ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {skeletons.map((_, i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-surface">
                <div className="aspect-[2/3] w-full animate-shimmer" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/2 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items.map((item, idx) => (
              <Link
                key={`${item.type}-${item.id}-${idx}`}
                href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                className="group relative flex flex-col overflow-hidden rounded-lg bg-surface transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/40"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface-light">
                  {item.poster ? (
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-muted">
                      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                  )}

                  {item.type === "tv" && (
                    <span className="absolute start-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
                      {t("tvShow")}
                    </span>
                  )}

                  <span className="absolute end-2 top-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {item.rating}
                  </span>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <div className="flex h-12 w-12 scale-0 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-transform duration-300 group-hover:scale-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
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

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} className="mt-8 flex items-center justify-center py-8">
          {loading && !initialLoad && (
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span className="text-sm text-text-muted">{t("loadMore")}...</span>
            </div>
          )}
          {!loading && page >= totalPages && items.length > 0 && (
            <span className="text-sm text-text-muted">{t("noMoreResults")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
