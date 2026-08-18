"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import HeroSection from "./HeroSection";
import AiRecommendationPanel from "./AiRecommendationPanel";
import MediaCard from "./MediaCard";
import { CoverAgeBadge } from "./CoverAgeBadge";
import { fallbackAgeFromMedia } from "../lib/mal/ageRatingMap";
import WatchlistButton from "./WatchlistButton";
import { CoverAdLink } from "./ads/CoverAdLink";
import { withInGridAds } from "./ads/insertInGridAds";
import { SiteAdsterraRail } from "./ads/SiteAdsterraRail";
import { ExoClickNative } from "./ads/ExoClickNative";
import { WatchPageBottomAds } from "./ads/WatchPageBottomAds";
import { useLang } from "../context/LanguageContext";
import { watchPath } from "../lib/watchUrl";

interface BrowseItem {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie" | "tv";
}

interface AnimeUpdateItem {
  id: number;
  anilistId: number;
  malId?: number | null;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  episodeHint: string | null;
  href: string;
  genres?: string[];
  isAdult?: boolean;
}

interface BrowseData {
  hotNow?: BrowseItem[];
  newReleases: BrowseItem[];
  nowPlaying: BrowseItem[];
  upcoming: BrowseItem[];
  newSeries: BrowseItem[];
  newAnime: BrowseItem[];
  dailyDigest: {
    date: string;
    movies: BrowseItem[];
    series: BrowseItem[];
    anime: BrowseItem[];
    arabic: BrowseItem[];
  };
  trending: BrowseItem[];
  movies: BrowseItem[];
  series: BrowseItem[];
  anime: BrowseItem[];
}

export default function HomePageClient() {
  const { t, isRtl, tmdbLang, isAr, lang } = useLang();
  const [data, setData] = useState<BrowseData | null>(null);
  const [animeUpdates, setAnimeUpdates] = useState<AnimeUpdateItem[]>([]);

  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    fetch(`/api/browse?lang=${encodeURIComponent(tmdbLang)}&day=${day}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && !d.error) setData(d); });
  }, [tmdbLang]);

  useEffect(() => {
    fetch("/api/anime-updates")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.results && Array.isArray(d.results)) setAnimeUpdates(d.results);
      })
      .catch(() => setAnimeUpdates([]));
  }, []);

  return (
    <>
      <h1 className="sr-only">
        {isAr
          ? "أفلام مترجمة مجاناً — MovieVault خزنة الافلام أفلام ومسلسلات وأنمي HD"
          : "Free subtitled movies, series and anime HD — MovieVault"}
      </h1>
      <HeroSection />
      <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
        <ExoClickNative />
      </div>
      <SiteAdsterraRail />
      <AiRecommendationPanel />

      {/* New Releases = curated hottest + latest (no duplicate section) */}
      {(data?.newReleases?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.newReleases}
          title={t("newReleases")}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {/* الرائج الأنمي → watchclashanime.com */}
      {animeUpdates.length > 0 && (
        <AnimeUpdatesSection
          items={animeUpdates}
          title={t("animeUpdates")}
          isRtl={isRtl}
          viewAllLabel={t("viewAll")}
          isAr={isAr}
          subtitled={t("subtitled")}
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

      {/* Daily categorized updates */}
      {(data?.dailyDigest?.movies?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.dailyDigest.movies}
          title={`${t("addedToday")} • ${t("movie")}`}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {(data?.dailyDigest?.series?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.dailyDigest.series}
          title={`${t("addedToday")} • ${t("tvShow")}`}
          isRtl={isRtl}
          tvLabel={t("tvShow")}
        />
      )}

      {(data?.dailyDigest?.arabic?.length ?? 0) > 0 && (
        <TrendingSection
          items={data!.dailyDigest.arabic}
          title={`${t("addedToday")} • ${t("allArabMovies")}`}
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
        showAd
      />

      <ContentSection
        id="series"
        title={t("latestSeries")}
        items={data?.series ?? []}
        viewAllLabel={t("viewAll")}
        viewAllHref="/tv-series"
        tvLabel={t("tvShow")}
        showAd
        isLast
      />

      <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
        <WatchPageBottomAds />
      </div>
    </>
  );
}

function AnimeUpdatesSection({
  items,
  title,
  isRtl,
  viewAllLabel,
  isAr,
  subtitled,
}: {
  items: AnimeUpdateItem[];
  title: string;
  isRtl: boolean;
  viewAllLabel: string;
  isAr: boolean;
  subtitled: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 8;
    setHasOverflow(overflow);
    if (!overflow) {
      setAtStart(true);
      setAtEnd(true);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (isRtl) {
      // LTR scroller + row-reverse: start = scrolled to the right (max).
      setAtStart(el.scrollLeft >= maxScroll - 8);
      setAtEnd(el.scrollLeft <= 8);
    } else {
      setAtStart(el.scrollLeft < 8);
      setAtEnd(el.scrollLeft >= maxScroll - 8);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollLeft = isRtl ? el.scrollWidth : 0;
      checkScroll();
    });
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items.length, isRtl]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  // LTR scroller: next = +scrollLeft. With row-reverse, later items sit to the left → −scrollLeft.
  const scrollPrev = () => scrollBy(isRtl ? 1 : -1);
  const scrollNext = () => scrollBy(isRtl ? -1 : 1);

  return (
    <section className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <a
          href="https://watchclashanime.com/"
          className="text-xl font-black text-[var(--text-primary)] transition hover:text-[var(--accent)] sm:text-2xl"
        >
          {title}
        </a>
        <div className="flex items-center gap-2">
          <a
            href="https://watchclashanime.com/"
            className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
          >
            {viewAllLabel}
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </a>
          {hasOverflow && (
            <>
              <button
                onClick={scrollPrev}
                disabled={atStart}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-25"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                onClick={scrollNext}
                disabled={atEnd}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-25"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          dir="ltr"
          className={`flex gap-3 overflow-x-auto pb-4 scrollbar-hide ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {items.map((item, i) => (
            <a
              key={item.anilistId}
              href={item.href}
              className="group block w-36 shrink-0 sm:w-44"
            >
              <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-hover)] group-hover:shadow-md">
                <div className="relative aspect-[2/3] w-full bg-[var(--bg-elevated)]">
                  {item.poster ? (
                    <Image
                      src={item.poster}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 144px, 176px"
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : null}

                  <span className="absolute start-2 top-2 z-[1] flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-black text-white shadow">
                    {i + 1}
                  </span>

                  <CoverAgeBadge
                    malId={item.malId}
                    anilistId={item.anilistId}
                    fallbackCode={fallbackAgeFromMedia(item)}
                    className={item.episodeHint ? "!top-10" : undefined}
                  />

                  {item.episodeHint ? (
                    <span className="absolute end-2 top-2 rounded-md bg-black/65 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {isAr ? `الحلقة ${item.episodeHint}` : `Ep ${item.episodeHint}`}
                    </span>
                  ) : null}

                  {parseFloat(item.rating) > 0 && (
                    <span className="absolute end-2 bottom-2 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-[var(--rating)]">
                      ★ {item.rating}
                    </span>
                  )}
                </div>
              </div>

              <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--text-primary)]">
                {isAr ? `${item.title} ${subtitled}` : item.title}
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">{item.year}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
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
  const { isAr, t, lang } = useLang();
  const skeletons = Array.from({ length: 6 });
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth > el.clientWidth + 8;
    setHasOverflow(overflow);
    if (!overflow) {
      setAtStart(true);
      setAtEnd(true);
      return;
    }
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (isRtl) {
      // LTR scroller + row-reverse: start = scrolled to the right (max).
      setAtStart(el.scrollLeft >= maxScroll - 8);
      setAtEnd(el.scrollLeft <= 8);
    } else {
      setAtStart(el.scrollLeft < 8);
      setAtEnd(el.scrollLeft >= maxScroll - 8);
    }
  }, [isRtl]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => {
      el.scrollLeft = isRtl ? el.scrollWidth : 0;
      checkScroll();
    });
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, items.length, isRtl]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  // LTR scroller: next = +scrollLeft. With row-reverse, later items sit to the left → −scrollLeft.
  const scrollPrev = () => scrollBy(isRtl ? 1 : -1);
  const scrollNext = () => scrollBy(isRtl ? -1 : 1);

  return (
    <section className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-8 sm:px-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-2xl">{title}</h2>
        {hasOverflow && (
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              disabled={atStart}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-muted)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] disabled:pointer-events-none disabled:opacity-25"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={scrollNext}
              disabled={atEnd}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:pointer-events-none disabled:opacity-25"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex gap-3 overflow-hidden">
          {skeletons.map((_, i) => (
            <div key={i} className="w-36 shrink-0 sm:w-44">
              <div className="aspect-[2/3] w-full rounded-xl skeleton" />
              <div className="mt-2 h-3.5 w-3/4 rounded skeleton" />
              <div className="mt-1.5 h-3 w-1/2 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          {!atStart && (
            <button
              onClick={scrollPrev}
              className={`absolute top-0 z-10 flex h-[calc(100%-16px)] w-14 items-center justify-center ${isRtl ? "right-0 bg-gradient-to-l" : "left-0 bg-gradient-to-r"} from-[var(--bg-base)] via-[var(--bg-base)]/70 to-transparent`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-md transition hover:border-[var(--border-hover)]">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </div>
            </button>
          )}

          {!atEnd && hasOverflow && (
            <button
              onClick={scrollNext}
              className={`absolute top-0 z-10 flex h-[calc(100%-16px)] w-14 items-center justify-center ${isRtl ? "left-0 bg-gradient-to-r" : "right-0 bg-gradient-to-l"} from-[var(--bg-base)] via-[var(--bg-base)]/70 to-transparent`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] shadow-md transition hover:bg-[var(--accent-soft)]">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            </button>
          )}

          <div
          ref={scrollRef}
          dir="ltr"
          className={`flex gap-3 overflow-x-auto pb-4 scrollbar-hide ${isRtl ? "flex-row-reverse" : ""}`}
        >
            {items.flatMap((item, i) => {
              const card = (
                <CoverAdLink
                  key={`${item.type}-${item.id}`}
                  href={watchPath(item.type, item.id, item.title, lang)}
                  className="group block w-36 shrink-0 sm:w-44"
                  marker="cover-rail"
                >
                  <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm transition group-hover:-translate-y-0.5 group-hover:border-[var(--border-hover)] group-hover:shadow-md">
                    <div className="relative aspect-[2/3] w-full bg-[var(--bg-elevated)]">
                      {item.poster ? (
                        <Image
                          src={item.poster}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 144px, 176px"
                          className="object-cover transition duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                          <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <path d="M8 21h8M12 17v4" />
                          </svg>
                        </div>
                      )}

                      <span className="absolute start-2 top-2 flex h-6 w-6 items-center justify-center rounded-md bg-[var(--accent)] text-[11px] font-black text-white shadow">
                        {i + 1}
                      </span>

                      {item.type === "tv" && (
                        <span className="absolute end-2 top-2 rounded-md bg-[var(--accent-soft)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                          {tvLabel}
                        </span>
                      )}

                      {parseFloat(item.rating) > 0 && (
                        <span className="absolute end-2 bottom-2 flex items-center gap-0.5 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-bold text-[var(--rating)]">
                          ★ {item.rating}
                        </span>
                      )}

                      <WatchlistButton item={item} />
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-2 text-sm font-bold text-[var(--text-primary)]">
                    {isAr ? `${item.title} ${t("subtitled")}` : item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">{item.year}</p>
                </CoverAdLink>
              );

              // Ads off site-wide
              return [card];
            })}
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
  showAd = false,
}: {
  id: string;
  title: string;
  items: BrowseItem[];
  viewAllLabel: string;
  viewAllHref?: string;
  tvLabel: string;
  isLast?: boolean;
  showAd?: boolean;
}) {
  const skeletons = Array.from({ length: 6 });

  return (
    <section
      id={id}
      className={`mx-auto max-w-[1400px] scroll-mt-20 px-4 py-8 sm:px-6 ${isLast ? "pb-16" : ""}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black text-[var(--text-primary)] sm:text-2xl">{title}</h2>
        <Link
          href={viewAllHref ?? "#"}
          className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-bright)]"
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
            <div key={i}>
              <div className="aspect-[2/3] w-full rounded-xl skeleton" />
              <div className="mt-2 h-3.5 w-3/4 rounded skeleton" />
              <div className="mt-1.5 h-3 w-1/2 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {showAd
            ? withInGridAds(
                items.map((item) => (
                  <MediaCard key={`${item.type}-${item.id}`} item={item} tvLabel={tvLabel} />
                )),
                {
                  every: 8,
                  maxAds: 1,
                  firstAt: 1,
                  slotPrefix: `home-${id}`,
                },
              )
            : items.map((item) => (
                <MediaCard key={`${item.type}-${item.id}`} item={item} tvLabel={tvLabel} />
              ))}
        </div>
      )}
    </section>
  );
}

