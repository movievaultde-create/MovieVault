"use client";

import Image from "next/image";
import WatchlistCtaButton from "./WatchlistCtaButton";
import { useLang } from "../context/LanguageContext";

export interface WatchHeroData {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  backdrop: string | null;
  rating: string;
  meta: string;
  type: "movie" | "tv";
  badge?: string | null;
}

export default function WatchHeroCard({
  data,
  onStartWatching,
}: {
  data: WatchHeroData;
  onStartWatching: () => void;
}) {
  const { t } = useLang();
  const watchlistItem = {
    id: data.id,
    title: data.title,
    poster: data.poster,
    rating: data.rating,
    year: data.year,
    type: data.type,
  };

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm">
      <div className="relative min-h-[200px] sm:min-h-[260px] md:min-h-[300px]">
        {data.backdrop || data.poster ? (
          <Image
            src={data.backdrop || data.poster!}
            alt=""
            fill
            className="object-cover object-center opacity-80"
            priority
            sizes="(max-width: 1100px) 100vw, 1100px"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-soft)] to-[var(--bg-elevated)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-white/20 rtl:bg-gradient-to-l" />
      </div>

      <div className="relative -mt-20 px-4 pb-5 sm:-mt-28 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="relative mx-auto aspect-[2/3] w-36 shrink-0 overflow-hidden rounded-2xl border-2 border-white bg-[var(--bg-elevated)] shadow-xl sm:mx-0 sm:w-44 md:w-48">
            {data.poster ? (
              <Image
                src={data.poster}
                alt={data.title}
                fill
                className="object-cover"
                priority
                sizes="192px"
              />
            ) : null}
          </div>

          <div className="min-w-0 flex-1 text-center sm:text-start">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {data.badge ? (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                  {data.badge}
                </span>
              ) : null}
              {data.year ? (
                <span className="rounded-full bg-[var(--bg-elevated)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--text-muted)]">
                  {data.year}
                </span>
              ) : null}
            </div>

            <h1 className="mt-2 text-xl font-black leading-tight text-[var(--text-primary)] sm:text-2xl md:text-3xl">
              {data.title}
              {data.year ? ` (${data.year})` : ""} {t("subtitled")}
            </h1>

            {data.meta ? (
              <p className="mt-2 text-sm font-semibold text-[var(--text-muted)]">{data.meta}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--border)] pt-4 sm:justify-start">
          {parseFloat(data.rating) > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <span className="text-lg text-[var(--rating)]">★</span>
              <div>
                <p className="text-sm font-black text-amber-700">{data.rating}/10</p>
                <p className="text-[10px] text-amber-600">TMDB</p>
              </div>
            </div>
          )}

          <button type="button" onClick={onStartWatching} className="btn-primary !rounded-full !py-2.5 text-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="5,3 19,12 5,21" />
            </svg>
            {t("startWatching")}
          </button>

          <WatchlistCtaButton item={watchlistItem} />
        </div>
      </div>
    </section>
  );
}
