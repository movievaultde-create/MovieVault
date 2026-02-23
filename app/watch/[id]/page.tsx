"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang, type TranslationKey } from "../../context/LanguageContext";
import { useVip } from "../../context/VipContext";
import { triggerPopunder } from "../../lib/ads";

interface CastMember {
  name: string;
  character: string;
  photo: string | null;
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
}

const SERVERS = [
  {
    name: "MovieVault Server",
    label: "Fast 4K",
    premium: true,
    url: (id: string) => `https://autoembed.co/movie/tmdb/${id}`,
  },
  {
    name: "Server 1",
    label: "VidSrc",
    premium: false,
    url: (id: string) => `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    name: "Server 2",
    label: "Fast",
    premium: false,
    url: (id: string) => `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    name: "Server 3",
    label: "Backup",
    premium: false,
    url: (id: string) => `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
  {
    name: "Server 4",
    label: "VIP",
    premium: false,
    url: (id: string) => `https://embed.su/embed/movie/${id}`,
  },
];

const AD_URL =
  "https://www.effectivegatecpm.com/ksx3jaie5?key=e46ad7ef9f7376acad63fe30acbfcbff";

export default function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t, isAr, isRtl, tmdbLang } = useLang();
  const { isVip } = useVip();
  const [activeServer, setActiveServer] = useState(0);
  const [adDismissed, setAdDismissed] = useState(false);
  const [movie, setMovie] = useState<MovieData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyMsg, setBusyMsg] = useState(false);
  const [switching, setSwitching] = useState(false);

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

  const handleOverlayClick = () => {
    if (!isVip) {
      window.open(AD_URL, "_blank");
      try { window.focus(); } catch {}
    }
    setAdDismissed(true);
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* Back Button */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white"
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

        {/* Player */}
        <div className="relative overflow-hidden rounded-xl border border-surface-border bg-black shadow-2xl">
          <div className="relative aspect-video w-full">
            <iframe
              src={SERVERS[activeServer].url(id)}
              className="absolute inset-0 h-full w-full"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              referrerPolicy="origin"
              
            />

            {!adDismissed && (
              <div
                onClick={handleOverlayClick}
                className="absolute inset-0 z-10 cursor-pointer"
                title={t("clickToPlay")}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-pulse rounded-full bg-white/10 p-6 backdrop-blur-sm">
                    <svg
                      width="48"
                      height="48"
                      viewBox="0 0 24 24"
                      fill="white"
                      className="drop-shadow-lg"
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="rounded-full bg-black/60 px-4 py-2 text-xs text-white/80 backdrop-blur-sm">
                    {t("clickToPlay")}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Servers */}
        <div className="mt-5">
          <span className="mb-3 block text-sm font-medium text-text-muted">{t("servers")}</span>
          <div className="flex flex-wrap gap-2">
            {SERVERS.map((server, i) => {
              const isActive = activeServer === i;
              const handleClick = () => {
                if (isActive) return;
                triggerPopunder();
                if (server.premium) {
                  setTimeout(() => triggerPopunder(), 1500);
                }
                setSwitching(true);
                setAdDismissed(false);
                setTimeout(() => {
                  setActiveServer(i);
                  setSwitching(false);
                }, 2000);
              };

              if (server.premium) {
                return (
                  <button
                    key={i}
                    onClick={handleClick}
                    className={`relative flex items-center gap-2 rounded-lg border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                      isActive
                        ? "border-amber-400 bg-gradient-to-r from-amber-500/15 to-primary/15 text-amber-300 shadow-lg shadow-amber-500/10"
                        : "border-amber-500/40 bg-amber-500/5 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 hover:shadow-md hover:shadow-amber-500/10"
                    }`}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                      <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
                    </svg>
                    {server.name}
                    <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                      {server.label}
                    </span>
                    {!isActive && (
                      <span className="absolute -end-1 -top-1 flex h-4 items-center rounded-full bg-amber-500 px-1.5 text-[8px] font-bold text-black">
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
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10"
                      : "border-surface-border bg-surface text-text-secondary hover:border-primary/40 hover:text-white"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                  {server.name}
                  <span className="rounded bg-surface-light px-1.5 py-0.5 text-[10px] text-text-muted">{server.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Checking server status */}
        {switching && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
            {t("checkingServer")}
          </div>
        )}

        {/* Server busy toast */}
        {busyMsg && (
          <div className="mt-3 animate-fade-in-up rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5 text-sm text-yellow-300">
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
      </div>
    </div>
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
    window.open(AD_URL, "_blank", "noopener,noreferrer");
    setState("counting");
    setCountdown(15);
  };

  const downloadUrl = `https://dl.vidsrc.vip/movie/${id}`;
  const progress = ((15 - countdown) / 15) * 100;

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-surface-border bg-surface">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-surface-border bg-surface-light/50 px-5 py-3">
        <svg
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          className="text-primary"
        >
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        <h3 className="text-sm font-bold text-white">{t("downloadMovie")}</h3>
      </div>

      <div className="p-5">
        {state === "idle" && (
          <div className="flex flex-col items-center gap-4 py-2 sm:flex-row sm:justify-between">
            <div className="text-center sm:text-start">
              <p className="text-sm text-text-secondary">
                {t("downloadNote")}
              </p>
            </div>
            <button
              onClick={handleStart}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary-hover hover:shadow-primary/30 active:scale-[0.97]"
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
                  stroke="var(--surface-border)"
                  strokeWidth="6"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <span className="text-2xl font-bold tabular-nums text-white">
                {countdown}
              </span>
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-white">
                {t("downloadWait")}{" "}
                <span className="text-primary">{countdown}</span>{" "}
                {t("downloadSeconds")}
              </p>
              <p className="mt-1 text-xs text-text-muted">
                {isAr
                  ? "جاري تجهيز رابط التحميل..."
                  : "Preparing your download link..."}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-surface-light">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-linear"
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
        <div className="h-6 w-48 animate-shimmer rounded" />
        <div className="flex gap-6">
          <div className="hidden h-72 w-48 shrink-0 animate-shimmer rounded-lg sm:block" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-full animate-shimmer rounded" />
            <div className="h-4 w-5/6 animate-shimmer rounded" />
            <div className="h-4 w-4/6 animate-shimmer rounded" />
            <div className="mt-6 h-4 w-3/6 animate-shimmer rounded" />
            <div className="h-4 w-2/6 animate-shimmer rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 rounded-xl border border-surface-border bg-surface p-6 text-center">
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
          className="mx-auto mb-3 text-text-muted"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p className="text-sm text-text-muted">
          {error.includes("not configured") ? t("noApiKey") : t("errorLoading")}
        </p>
        <p className="mt-1 text-xs text-text-muted/60">
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
          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            {movie.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {movie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs text-text-secondary"
              >
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="#facc15"
            className="shrink-0"
          >
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
          <div>
            <p className="text-lg font-bold leading-none text-yellow-400">
              {movie.vote_average.toFixed(1)}
            </p>
            <p className="text-[10px] text-text-muted">
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
            <div className="relative h-72 w-48 overflow-hidden rounded-lg border border-surface-border shadow-lg">
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
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
                <div className="h-5 w-1 rounded-full bg-primary" />
                {t("movieStory")}
              </h2>
              <p className="text-sm leading-7 text-text-secondary">
                {movie.overview}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
              <div className="h-5 w-1 rounded-full bg-primary" />
              {t("movieInfo")}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {infoItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface/50 p-3"
                >
                  <svg
                    width="16"
                    height="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    viewBox="0 0 24 24"
                    className="mt-0.5 shrink-0 text-primary"
                  >
                    {item.icon}
                    {item.iconExtra}
                  </svg>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-text-muted">
                      {item.label}
                    </p>
                    <p className="truncate text-sm text-white">{item.value}</p>
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
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <div className="h-5 w-1 rounded-full bg-primary" />
            {t("cast")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {movie.cast.map((person) => (
              <div
                key={person.name}
                className="flex w-24 shrink-0 flex-col items-center gap-2"
              >
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-surface-border bg-surface">
                  {person.photo ? (
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-muted">
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
                  <p className="text-xs font-medium leading-tight text-white">
                    {person.name}
                  </p>
                  <p className="mt-0.5 text-[10px] leading-tight text-text-muted">
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
