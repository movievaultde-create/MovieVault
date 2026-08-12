"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useLang, type TranslationKey } from "../context/LanguageContext";
import MediaCard from "./MediaCard";

interface BrowseItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
  studio?: string | null;
}

export default function BrowseGrid({
  category,
  titleKey,
  hideHeader,
}: {
  category: "movies" | "series" | "anime" | "anime-action" | "anime-family" | "anime-18" | "anilist" | "anilist-shounen" | "anilist-seinen" | "arab-movies" | "arab-series" | "turkish-series" | "korean-series" | "indian-series" | "indian-movies";
  titleKey: TranslationKey;
  hideHeader?: boolean;
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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let res = await fetch(
          `/api/discover?category=${encodeURIComponent(category)}&lang=${tmdbLang}&page=${p}`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          setItems((prev) => (append ? [...prev, ...data.results] : data.results));
          setTotalPages(data.total_pages ?? 1);
        }
      } catch {
        setItems((prev) => (append ? prev : []));
        setTotalPages(1);
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
    <div className={hideHeader ? undefined : "min-h-screen bg-[var(--bg-base)] pt-24 pb-16"}>
      <div className={hideHeader ? undefined : "mx-auto max-w-[1400px] px-4 sm:px-6"}>
        {!hideHeader && (
          <div className="mb-8 flex items-center gap-3">
            <Link href="/" className="btn-ghost !h-9 !w-9 !rounded-full !p-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </Link>
            <div className="h-8 w-1 rounded-full bg-[var(--accent)]" />
            <h1 className="text-2xl font-black text-[var(--text-primary)] sm:text-3xl">{t(titleKey)}</h1>
            {!initialLoad && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-dim)]">
                {totalPages * 20}+ {t(titleKey).toLowerCase()}
              </span>
            )}
          </div>
        )}

        {initialLoad ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {skeletons.map((_, i) => (
              <div key={i}>
                <div className="aspect-[2/3] w-full rounded-xl skeleton" />
                <div className="mt-2 h-3.5 w-3/4 rounded skeleton" />
                <div className="mt-1.5 h-3 w-1/2 rounded skeleton" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] py-16 text-center">
            <p className="text-[var(--text-muted)]">{t("searchNoResults")}</p>
            {category === "anime-18" && (
              <Link href="/anime" className="btn-primary text-sm">
                {t("allAnime")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {items
              .filter((item) => item != null && Number.isFinite(item.id))
              .map((item, idx) => (
                <MediaCard
                  key={`${item.type}-${item.id}-${idx}`}
                  item={item}
                  tvLabel={t("tvShow")}
                  showStudio={Boolean(item.studio)}
                />
              ))}
          </div>
        )}

        <div ref={loaderRef} className="mt-8 flex items-center justify-center py-8">
          {loading && !initialLoad && (
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              <span className="text-sm text-[var(--text-muted)]">{t("loadMore")}...</span>
            </div>
          )}
          {!loading && page >= totalPages && items.length > 0 && (
            <span className="text-sm text-[var(--text-muted)]">{t("noMoreResults")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
