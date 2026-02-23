"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import HeroSection from "./components/HeroSection";
import { useLang } from "./context/LanguageContext";

interface BrowseItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
}

interface BrowseData {
  newReleases: BrowseItem[];
  nowPlaying: BrowseItem[];
  upcoming: BrowseItem[];
  newSeries: BrowseItem[];
  newAnime: BrowseItem[];
  trending: BrowseItem[];
  movies: BrowseItem[];
  series: BrowseItem[];
  anime: BrowseItem[];
}

export default function Home() {
  const { t, isRtl, tmdbLang } = useLang();
  const [data, setData] = useState<BrowseData | null>(null);

  useEffect(() => {
    fetch(`/api/browse?lang=${tmdbLang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setData(d); });
  }, [tmdbLang]);

  return (
    <>
      <HeroSection />

      {/* New Releases (last 30 days) */}
      {(data?.newReleases?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.newReleases}
          title={t("newReleases")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {/* Now in Cinemas */}
      {(data?.nowPlaying?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.nowPlaying}
          title={t("nowPlaying")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {/* Upcoming Movies */}
      {(data?.upcoming?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.upcoming}
          title={t("upcomingMovies")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {/* New Series Episodes */}
      {(data?.newSeries?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.newSeries}
          title={t("newSeries")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {/* New Anime Episodes */}
      {(data?.newAnime?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.newAnime}
          title={t("newAnime")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      <TrendingSection
        items={data?.trending ?? []}
        title={t("trendingWeek")}
        isRtl={isRtl}
        tvLabel={t("tvShow")}
      />

      <ContentSection
        id="movies"
        title={t("latestMovies")}
        items={data?.movies ?? []}
        viewAllLabel={t("viewAll")}
        viewAllHref="/movies"
        tvLabel={t("tvShow")}
      />

      <ContentSection
        id="series"
        title={t("latestSeries")}
        items={data?.series ?? []}
        viewAllLabel={t("viewAll")}
        viewAllHref="/tv-series"
        tvLabel={t("tvShow")}
      />

      <ContentSection
        id="anime"
        title={t("latestAnime")}
        items={data?.anime ?? []}
        viewAllLabel={t("viewAll")}
        viewAllHref="/anime"
        tvLabel={t("tvShow")}
        isLast
      />
    </>
  );
}

function TrendingSection({
  items,
  title,
  isRtl,
  tvLabel,
}: {
  items: BrowseItem[];
  title: string;
  isRtl: boolean;
  tvLabel: string;
}) {
  const skeletons = Array.from({ length: 6 });

  return (
    <section className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-7 w-1 rounded-full bg-gradient-to-b from-orange-400 to-red-600" />
        <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {skeletons.map((_, i) => (
            <div key={i} className="w-36 shrink-0 overflow-hidden rounded-lg bg-surface sm:w-44">
              <div className="aspect-[2/3] w-full animate-shimmer" />
              <div className="space-y-2 p-2.5">
                <div className="h-3.5 w-3/4 animate-shimmer rounded" />
                <div className="h-3 w-1/2 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {items.map((item, i) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`}
                className="group relative w-36 shrink-0 overflow-hidden rounded-lg bg-surface transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/40 sm:w-44"
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

                  {/* Rank badge */}
                  <span className="absolute start-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-[11px] font-black text-white shadow-lg">
                    {i + 1}
                  </span>

                  {/* Type badge for TV */}
                  {item.type === "tv" && (
                    <span className="absolute end-2 top-2 rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
                      {tvLabel}
                    </span>
                  )}

                  {/* Rating */}
                  <span className="absolute end-2 bottom-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {item.rating}
                  </span>

                  {/* Hover play */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <div className="flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-primary/90 text-white shadow-lg transition-transform duration-300 group-hover:scale-100 sm:h-12 sm:w-12">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="p-2.5">
                  <h3 className="truncate text-[13px] font-semibold text-white transition-colors group-hover:text-primary">
                    {item.title}
                  </h3>
                  <span className="text-[11px] text-text-muted">{item.year}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ContentSection({
  id,
  title,
  items,
  viewAllLabel,
  viewAllHref,
  tvLabel,
  isLast,
}: {
  id: string;
  title: string;
  items: BrowseItem[];
  viewAllLabel: string;
  viewAllHref?: string;
  tvLabel: string;
  isLast?: boolean;
}) {
  const skeletons = Array.from({ length: 6 });

  return (
    <section
      id={id}
      className={`mx-auto max-w-[1400px] scroll-mt-20 px-4 py-8 sm:px-6 ${isLast ? "pb-16" : ""}`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-1 rounded-full bg-primary" />
          <h2 className="text-xl font-bold text-white sm:text-2xl">{title}</h2>
        </div>
        <Link
          href={viewAllHref ?? "#"}
          className="flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary-hover"
        >
          {viewAllLabel}
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      </div>

      {items.length === 0 ? (
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
          {items.map((item) => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} tvLabel={tvLabel} />
          ))}
        </div>
      )}
    </section>
  );
}

function MediaCard({ item, tvLabel }: { item: BrowseItem; tvLabel: string }) {
  const href = item.type === "movie" ? `/watch/${item.id}` : `/watch/tv/${item.id}`;
  const typeBadge = item.type === "tv";

  return (
    <Link
      href={href}
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

        {/* Type badge for TV */}
        {typeBadge && (
          <span className="absolute start-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            {tvLabel}
          </span>
        )}

        {/* Rating */}
        <span className="absolute end-2 top-2 flex items-center gap-0.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-yellow-400 backdrop-blur-sm">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
          {item.rating}
        </span>

        {/* Hover play */}
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
  );
}
