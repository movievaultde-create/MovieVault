"use client";

import { useState, useEffect, use, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang, LANGUAGES, type TranslationKey } from "../../context/LanguageContext";
import VideoPlayer from "../../components/VideoPlayer";
import FollowNotificationButton from "../../components/FollowNotificationButton";
import MediaCard from "../../components/MediaCard";
import { type WatchServer, resolveDirectMovieUrl } from "../../lib/directStreamMap";

interface CastMember {
  name: string;
  character: string;
  photo: string | null;
}

interface RelatedMovie {
  id: number;
  title: string;
  poster: string | null;
  rating: string;
  year: string;
  type: "movie";
}

interface MovieData {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  backdrop_path: string | null;
  genres: string[];
  original_language: string;
  production_countries: string[];
  director: string | null;
  cast: CastMember[];
  trailerYoutubeKey: string | null;
  relatedMovies: RelatedMovie[];
}

const SUB_LANG_MAP: Record<string, string> = {
  EN: "en", AR: "ar", DE: "de", FR: "fr", ES: "es", TR: "tr",
};

function withLangParams(baseUrl: string, subLang: string): string {
  const separator = baseUrl.includes("?") ? "&" : "?";
  return `${baseUrl}${separator}sub=${subLang}&sub_lang=${subLang}&ds_lang=${subLang}&lang=${subLang}&audio_lang=${subLang}`;
}

function buildMovieServers(id: string, subLang: string): WatchServer[] {
  const directUrl = resolveDirectMovieUrl(id);
  return [
    {
      name: "MovieVault Server",
      label: "Fast 4K",
      premium: true,
      playerType: directUrl ? "direct" : "iframe",
      directUrl,
      url: withLangParams(`https://autoembed.co/movie/tmdb/${id}`, subLang),
      mirrors: [
        withLangParams(`https://autoembed.cc/movie/tmdb/${id}`, subLang),
        withLangParams(`https://2embed.cc/embed/tmdb/movie?id=${id}`, subLang),
      ],
    },
    {
      name: "Server 1",
      label: "VidSrc",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://vidsrc.to/embed/movie/${id}`, subLang),
      mirrors: [
        withLangParams(`https://vidsrc.su/embed/movie/${id}`, subLang),
        withLangParams(`https://vidsrc.xyz/embed/movie/${id}`, subLang),
      ],
    },
    {
      name: "Server 2",
      label: "VidSrc Pro",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://vidsrc.cc/v2/embed/movie/${id}`, subLang),
      mirrors: [
        withLangParams(`https://vidsrc.net/embed/movie/${id}`, subLang),
        withLangParams(`https://vidsrc.xyz/embed/movie/${id}`, subLang),
      ],
    },
    {
      name: "Server 3",
      label: "Embed",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://embed.su/embed/movie/${id}`, subLang),
      mirrors: [
        withLangParams(`https://embed.smashystream.com/playere.php?tmdb=${id}`, subLang),
      ],
    },
    {
      name: "Server 4",
      label: "Multi",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://multiembed.mov/?video_id=${id}&tmdb=1`, subLang),
      mirrors: [
        withLangParams(`https://multiembed.stream/?video_id=${id}&tmdb=1`, subLang),
      ],
    },
    {
      name: "Server 5",
      label: "Videasy",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://player.videasy.net/movie/${id}`, subLang),
      mirrors: [
        withLangParams(`https://player.autoembed.cc/movie/${id}`, subLang),
      ],
    },
    {
      name: "Server 6",
      label: "NonTongo",
      premium: false,
      playerType: "iframe",
      url: withLangParams(`https://nontongo.win/embed/movie/${id}`, subLang),
      mirrors: [
        withLangParams(`https://nontongo.me/embed/movie/${id}`, subLang),
      ],
    },
  ];
}


export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang, t, isAr, isRtl, tmdbLang } = useLang();
  const subLang = SUB_LANG_MAP[lang] ?? "en";
  const subLabel = LANGUAGES.find((l) => l.code === lang)?.label ?? "English";
  const SERVERS = useMemo(() => buildMovieServers(id, subLang), [id, subLang]);
  const [activeServer, setActiveServer] = useState(0);
  const [activeMirror, setActiveMirror] = useState(0);
  const currentServer = SERVERS[activeServer];
  const currentServerUrls = useMemo(
    () => [currentServer.url, ...(currentServer.mirrors ?? [])],
    [currentServer]
  );
  const currentServerUrl = currentServerUrls[Math.min(activeMirror, currentServerUrls.length - 1)] ?? currentServer.url;
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyMsg, setBusyMsg] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setActiveMirror(0);
    setBusyMsg(false);
  }, [activeServer, id, subLang]);

  const handleIframeError = () => {
    if (activeMirror < currentServerUrls.length - 1) {
      setActiveMirror((v) => v + 1);
      setBusyMsg(false);
      return;
    }
    setBusyMsg(true);
    setTimeout(() => setBusyMsg(false), 3500);
  };

  useEffect(() => {
    setActiveServer(0);
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/movie/${id}?lang=${tmdbLang}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setMovie(data);
        }
      })
      .catch(() => setError("fetch_failed"))
      .finally(() => setLoading(false));
  }, [id, tmdbLang]);

  return (
    <div className="min-h-screen bg-[var(--bg-base)] pt-24 pb-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <svg
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            className={isRtl ? "" : "rotate-180"}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t("backToHome")}
        </Link>

        <TrailerSection trailerYoutubeKey={movie?.trailerYoutubeKey ?? null} isAr={isAr} />

        {movie && (
          <div className="mb-4 flex items-center justify-end">
            <FollowNotificationButton
              type="movie"
              itemId={movie.id}
              title={movie.title}
              isAr={isAr}
            />
          </div>
        )}

        {/* Player */}
        <div className="player-shell">
          <div className="relative aspect-video w-full">
            {currentServer.playerType === "direct" && currentServer.directUrl ? (
              <VideoPlayer src={currentServer.directUrl} />
            ) : (
              <iframe
                key={`${activeServer}-${activeMirror}-${id}-${subLang}`}
                src={currentServerUrl}
                onError={handleIframeError}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                referrerPolicy="no-referrer"
                sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-fullscreen"
                loading="lazy"
              />
            )}
            {/* Cover embed tracker badges (e.g. histats) without blocking center controls */}
            <div aria-hidden className="pointer-events-auto absolute bottom-0 start-0 z-[2] h-10 w-36 bg-black" />
            <div aria-hidden className="pointer-events-auto absolute bottom-0 end-0 z-[2] h-10 w-36 bg-black" />
          </div>
        </div>

        {/* Subtitle language indicator */}
        <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span>{t("animeTranslation")}:</span>
          <span className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 font-medium text-[var(--text-primary)]">{subLabel}</span>
        </div>

        {/* Servers */}
        <div className="mt-5">
          <span className="mb-3 block text-sm font-medium text-[var(--text-muted)]">{t("servers")}</span>
          <div className="flex flex-wrap gap-2">
            {SERVERS.map((server, i) => {
              const isActive = activeServer === i;
              const handleClick = () => {
                if (isActive) return;
                setBusyMsg(false);
                setSwitching(true);
                setTimeout(() => {
                  setActiveServer(i);
                  setActiveMirror(0);
                  setSwitching(false);
                }, 2000);
              };

              if (server.premium) {
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className={`relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all ${
                      isActive ? "server-btn-adfree" : "server-btn-default border-[var(--accent)]/40 text-[var(--accent)]"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[var(--accent)]">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {server.name}
                    <span className="rounded bg-[var(--accent-soft)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                      {server.label}
                    </span>
                    {!isActive && (
                      <span className="absolute -end-1 -top-1 flex h-4 items-center rounded-full bg-[var(--accent)] px-1.5 text-[8px] font-bold text-white">
                        {t("recommended")}
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <button
                  key={i}
                  onClick={handleClick}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive ? "server-btn-active" : "server-btn-default"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  {server.name}
                  <span className="rounded border border-[var(--border)] bg-[var(--bg-elevated)] px-1.5 py-0.5 text-[10px] text-[var(--text-dim)]">{server.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checking server status */}
        {switching && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--accent)]">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
            {t("checkingServer")}
          </div>
        )}

        {/* Server busy toast */}
        {busyMsg && (
          <div className="mt-3 animate-fade-in-up rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-700">
            <span className="me-2">⏳</span>{t("serverBusy")}
          </div>
        )}

        {/* Download */}
        <DownloadSection id={id} t={t} isAr={isAr} />

        {/* Movie Details from TMDB */}
        <MovieDetails
          movie={movie}
          loading={loading}
          error={error}
          t={t}
          isAr={isAr}
        />

        <RelatedMoviesSection movie={movie} isAr={isAr} />
      </div>
    </div>
  );
}

function TrailerSection({
  trailerYoutubeKey,
  isAr,
}: {
  trailerYoutubeKey: string | null;
  isAr: boolean;
}) {
  if (!trailerYoutubeKey) return null;
  const trailerUrl =
    `https://www.youtube-nocookie.com/embed/${trailerYoutubeKey}` +
    "?autoplay=1&mute=1&playsinline=1&rel=0";

  return (
    <section className="mb-5 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
        <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
        <h2 className="text-sm font-bold text-[var(--text-primary)] sm:text-base">
          {isAr ? "التريلر الرسمي" : "Official Trailer"}
        </h2>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={trailerUrl}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          title={isAr ? "تريلر الفيلم" : "Movie Trailer"}
        />
      </div>
    </section>
  );
}

function RelatedMoviesSection({
  movie,
  isAr,
}: {
  movie: MovieData | null;
  isAr: boolean;
}) {
  const related = movie?.relatedMovies ?? [];
  if (!movie || related.length === 0) return null;

  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => {
      const max = el.scrollWidth - el.clientWidth;
      setAtStart(el.scrollLeft <= 8);
      setAtEnd(el.scrollLeft >= max - 8);
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, [related.length]);

  const scrollByAmount = (direction: "next" | "prev") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 300);
    el.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)] sm:text-lg">
          <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
          {isAr ? "مشابهات للمشاهدة" : "More Like This"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollByAmount("prev")}
            disabled={atStart}
            className="btn-ghost !h-9 !w-9 !rounded-full !p-0 disabled:opacity-35"
            aria-label={isAr ? "السابق" : "Previous"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scrollByAmount("next")}
            disabled={atEnd}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)] transition hover:bg-[var(--accent-soft)] disabled:opacity-35"
            aria-label={isAr ? "التالي" : "Next"}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {related.map((item) => (
          <MediaCard
            key={item.id}
            item={item}
            tvLabel={isAr ? "مسلسل" : "TV"}
            className="w-[165px] shrink-0 sm:w-[180px]"
          />
        ))}
      </div>
    </section>
  );
}

function DownloadSection({
  id,
  t,
  isAr,
}: {
  id: string;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}) {
  const [state, setState] = useState<"idle" | "counting" | "ready">("idle");
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (state !== "counting") return;

    if (countdown <= 0) {
      setState("ready");
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown]);

  const handleStart = () => {
    setState("counting");
    setCountdown(15);
  };

  const downloadUrl = `https://dl.vidsrc.vip/movie/${id}`;
  const progress = ((15 - countdown) / 15) * 100;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3">
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="text-[var(--accent)]"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">{t("downloadMovie")}</h3>
      </div>

      <div className="p-5">
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4 py-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-start">
              <p className="text-sm text-[var(--text-muted)]">
                {t("downloadNote")}
              </p>
            </div>
            <button
              onClick={handleStart}
              className="btn-primary flex shrink-0 items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {t("downloadMovie")}
            </button>
          </div>
        )}

        {state === "counting" && (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* Circular Timer */}
            <div className="relative flex h-24 w-24 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--border)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                {countdown}
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {t("downloadWait")}{" "}
                <span className="text-[var(--accent)]">{countdown}</span>{" "}
                {t("downloadSeconds")}
              </p>
              <p className="mt-1 text-xs text-[var(--text-dim)]">
                {isAr
                  ? "جاري تجهيز رابط التحميل..."
                  : "Preparing your download link..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--bg-elevated)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {state === "ready" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <svg
                width="28"
                height="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-400">
              {t("downloadReady")}
            </p>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-green-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-green-600/20 transition-all hover:bg-green-500 hover:shadow-green-500/30 active:scale-[0.97]"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              {t("downloadNow")}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function MovieDetails({
  movie,
  loading,
  error,
  t,
  isAr,
}: {
  movie: MovieData | null;
  loading: boolean;
  error: string | null;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        <div className="h-6 w-48 rounded skeleton" />
        <div className="flex gap-6">
          <div className="hidden h-72 w-48 shrink-0 rounded-lg skeleton sm:block" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-full rounded skeleton" />
            <div className="h-4 w-5/6 rounded skeleton" />
            <div className="h-4 w-4/6 rounded skeleton" />
            <div className="mt-6 h-4 w-3/6 rounded skeleton" />
            <div className="h-4 w-2/6 rounded skeleton" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          className="mx-auto mb-3 text-[var(--text-dim)]"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-sm text-[var(--text-muted)]">
          {error.includes("not configured") ? t("noApiKey") : t("errorLoading")}
        </p>
        <p className="mt-1 text-xs text-[var(--text-dim)]">
          {error.includes("not configured")
            ? isAr
              ? "أضف TMDB_API_KEY في ملف .env.local"
              : "Add TMDB_API_KEY to .env.local"
            : ""}
        </p>
      </div>
    );
  }

  if (!movie) return null;

  const infoItems = [
    {
      label: t("releaseDate"),
      value: movie.release_date,
      icon: (
        <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
      ),
    },
    {
      label: t("duration"),
      value: movie.runtime ? `${movie.runtime} ${t("minutes")}` : "—",
      icon: <circle cx="12" cy="12" r="10" />,
      iconExtra: <path d="M12 6v6l4 2" />,
    },
    {
      label: t("genre"),
      value: movie.genres.join("، "),
      icon: <path d="M7 4v16M7 16l10-4V4L7 8" />,
    },
    {
      label: t("director"),
      value: movie.director ?? "—",
      icon: (
        <path d="M15.6 11.6L22 7v10l-6.4-4.5v-1zM4 5h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V7a2 2 0 012-2z" />
      ),
    },
    {
      label: t("country"),
      value: movie.production_countries.join("، ") || "—",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </>
      ),
    },
  ];

  return (
    <div className="mt-8 space-y-6">
      {/* Title + Rating */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            {movie.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {movie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-muted)]"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="var(--rating)"
            className="shrink-0"
          >
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
          <div>
            <p className="text-lg font-bold leading-none text-[var(--rating)]">
              {movie.vote_average.toFixed(1)}
            </p>
            <p className="text-[10px] text-[var(--text-dim)]">
              {movie.vote_count.toLocaleString()} {t("votes")}
            </p>
          </div>
        </div>
      </div>

      {/* Poster + Synopsis + Info */}
      <div className="flex gap-6">
        {/* Poster */}
        {movie.poster_path && (
          <div className="hidden shrink-0 sm:block">
            <div className="relative h-72 w-48 overflow-hidden rounded-lg border border-[var(--border)] shadow-lg">
              <Image
                src={movie.poster_path}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="192px"
              />
            </div>
          </div>
        )}

        <div className="flex-1 space-y-6">
          {/* Synopsis */}
          {movie.overview && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
                <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
                {t("movieStory")}
              </h2>
              <p className="text-sm leading-7 text-[var(--text-muted)]">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
              <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
              {t("movieInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] p-3"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    className="mt-0.5 shrink-0 text-[var(--accent)]"
                  >
                    {item.icon}
                    {item.iconExtra}
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-[var(--text-dim)]">
                      {item.label}
                    </p>
                    <p className="truncate text-sm text-[var(--text-primary)]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cast */}
      {movie.cast.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]">
            <div className="h-5 w-1 rounded-full bg-[var(--accent)]" />
            {t("cast")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {movie.cast.map((person) => (
              <div
                key={person.name}
                className="flex w-24 shrink-0 flex-col items-center gap-2"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-[var(--border)] bg-[var(--bg-surface)]">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--text-dim)]">
                      <svg
                        width="28"
                        height="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium leading-tight text-[var(--text-primary)]">
                    {person.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-[var(--text-dim)]">
                    {person.character}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
