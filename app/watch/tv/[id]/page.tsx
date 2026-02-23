"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang, type TranslationKey } from "../../../context/LanguageContext";
import { useVip } from "../../../context/VipContext";
import { triggerPopunder, getAdUrl } from "../../../lib/ads";
import VideoAdOverlay from "../../../components/VideoAdOverlay";

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
  poster: string | null;
}

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still: string | null;
  runtime: number | null;
  vote_average: number;
}

interface ShowData {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  poster_path: string | null;
  genres: string[];
  number_of_seasons: number;
  seasons: Season[];
  cast: { name: string; character: string; photo: string | null }[];
}


const SUB_LANG_MAP: Record<string, string> = {
  EN: "en", AR: "ar", DE: "de", FR: "fr", ES: "es", TR: "tr",
};

function buildServers(id: string, season: number, episode: number, subLang: string) {
  return [
    {
      name: "MovieVault Server",
      label: "Fast 4K",
      premium: true,
      url: `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}?sub=${subLang}`,
    },
    {
      name: "Server 1",
      label: "VidSrc",
      premium: false,
      url: `https://vidsrc.to/embed/tv/${id}/${season}/${episode}?ds_lang=${subLang}`,
    },
    {
      name: "Server 2",
      label: "VidSrc Pro",
      premium: false,
      url: `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}?sub_lang=${subLang}`,
    },
    {
      name: "Server 3",
      label: "Embed",
      premium: false,
      url: `https://embed.su/embed/tv/${id}/${season}/${episode}?sub=${subLang}`,
    },
    {
      name: "Server 4",
      label: "Multi",
      premium: false,
      url: `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}&sub_id=${subLang}`,
    },
    {
      name: "Server 5",
      label: "Videasy",
      premium: false,
      url: `https://player.videasy.net/tv/${id}/${season}/${episode}?sub=${subLang}`,
    },
    {
      name: "Server 6",
      label: "NonTongo",
      premium: false,
      url: `https://nontongo.win/embed/tv/${id}/${season}/${episode}?sub=${subLang}`,
    },
  ];
}

export default function WatchTVPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lang, t, isAr, isRtl, tmdbLang } = useLang();
  const { isVip } = useVip();
  const subLang = SUB_LANG_MAP[lang] ?? "en";

  const [show, setShow] = useState<ShowData | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState(0);
  const [adActive, setAdActive] = useState(!isVip);
  const [loading, setLoading] = useState(true);
  const [epLoading, setEpLoading] = useState(false);
  const [busyMsg, setBusyMsg] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tv/${id}?lang=${tmdbLang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setShow(data);
          if (data.seasons?.length > 0) {
            setSelectedSeason(data.seasons[0].season_number);
          }
        }
      })
      .finally(() => setLoading(false));
  }, [id, tmdbLang]);

  useEffect(() => {
    if (!show) return;
    setEpLoading(true);
    fetch(`/api/tv/${id}/season/${selectedSeason}?lang=${tmdbLang}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && !data.error) {
          setEpisodes(data.episodes ?? []);
          setSelectedEpisode(1);
        }
      })
      .finally(() => setEpLoading(false));
  }, [id, show, selectedSeason, tmdbLang]);

  const servers = buildServers(id, selectedSeason, selectedEpisode, subLang);

  const playEpisode = (epNum: number) => {
    setSelectedEpisode(epNum);
    window.scrollTo({ top: 0, behavior: "smooth" });
    triggerPopunder();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-16">
        <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
          <div className="mb-4 h-4 w-32 animate-shimmer rounded" />
          <div className="aspect-video w-full animate-shimmer rounded-xl" />
          <div className="mt-6 h-8 w-64 animate-shimmer rounded" />
          <div className="mt-4 flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-28 animate-shimmer rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-16">
      <div className="mx-auto max-w-[1100px] px-4 sm:px-6">
        {/* Back */}
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white"
        >
          <svg
            width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            className={isRtl ? "" : "rotate-180"}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          {t("backToHome")}
        </Link>

        {/* Now Playing Badge */}
        {show && (
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
            <span className="font-bold text-white">{show.name}</span>
            <span className="text-text-muted">—</span>
            <span className="text-primary">
              {t("season")} {selectedSeason} · {t("episode")} {selectedEpisode}
            </span>
          </div>
        )}

        {/* Player */}
        <div className="relative overflow-hidden rounded-xl border border-surface-border bg-black shadow-2xl">
          <div className="relative aspect-video w-full">
            {!adActive && (
              <iframe
                key={`${activeServer}-${selectedSeason}-${selectedEpisode}`}
                src={servers[activeServer].url}
                className="absolute inset-0 h-full w-full"
                allowFullScreen
                allow="autoplay; encrypted-media; picture-in-picture"
                referrerPolicy="origin"
              />
            )}
            <VideoAdOverlay onPhaseChange={(isAd) => setAdActive(isAd)} />
          </div>
        </div>

        {/* Servers */}
        <div className="mt-5">
          <span className="mb-3 block text-sm font-medium text-text-muted">{t("servers")}</span>
          <div className="flex flex-wrap gap-2">
            {servers.map((server, i) => {
              const isActive = activeServer === i;
              const handleServerClick = () => {
                if (isActive) return;
                triggerPopunder();
                if (server.premium) {
                  setTimeout(() => triggerPopunder(), 1500);
                }
                setSwitching(true);
                setTimeout(() => {
                  setActiveServer(i);
                  setSwitching(false);
                }, 2000);
              };

              if (server.premium) {
                return (
                  <button
                    key={i}
                    onClick={handleServerClick}
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
                  onClick={handleServerClick}
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

        {/* Netflix-style Seasons & Episodes */}
        {show && show.seasons.length > 0 && (
          <div className="mt-8">
            {/* Header with season dropdown */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <div className="h-6 w-1 rounded-full bg-primary" />
                {t("episodes")}
              </h2>
              <div className="relative">
                <select
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  className="appearance-none rounded-lg border border-surface-border bg-surface px-4 py-2.5 pe-10 text-sm font-medium text-white outline-none transition-colors hover:border-primary/40 focus:border-primary"
                >
                  {show.seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number}>
                      {t("season")} {s.season_number} ({s.episode_count} {t("episodes")})
                    </option>
                  ))}
                </select>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-text-muted">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
            </div>

            {/* Season pill tabs (quick switch) */}
            <div className="mb-5 flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {show.seasons.map((s) => (
                <button
                  key={s.season_number}
                  onClick={() => setSelectedSeason(s.season_number)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
                    selectedSeason === s.season_number
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-surface text-text-muted hover:bg-surface-light hover:text-white"
                  }`}
                >
                  S{s.season_number}
                </button>
              ))}
            </div>

            {/* Episodes grid */}
            {epLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-28 w-full animate-shimmer rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {episodes.map((ep) => {
                  const isActive = selectedEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.episode_number}
                      onClick={() => playEpisode(ep.episode_number)}
                      className={`group flex w-full items-start gap-3 overflow-hidden rounded-xl border p-0 text-start transition-all active:scale-[0.98] ${
                        isActive
                          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                          : "border-surface-border bg-surface hover:border-primary/30 hover:bg-surface-light"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative h-24 w-40 shrink-0 overflow-hidden bg-surface-light sm:h-28 sm:w-48">
                        {ep.still ? (
                          <Image src={ep.still} alt={ep.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 640px) 160px, 192px" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-surface to-surface-light text-text-muted">
                            <span className="text-2xl font-black opacity-20">{ep.episode_number}</span>
                          </div>
                        )}
                        {/* Play overlay */}
                        <div className={`absolute inset-0 flex items-center justify-center transition-all ${isActive ? "bg-primary/30" : "bg-black/0 group-hover:bg-black/40"}`}>
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isActive ? "scale-100 bg-primary text-white" : "scale-0 bg-white/80 text-black group-hover:scale-100"}`}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                              <polygon points="5,3 19,12 5,21" />
                            </svg>
                          </div>
                        </div>
                        {/* Episode number badge */}
                        <span className={`absolute start-1.5 top-1.5 flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-bold ${isActive ? "bg-primary text-white" : "bg-black/60 text-white/80"}`}>
                          {ep.episode_number}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex min-w-0 flex-1 flex-col justify-center py-2.5 pe-3">
                        <p className={`truncate text-sm font-semibold ${isActive ? "text-primary" : "text-white"}`}>
                          {ep.name}
                        </p>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-text-muted">
                          {ep.runtime && <span>{ep.runtime} {t("minuteShort")}</span>}
                          {ep.vote_average > 0 && (
                            <span className="flex items-center gap-0.5 text-yellow-400">★ {ep.vote_average.toFixed(1)}</span>
                          )}
                        </div>
                        {ep.overview && (
                          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-text-muted">
                            {ep.overview}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Show Info */}
        {show && (
          <ShowInfo show={show} t={t} isAr={isAr} />
        )}
      </div>
    </div>
  );
}

function ShowInfo({
  show,
  t,
  isAr,
}: {
  show: ShowData;
  t: (key: TranslationKey) => string;
  isAr: boolean;
}) {
  return (
    <div className="mt-8 space-y-6">
      {/* Title + Rating */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{show.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {show.genres.slice(0, 3).map((g) => (
              <span key={g} className="rounded-full border border-surface-border bg-surface px-3 py-1 text-xs text-text-secondary">
                {g}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-2.5">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#facc15" className="shrink-0">
            <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" />
          </svg>
          <div>
            <p className="text-lg font-bold leading-none text-yellow-400">{show.vote_average.toFixed(1)}</p>
            <p className="text-[10px] text-text-muted">{show.vote_count.toLocaleString()} {t("votes")}</p>
          </div>
        </div>
      </div>

      {/* Poster + Synopsis */}
      <div className="flex gap-6">
        {show.poster_path && (
          <div className="hidden shrink-0 sm:block">
            <div className="relative h-72 w-48 overflow-hidden rounded-lg border border-surface-border shadow-lg">
              <Image src={show.poster_path} alt={show.name} fill className="object-cover" sizes="192px" />
            </div>
          </div>
        )}
        <div className="flex-1">
          {show.overview && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-white">
                <div className="h-5 w-1 rounded-full bg-primary" />
                {t("movieStory")}
              </h2>
              <p className="text-sm leading-7 text-text-secondary">{show.overview}</p>
            </div>
          )}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoItem label={t("releaseDate")} value={show.first_air_date} />
            <InfoItem label={t("genre")} value={show.genres.join("، ")} />
            <InfoItem label={t("seasons")} value={String(show.number_of_seasons)} />
          </div>
        </div>
      </div>

      {/* Cast */}
      {show.cast.length > 0 && (
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
            <div className="h-5 w-1 rounded-full bg-primary" />
            {t("cast")}
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {show.cast.map((person) => (
              <div key={person.name} className="flex w-24 shrink-0 flex-col items-center gap-2">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-surface-border bg-surface">
                  {person.photo ? (
                    <Image src={person.photo} alt={person.name} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-muted">
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium leading-tight text-white">{person.name}</p>
                  <p className="mt-0.5 text-[10px] leading-tight text-text-muted">{person.character}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface/50 p-3">
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-text-muted">{label}</p>
        <p className="truncate text-sm text-white">{value || "—"}</p>
      </div>
    </div>
  );
}
